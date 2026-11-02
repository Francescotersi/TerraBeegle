using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Backend_TerraBeegle.Services;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IPasswordHasher<User> passwordHasher,
                            ITokenService tokenService, IEmailVerificationService emailVerificationService, 
                            ILogger<AuthController> logger) : ControllerBase
{
    [EnableRateLimiting("register")]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO dto)
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
        
        // Creating the user with a hashed password
        var user = dto.Adapt<User>();
        user.Email = email;
        user.Username = username;
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
        
        return CreatedAtAction(nameof(UserController.GetById), "User", new { id = user.Id },  new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
    }
    
    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO dto)
    {
        var email = dto.EmailOrUsername.Trim().ToLowerInvariant();
        var username = dto.EmailOrUsername.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email || u.Username == username);
        if(user == null)
            return Unauthorized("Invalid credentials.");

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials.");
        
        if (!user.EmailVerified)
            return Unauthorized("Account not verified. Please check your email for the verification token.");

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials.");

        string token = tokenService.CreateToken(user);
        return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
    }

	[EnableRateLimiting("verify-email")]
	[HttpPost("verify-email")]
	public async Task<IActionResult> VerifyEmail(VerifyEmailDTO dto)
	{
		var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
		
		if(!long.TryParse(sub, out var tokenId))
			return Unauthorized("Invalid token.");

		var user = await db.Users.FindAsync(tokenId);
        if(user is null)
            return NotFound();

		if(user.EmailVerified)
			return Conflict("Already verified.");

		if(user.EmailVerificationCodeHash is null || user.EmailVerificationCodeExpiration < DateTime.UtcNow)
			return BadRequest("The code has expired. Ask for a new one.");
		
		if(user.EmailVerificationAttempts >= 5)
			return BadRequest("Too many attempts. Ask for a new code.");

		var hash = emailVerificationService.HashCode(dto.Code);
		if(CryptographicOperations.FixedTimeEquals(Convert.FromHexString(user.EmailVerificationCodeHash), Convert.FromHexString(hash)))
		{
			user.EmailVerified = true;
			user.EmailVerificationAttempts = 0;
			user.EmailVerificationCodeHash = null;
			user.EmailVerificationCodeExpiration = null;
			await db.SaveChangesAsync();

			return Ok();
		}

		user.EmailVerificationAttempts++;
		await db.SaveChangesAsync();

		return BadRequest("Invalid code.");
	}
	
	[EnableRateLimiting("resend-email")]
	[HttpPost("resend-email")]
	public async Task<IActionResult> ResendEmail()
	{
		var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
		
		if(!long.TryParse(sub, out var tokenId))
			return Unauthorized("Invalid token.");

		var user = await db.Users.FindAsync(tokenId);
        if(user is null)
            return NotFound();

		if(user.EmailVerified)
			return Conflict("Already verified.");

		var code = emailVerificationService.SetNewCode(user);

		await db.SaveChangesAsync();

		try
		{
			await emailVerificationService.SendCodeAsync(user.Email, code);
		}
		catch(Exception ex)
		{
			logger.LogError(ex, "Error resending verification code to {Email}", user.Email);
			return StatusCode(StatusCodes.Status503ServiceUnavailable, "Failed to send code. Try again later.");
		}

		return Ok("The code has been resent.");
	}
}