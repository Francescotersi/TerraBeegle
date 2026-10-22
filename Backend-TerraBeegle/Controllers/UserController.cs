using Backend_TerraBeegle.Models;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetAll()
    {
        // Retrieving all users from the database and projecting them to UserResponseDTO
        var users = await db.Users.ProjectToType<UserResponseDTO>().ToListAsync();
        return users;
    }
    
    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserResponseDTO>> GetById(long id)
    {
        // Searching for the user by ID
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return user.Adapt<UserResponseDTO>();
    }

    
    [HttpPatch("{id:long}")]
    public async Task<ActionResult<UserResponseDTO>> ModifyUser(long id, UpdateUserDTO dto)
    {
        // Patch which does not allow empty string or whitespaces.
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();
        
        if(dto.Username is not null && string.IsNullOrWhiteSpace(dto.Username))
            return BadRequest("Username cannot be empty.");

        if(dto.Name is not null && string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Name cannot be empty.");
        
        if(dto.FamilyName is not null && string.IsNullOrWhiteSpace(dto.FamilyName))
            return BadRequest("Family name cannot be empty.");
        
        // Empty ImageProfile is for removing the picture
        if(dto.ImageProfile is not null && !string.IsNullOrWhiteSpace(dto.ImageProfile) && !IsHttpUrl(dto.ImageProfile.Trim()))
            return BadRequest("Image profile must be a valid http or https URL.");

        if(dto.Theme is not null && !Enum.IsDefined(dto.Theme.Value))
            return BadRequest("Invalid theme.");

        
        if(dto.ImageProfile is not null)
            user.ImageProfile = string.IsNullOrWhiteSpace(dto.ImageProfile) ? null : dto.ImageProfile.Trim();

        if(dto.Theme is not null)
            user.Theme = dto.Theme.Value;
        
        if(dto.Username is not null)
        {
            var username = dto.Username.Trim();
            bool duplicate = await db.Users.AnyAsync(u => u.Username == username && u.Id != id);
            if(duplicate)
                return Conflict("Username already exists.");
            user.Username = username;
        }

        if (dto.Name is not null)
        {
            var name = dto.Name.Trim();
            user.Name = name;
        }
        
        if(dto.FamilyName is not null)
        {
            var familyName = dto.FamilyName.Trim();
            user.FamilyName = familyName;
        }

        await db.SaveChangesAsync();
        
        return user.Adapt<UserResponseDTO>();
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteUser(long id)
    {
        var user = await db.Users.FindAsync(id);
        if(user is null)
            return NotFound();
        
        await db.Friendships.Where(f => f.FriendId == id).ExecuteDeleteAsync();

        db.Users.Remove(user);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static bool IsHttpUrl(string value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
               && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}