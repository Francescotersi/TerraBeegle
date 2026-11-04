using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;                 // pentru FindFirstValue
using Microsoft.IdentityModel.JsonWebTokens;  // pentru JwtRegisteredClaimNames
using Microsoft.AspNetCore.Identity;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Enums;
using Npgsql;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db, IPasswordHasher<User> passwordHasher, IEmailVerificationService emailVerificationService, ILogger<UserController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination)
    {
        var totalCount = await db.Users.CountAsync();

        // Retrieving only the users from the requested page and projecting them to UserPublicResponseDTO
        var users = await db.Users
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

    [HttpGet("search")]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> Search([FromQuery] string username, [FromQuery] PaginationDTO pagination)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty.");
        }

        var trimmedUsername = username.Trim();

        var totalCount = await db.Users.CountAsync(u => u.Username.Contains(trimmedUsername));

        if (totalCount == 0)
        {
            return NotFound("No users found with the specified username.");
        }

        var users = await db.Users
            .Where(u => u.Username.Contains(trimmedUsername) && u.EmailVerified) // Only return users with confirmed emails
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
        if(!Utils.IsCurrentUser(User, id))
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
        if(dto.ImageProfile is not null && !string.IsNullOrWhiteSpace(dto.ImageProfile) 
            && !Utils.IsHttpUrl(dto.ImageProfile.Trim()))
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
        if(!Utils.IsCurrentUser(User, id))
            return Forbid();
        
        var user = await db.Users.FindAsync(id);
        if(user is null)
            return NotFound();

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword) == PasswordVerificationResult.Failed)
            return BadRequest("Old password is incorrect.");

        user.PasswordHash = passwordHasher.HashPassword(user, dto.NewPassword);
        
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        
        return Ok("Password changed successfully.");
    }
	
	[HttpPatch("{id:long}/email")]
	public async Task<ActionResult> ChangeEmail(long id, UpdateEmailDTO dto)
	{
		if(!Utils.IsCurrentUser(User, id))
            return Forbid();

		var user = await db.Users.FindAsync(id);
        if(user is null)
            return NotFound();

		if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return BadRequest("Password is incorrect.");

		dto.Email = dto.Email.Trim().ToLowerInvariant();

		if(dto.Email == user.Email)
			return BadRequest("New email is the same as the old one.");
		
		bool EmailExists = await db.Users.AnyAsync(u => u.Email == dto.Email);
		if(EmailExists)
			return Conflict("Email already exists.");

		user.PendingEmail = dto.Email;
		user.ForgotPasswordRequested = false;
		var code = emailVerificationService.SetNewCode(user);
		user.UpdatedAt = DateTime.UtcNow;
		await db.SaveChangesAsync();
		
		try{
			await emailVerificationService.SendCodeAsync(user.PendingEmail, code);
		}
		catch(Exception ex){
			logger.LogError(ex, "Error sending email change code to {Email}", user.PendingEmail);
			return StatusCode(500, "Could not send the code. Try again.");
		}

		return Ok("Verification code sent to the new email.");
	}

	[HttpPost("{id:long}/email/confirm")]
	public async Task<ActionResult> ConfirmNewEmail(long id, ConfirmEmailDTO dto)
	{
		if (!Utils.IsCurrentUser(User, id))
        return Forbid();

    	var user = await db.Users.FindAsync(id);
    	if (user is null)
        	return NotFound();

    	if (user.PendingEmail is null)
        	return BadRequest("No email change in progress.");

    	var result = emailVerificationService.VerifyCode(user, dto.Code);

    	if (result != CodeVerificationResult.Valid)
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

    	user.Email = user.PendingEmail;
    	user.PendingEmail = null;
    	user.UpdatedAt = DateTime.UtcNow;

    	try
    	{
        	await db.SaveChangesAsync();
    	}
    	catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
    	{
        	return Conflict("Email already exists.");
    	}

    	return Ok("Email changed successfully.");
	}
	
    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteUser(long id)
    {
        if(!Utils.IsCurrentUser(User, id))
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
}