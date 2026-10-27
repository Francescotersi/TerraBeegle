using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Backend_TerraBeegle.Services;
using Microsoft.AspNetCore.RateLimiting;
using Npgsql;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IPasswordHasher<User> passwordHasher, ITokenService tokenService) : ControllerBase
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
            return Problem(detail: "Email already exists.", statusCode: StatusCodes.Status409Conflict);
        if(UsernameExists)
            return Problem(detail: "Username already exists.", statusCode: StatusCodes.Status409Conflict);
        
        // Creating the user with a hashed password
        var user = dto.Adapt<User>();
        user.Email = email;
        user.Username = username;
        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
        
        // Adding the user to the database and saving changes
        db.Users.Add(user);
        
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } pg)
        {
            // Checks if the unique constraint was violated
            return pg.ConstraintName == "IX_Users_Email"
                ? Problem(detail: "Email already exists.", statusCode: StatusCodes.Status409Conflict)
                : Problem(detail: "Username already exists.", statusCode: StatusCodes.Status409Conflict);
        }

        string token = tokenService.CreateToken(user);
        
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
            return Problem(detail: "Invalid credentials.", statusCode: StatusCodes.Status401Unauthorized);

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Problem(detail: "Invalid credentials.", statusCode: StatusCodes.Status401Unauthorized);

        string token = tokenService.CreateToken(user);
        return Ok(new AuthResponseDTO { Token = token, User = user.Adapt<UserResponseDTO>() });
    }
}