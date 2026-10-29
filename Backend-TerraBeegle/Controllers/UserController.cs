using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;                 // pentru FindFirstValue
using Microsoft.IdentityModel.JsonWebTokens;  // pentru JwtRegisteredClaimNames
using Microsoft.AspNetCore.Identity;
using Npgsql;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db, IPasswordHasher<User> passwordHasher) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination)
    {
        // Ordering is required, otherwise Postgres can return the rows in a different order on each page
        var query = db.Users.OrderBy(u => u.Id);

        var totalCount = await query.CountAsync();

        // Retrieving only the users from the requested page and projecting them to UserPublicResponseDTO
        var users = await query
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();

        return new PagedResponseDTO<UserPublicResponseDTO>
        {
            Items = users,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
            TotalPages = (totalCount + pagination.PageSize - 1) / pagination.PageSize
        };
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserPublicResponseDTO>>> Search([FromQuery] string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty.");
        }

        var trimmedUsername = username.Trim();
        var users = await db.Users
            .Where(u => u.Username.Contains(trimmedUsername))
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();
        return users;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserPublicResponseDTO>> GetById(long id)
    {
        // Searching for the user by ID
        var user = await db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return user.Adapt<UserPublicResponseDTO>();
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDTO>> GetMe()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if(!long.TryParse(sub, out var tokenUserId))
            return Unauthorized();
            
        var user = await db.Users.FindAsync(tokenUserId);
        
        if(user is null)
            return NotFound();
        
        return user.Adapt<UserResponseDTO>();
    }

    [HttpPatch("{id:long}")]
    public async Task<ActionResult<UserResponseDTO>> ModifyUser(long id, UpdateUserDTO dto)
    {
        if(!IsCurrentUser(id))
            return Forbid();

        // Patch which does not allow empty string or whitespaces.
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();
        
        if(dto.Username is not null && string.IsNullOrWhiteSpace(dto.Username))
            ModelState.AddModelError(nameof(dto.Username), "Username cannot be empty.");

        if(dto.Name is not null && string.IsNullOrWhiteSpace(dto.Name))
            ModelState.AddModelError(nameof(dto.Name), "Name cannot be empty.");

        if(dto.FamilyName is not null && string.IsNullOrWhiteSpace(dto.FamilyName))
            ModelState.AddModelError(nameof(dto.FamilyName), "Surname cannot be empty.");

        // Empty ImageProfile is for removing the picture
        if(dto.ImageProfile is not null && !string.IsNullOrWhiteSpace(dto.ImageProfile) && !IsHttpUrl(dto.ImageProfile.Trim()))
            ModelState.AddModelError(nameof(dto.ImageProfile), "Image profile must be a valid http or https URL.");

        if(dto.Theme is not null && !Enum.IsDefined(dto.Theme.Value))
            ModelState.AddModelError(nameof(dto.Theme), "Invalid theme.");

        // Same format as the automatic validations, with all the field errors at once
        if(!ModelState.IsValid)
            return ValidationProblem(ModelState);

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

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return Conflict("Username already exists.");
        }
        
        return user.Adapt<UserResponseDTO>();
    }

    [HttpPatch("{id:long}/password")]
    public async Task<ActionResult> ChangePassword(long id, UpdatePasswordDTO dto)
    {
        if(!IsCurrentUser(id))
            return Forbid();
        
        var user = await db.Users.FindAsync(id);
        if(user is null)
            return NotFound();

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword) == PasswordVerificationResult.Failed)
            return Unauthorized("Old password is incorrect.");

        user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
        
        return Ok("Password changed successfully.");
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteUser(long id)
    {
        if(!IsCurrentUser(id))
            return Forbid();
        
        var user = await db.Users.FindAsync(id);
        if(user is null)
            return NotFound();
        
        // Friendships and users are deleted at the same time using a transaction or they are not deleted at all
        await using var transaction = await db.Database.BeginTransactionAsync();
        
        await db.Friendships.Where(f => f.User1Id == id || f.User2Id == id).ExecuteDeleteAsync();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        
        await transaction.CommitAsync();

        return NoContent();
    }

    private bool IsCurrentUser(long id)
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }

    private static bool IsHttpUrl(string value)
    {
        return Uri.TryCreate(value, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}