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
        bool EmailExists = await db.Users.AnyAsync(u => u.Email == dto.Email);
        bool UsernameExists = await db.Users.AnyAsync(u => u.Username == dto.Username);

        if(EmailExists)
            return Conflict("Email already exists.");
        if(UsernameExists)
            return Conflict("Username already exists.");
        
        // Creating the user with a hashed password
        var user = dto.Adapt<User>();
        user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
        
        // Adding the user to the database and saving changes
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(UserController.GetById), "User", new { id = user.Id},  Ok(user.Adapt<UserResponseDTO>()));
    }
}