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
        
        return CreatedAtAction(nameof(UserController.GetById), "User", new { id = user.Id }, user.Adapt<UserResponseDTO>());
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
	        return StatusCode(StatusCodes.Status403Forbidden, "Email not verified. Please enter the code sent to your email.");

        string token = tokenService.CreateToken(user);
        return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
    }

	[EnableRateLimiting("login")]
	[HttpPost("verify-email")]
	public async Task<ActionResult<AuthResponseDTO>> VerifyEmail(VerifyEmailDTO dto)
	{
		var email = dto.Email.Trim().ToLowerInvariant();
		var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

		// Same answer as a wrong code, so the endpoint cannot be used to find out which emails are registered
		if(user is null)
			return BadRequest("Invalid code.");

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

			// The user has just proven they own the email, so they are logged in directly
			string token = tokenService.CreateToken(user);
			return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
		}

		user.EmailVerificationAttempts++;
		await db.SaveChangesAsync();

		return BadRequest("Invalid code.");
	}
	
	[EnableRateLimiting("resend-email")]
	[HttpPost("resend-email")]
	public async Task<IActionResult> ResendEmail(ResendEmailDTO dto)
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
}