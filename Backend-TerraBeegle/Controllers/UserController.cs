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

[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db, IPasswordHasher<User> passwordHasher) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination, [FromQuery] bool includeUnverified = false)
    {
        var totalCount = await db.Users.CountAsync();

        // Retrieving only the users from the requested page and projecting them to UserPublicResponseDTO
        var users = await db.Users
            .Where(u => u.EmailVerified || includeUnverified) // Only return users with confirmed emails, unless 'includeUnverified' is true
            .OrderBy(u => u.Id)
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();

        return Ok(Utils.CreatePagedResponse(
            users,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize })
        ));
    }

    [Authorize]
    [HttpGet("search")]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> Search([FromQuery] string username, [FromQuery] PaginationDTO pagination)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty.");
        }

        var trimmedUsername = username.Trim();
        var totalCount = await db.Users.CountAsync(u => u.Username.StartsWith(trimmedUsername));

        if (totalCount == 0)
        {
            return NotFound("No users found with the specified username.");
        }

        var users = await db.Users
            .Where(u => u.Username.StartsWith(trimmedUsername) && u.EmailVerified) // Only return users with confirmed emails
            .OrderBy(u => u.Username)
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();

        return Ok(Utils.CreatePagedResponse(
            users,
            totalCount,
            pagination,
            page => Url.Action(nameof(Search), new { username, Page = page, pagination.PageSize })
        ));
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<UserPublicResponseDTO>> GetByUsername(string username)
    {
        // Searching for the user by ID
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username && u.EmailVerified); // Only return users with confirmed emails
        if (user is null)
        {
            return NotFound();
        }

        return user.Adapt<UserPublicResponseDTO>();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponseDTO>> GetMe()
    {
        var userId = Utils.GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        } 
            
        var user = await db.Users.FindAsync(userId.Value);
        
        if (user is null)
            return NotFound();
        
        return user.Adapt<UserResponseDTO>();
    }

    [Authorize]
    [HttpPatch]
    public async Task<ActionResult<UserResponseDTO>> ModifyUser([FromBody] UpdateUserDTO dto)
    {
        var userId = Utils.GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        // Patch which does not allow empty string or whitespaces.
        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();
        
        if (dto.Username is not null && string.IsNullOrWhiteSpace(dto.Username))
            ModelState.AddModelError(nameof(dto.Username), "Username cannot be empty.");

        if (dto.Name is not null && string.IsNullOrWhiteSpace(dto.Name))
            ModelState.AddModelError(nameof(dto.Name), "Name cannot be empty.");

        if (dto.FamilyName is not null && string.IsNullOrWhiteSpace(dto.FamilyName))
            ModelState.AddModelError(nameof(dto.FamilyName), "Surname cannot be empty.");

        // Empty ImageProfile is for removing the picture
        if (dto.ImageProfile is not null && !string.IsNullOrWhiteSpace(dto.ImageProfile) 
            && !Utils.IsHttpUrl(dto.ImageProfile.Trim()))
            ModelState.AddModelError(nameof(dto.ImageProfile), "Image profile must be a valid http or https URL.");

        if (dto.Theme is not null && !Enum.IsDefined(dto.Theme.Value))
            ModelState.AddModelError(nameof(dto.Theme), "Invalid theme.");

        // Same format as the automatic validations, with all the field errors at once
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (dto.ImageProfile is not null)
            user.ImageProfile = string.IsNullOrWhiteSpace(dto.ImageProfile) ? null : dto.ImageProfile.Trim();

        if (dto.Theme is not null)
            user.Theme = dto.Theme.Value;
        
        if (dto.Username is not null)
        {
            var username = dto.Username.Trim();
            bool duplicate = await db.Users.AnyAsync(u => u.Username == username && u.Id != userId.Value);
            if (duplicate)
                return Conflict("Username already exists.");
            user.Username = username;
        }

        if (dto.Name is not null)
        {
            var name = dto.Name.Trim();
            user.Name = name;
        }
        
        if (dto.FamilyName is not null)
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

    [Authorize]
    [HttpPatch("password")]
    public async Task<ActionResult> ChangePassword(UpdatePasswordDTO dto)
    {
        var userId = Utils.GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }
        
        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword) == PasswordVerificationResult.Failed)
            return BadRequest("Old password is incorrect.");

        user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
        
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        
        return Ok("Password changed successfully.");
    }

    [Authorize]
    [HttpDelete]
    public async Task<ActionResult> DeleteUser()
    {
        var userId = Utils.GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        if (!Utils.IsCurrentUser(User, userId.Value))
            return Forbid();
        
        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();
        
        // Friendships and users are deleted at the same time using a transaction or they are not deleted at all
        await using var transaction = await db.Database.BeginTransactionAsync();
        
        await db.Friendships.Where(f => f.User1Id == userId.Value || f.User2Id == userId.Value).ExecuteDeleteAsync();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        
        await transaction.CommitAsync();

        return NoContent();
    }
}