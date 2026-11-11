using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Enums;
using Microsoft.AspNetCore.RateLimiting;
using Backend_TerraBeegle.RateLimiting;
using Npgsql;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IPasswordHasher<User> passwordHasher,
    ITokenService tokenService, IEmailVerificationService emailVerificationService, 
    ITwoFactorService twoFactorService, ILogger<AuthController> logger) : ControllerBase
{
    // Creates an account and emails a verification code
    [EnableRateLimiting(RateLimitPolicies.Register)]
    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDTO>> Register(RegisterDTO dto)
    {
        // Checking if the email or username already exists
        var email = dto.Email.Trim().ToLowerInvariant();
        var username = dto.Username.Trim();

        bool EmailExists = await db.Users.AnyAsync(u => u.Email == email);
        bool UsernameExists = await db.Users.AnyAsync(u => u.Username == username);

        if(EmailExists)
            return Conflict("Email already exists.");
        if(UsernameExists)
            return Conflict("Username already exists.");

        var name = dto.Name.Trim();
        var familyName = dto.FamilyName.Trim();
        
        // Creating the user with a hashed password
        var user = dto.Adapt<User>();
        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
        
        // Adding the user to the database and saving changes
        var code = emailVerificationService.SetNewCode(user);
        db.Users.Add(user);
        
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg)
        {
            // Checks if the unique constraint was violated
            return pg.ConstraintName == "IX_Users_Email"
                ? Conflict("Email already exists.")
                : Conflict("Username already exists.");
        }

        try
        {
            await emailVerificationService.SendCodeAsync(user.Email, code, EmailCodePurpose.Register);
        }
        catch(Exception ex)
        {
            logger.LogError(ex, "Error sending verification code to {Email}", user.Email);
        }
        
        return CreatedAtAction(nameof(UserController.GetByUsername), "User", new { username = user.Username }, user.Adapt<UserResponseDTO>());
    }
    
    // Logs in; returns a JWT, or a 2FA challenge if 2FA is on
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO dto)
    {
        var email = dto.EmailOrUsername.Trim().ToLowerInvariant();
        var username = dto.EmailOrUsername.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email || u.Username == username);

        if (user is null || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials.");
        
        // The code is checked only after the password, so only the owner of the account can use up its attempts
        if (!user.EmailVerified)
        {
            if (dto.Code is null)
                return StatusCode(StatusCodes.Status403Forbidden, "Email not verified. Please enter the code sent to your email.");

            var result = emailVerificationService.VerifyCode(user, dto.Code);

            // Saved in every case: a wrong code increases the attempts, a correct one marks the email as verified
            await db.SaveChangesAsync();

            if (result != CodeVerificationResult.Valid)
            {
                return result switch
                {
                    CodeVerificationResult.Expired => BadRequest("The code has expired. Ask for a new one."),
                    CodeVerificationResult.TooManyAttempts => BadRequest("Too many attempts. Ask for a new code."),
                    CodeVerificationResult.Invalid => BadRequest("Invalid code."),
                    _ => throw new InvalidOperationException("Unexpected code verification result.")
                };
            }
        }

        if (!user.TwoFactorEnabled)
        {
	        string token = tokenService.CreateToken(user);
	        return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
        }
        
        var (challenge, challengeToken, code) = twoFactorService.CreateChallenge(user);

        if (user.LoginChallenge is null)
        {
            db.LoginChallenges.Add(challenge);
        }
        user.LoginChallenge = challenge;

        await db.SaveChangesAsync();

        try
        {
	        await twoFactorService.SendCodeAsync(user.Email, code);
        }
        catch (Exception ex)
        {
	        logger.LogError(ex, "Failed to send 2FA challenge to {Email}", user.Email);
        }
        return Ok(new AuthResponseDTO { Requires2FA = true, ChallengeToken = challengeToken });
    }

    // Finishes a 2FA login with the emailed code and returns a JWT
    [EnableRateLimiting(RateLimitPolicies.LoginTwoFactor)]
    [HttpPost("login/2fa")]
    public async Task<ActionResult<AuthResponseDTO>> LoginTwoFactor(TwoFactorLoginDTO dto)
    {
        var tokenHash = twoFactorService.HashToken(dto.ChallengeToken);
        var challenge = await db.LoginChallenges
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.TokenHash == tokenHash);

        if (challenge is null)
            return Unauthorized("Login expired. Please log in again.");

        var result = twoFactorService.VerifyChallenge(challenge, dto.Code);

        if (result == CodeVerificationResult.Invalid)
        {
            await db.SaveChangesAsync();
            return BadRequest("Invalid code. Please try again.");
        }

        if (result != CodeVerificationResult.Valid)
        {
            db.LoginChallenges.Remove(challenge);
            await db.SaveChangesAsync();

            return Unauthorized(result == CodeVerificationResult.TooManyAttempts
                ? "Too many attempts. Please log in again."
                : "Login expired. Please log in again.");
        }

        db.LoginChallenges.Remove(challenge);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Unauthorized("Login expired. Please log in again.");
        }

        string token = tokenService.CreateToken(challenge.User);
        return Ok(new AuthResponseDTO { Token = token, User = challenge.User.Adapt<UserResponseDTO>() });
    }

    // Sends a new 2FA code for an active login challenge
    [EnableRateLimiting(RateLimitPolicies.LoginTwoFactorResend)]
    [HttpPost("login/2fa/resend")]
    public async Task<IActionResult> ResendTwoFactorCode(TwoFactorResendDTO dto)
    {
        var tokenHash = twoFactorService.HashToken(dto.ChallengeToken);
        var challenge = await db.LoginChallenges
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.TokenHash == tokenHash);

        if (challenge is null)
            return Unauthorized("Login expired. Please log in again.");

        if (challenge.TokenExpiration < DateTime.UtcNow)
        {
            db.LoginChallenges.Remove(challenge);
            await db.SaveChangesAsync();
            return Unauthorized("Login expired. Please log in again.");
        }

        var code = twoFactorService.RenewCode(challenge);
        await db.SaveChangesAsync();

        try
        {
            await twoFactorService.SendCodeAsync(challenge.User.Email, code);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error resending 2FA code to {Email}", challenge.User.Email);
        }

        return Ok("A new code has been sent to your email.");
    }

	// Sends a new email verification code
	[EnableRateLimiting(RateLimitPolicies.ResendEmail)]
	[HttpPost("resend-email")]
	public async Task<IActionResult> ResendEmail(SendEmailDTO dto)
	{
		// The same answer in every case, so the endpoint cannot be used to find out which emails are registered
		const string message = "If the account exists and is not verified, a new code has been sent.";

		var email = dto.Email.Trim().ToLowerInvariant();
		var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

		if(user is null || user.EmailVerified)
			return Ok(message);

		var code = emailVerificationService.SetNewCode(user);

		await db.SaveChangesAsync();

		try
		{
			await emailVerificationService.SendCodeAsync(user.Email, code, EmailCodePurpose.ResendVerification);
		}
		catch(Exception ex)
		{
			logger.LogError(ex, "Error resending verification code to {Email}", user.Email);
		}

		return Ok(message);
	}

	// Emails a password reset code
	[EnableRateLimiting(RateLimitPolicies.ForgotPasswordRequest)]
	[HttpPost("forgot-password-request")]
	public async Task<IActionResult> ForgotPasswordRequest(SendEmailDTO dto)
	{
		const string message = "If the account exists, a code has been sent to reset the password.";

		var email = dto.Email.Trim().ToLowerInvariant();
		var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

		if(user is null)
			return Ok(message);

        user.ForgotPasswordRequested = true;
		user.PendingEmail = null;
		var code = emailVerificationService.SetNewCode(user);

		await db.SaveChangesAsync();

		try
		{
			await emailVerificationService.SendCodeAsync(user.Email, code, EmailCodePurpose.ForgotPassword);
		}
		catch(Exception ex)
		{
			logger.LogError(ex, "Error sending password reset code to {Email}", user.Email);
		}

		return Ok(message);
	}

    // Resets the password using the emailed code
    [EnableRateLimiting(RateLimitPolicies.ForgotPassword)]
    [HttpPatch("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDTO dto)
    {
        var email = dto.EmailOrUsername.Trim().ToLowerInvariant();
        var username = dto.EmailOrUsername.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email || u.Username == username);

        if(user is null || !user.ForgotPasswordRequested)
            return Ok("Invalid Credentials.");

        var result = emailVerificationService.VerifyCode(user, dto.Code);

        if(result != CodeVerificationResult.Valid)
        {
            await db.SaveChangesAsync();

            return result switch
            {
                CodeVerificationResult.Expired => BadRequest("The code has expired. Ask for a new one."),
                CodeVerificationResult.TooManyAttempts => BadRequest("Too many attempts. Ask for a new code."),
                CodeVerificationResult.Invalid => BadRequest("Invalid code."),
                _ => throw new InvalidOperationException("Unexpected code verification result.")
            };
        }

        user.ForgotPasswordRequested = false;
        user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
        await db.SaveChangesAsync();

        return Ok("Password has been reset successfully.");
    }
}