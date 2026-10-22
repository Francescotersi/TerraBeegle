using Backend_TerraBeegle.Models;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity; 

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IPasswordHasher<User> passwordHasher) : ControllerBase
{
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
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(UserController.GetById), "User", new { id = user.Id},  user.Adapt<UserResponseDTO>());
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponseDTO>> Login(LoginDTO dto)
    {
        var email = dto.EmailOrUsername.Trim().ToLowerInvariant();
        var username = dto.EmailOrUsername.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email || u.Username == username);
        if(user == null)
            return Unauthorized("Invalid credentials.");
        
        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials.");

        return Ok(user.Adapt<UserResponseDTO>());
    }
}