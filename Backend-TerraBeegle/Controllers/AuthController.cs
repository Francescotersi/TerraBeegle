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
    ILogger<AuthController> logger) : ControllerBase
{
    [EnableRateLimiting(RateLimitPolicies.Register)]
    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDTO>> Register(RegisterDTO dto)
    {
        // Checking if the email or username already exists
        dto.Email = dto.Email.Trim().ToLowerInvariant();
        dto.Username = dto.Username.Trim();

        bool EmailExists = await db.Users.AnyAsync(u => u.Email == dto.Email);
        bool UsernameExists = await db.Users.AnyAsync(u => u.Username == dto.Username);

        if(EmailExists)
            return Conflict("Email already exists.");
        if(UsernameExists)
            return Conflict("Username already exists.");

        dto.Name = dto.Name.Trim();
        dto.FamilyName = dto.FamilyName.Trim();
        
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
            await emailVerificationService.SendCodeAsync(user.Email, code);
        }
        catch(Exception ex)
        {
            logger.LogError(ex, "Error sending verification code to {Email}", user.Email);
        }
        
        return CreatedAtAction(nameof(UserController.GetByUsername), "User", new { username = user.Username }, user.Adapt<UserResponseDTO>());
    }
    
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO dto)
    {
        var email = dto.EmailOrUsername.Trim().ToLowerInvariant();
        var username = dto.EmailOrUsername.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email || u.Username == username);

        if (user is null)
            return Unauthorized("Invalid credentials.");

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
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

        string token = tokenService.CreateToken(user);
        return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
    }

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
			await emailVerificationService.SendCodeAsync(user.Email, code);
		}
		catch(Exception ex)
		{
			logger.LogError(ex, "Error resending verification code to {Email}", user.Email);
		}

		return Ok(message);
	}

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
			await emailVerificationService.SendCodeAsync(user.Email, code);
		}
		catch(Exception ex)
		{
			logger.LogError(ex, "Error resending verification code to {Email}", user.Email);
		}

		return Ok(message);
	}

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