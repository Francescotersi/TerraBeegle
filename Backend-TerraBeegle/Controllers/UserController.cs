using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;                 // for FindFirstValue
using Microsoft.IdentityModel.JsonWebTokens;  // for JwtRegisteredClaimNames
using Microsoft.AspNetCore.Identity;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Enums;
using Npgsql;
using Mapster;
using Backend_TerraBeegle.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using static Backend_TerraBeegle.Utils;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(AppDbContext db, IPasswordHasher<User> passwordHasher, IEmailVerificationService emailVerificationService, ILogger<UserController> logger) : ControllerBase
{
    // Lists verified users, one page at a time
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination)
    {
        // One filter for both the count and the page, so TotalCount always matches the list.
        // Only users with confirmed emails, like Search and GetByUsername: an unverified account cannot log in
        // and is deleted after 2 days, so it is hidden from the other users everywhere
        var query = db.Users.Where(u => u.EmailVerified);

        var totalCount = await query.CountAsync();

        // Retrieving only the users from the requested page and projecting them to UserPublicResponseDTO
        var users = await query
            .OrderBy(u => u.Id)
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();

        return Ok(CreatePagedResponse(
            users,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize })
        ));
    }

    // Finds users whose username starts with the given text
    [Authorize]
    [HttpGet("search")]
    public async Task<ActionResult<PagedResponseDTO<UserPublicResponseDTO>>> Search([FromQuery] string username, [FromQuery] PaginationDTO pagination)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty.");
        }

        // Only users with confirmed emails
        var term = username.Trim();
        var query = db.Users.Where(u => EF.Functions.ILike(u.Username, $"{term}%") && u.EmailVerified); // Case-insensitive: "vlad" finds "Vlad".

        // No 404 when nothing is found: an empty list (200) is a normal result for a search
        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.Username)
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<UserPublicResponseDTO>()
            .ToListAsync();

        return Ok(CreatePagedResponse(
            users,
            totalCount,
            pagination,
            page => Url.Action(nameof(Search), new { username, Page = page, pagination.PageSize })
        ));
    }

    // Returns the public profile of a user
    [HttpGet("{username}")]
    public async Task<ActionResult<UserPublicResponseDTO>> GetByUsername(string username)
    {
        // Searching for the user by username
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username && u.EmailVerified); // Only return users with confirmed emails
        if (user is null)
        {
            return NotFound();
        }

        return user.Adapt<UserPublicResponseDTO>();
    }

    // Returns the full profile of the logged-in user
    [Authorize]
    [HttpGet("{username}/profile")]
    public async Task<ActionResult<UserResponseDTO>> GetProfile(string username)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        } 
            
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value && u.Username == username && u.EmailVerified);
        
        if (user is null)
            return NotFound();
        
        return user.Adapt<UserResponseDTO>();
    }

    // Updates only the profile fields that were sent
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    [HttpPatch]
    public async Task<ActionResult<UserResponseDTO>> ModifyUser([FromBody] UpdateUserDTO dto)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var user = await db.Users.FindAsync(userId.Value);
        if (user is null || !user.EmailVerified) // Only allow modifications for verified users
            return NotFound();

        // Patch which does not allow empty string or whitespaces.
        if (dto.Username is not null && string.IsNullOrWhiteSpace(dto.Username))
            ModelState.AddModelError(nameof(dto.Username), "Username cannot be empty.");

        if (dto.Name is not null && string.IsNullOrWhiteSpace(dto.Name))
            ModelState.AddModelError(nameof(dto.Name), "Name cannot be empty.");

        if (dto.FamilyName is not null && string.IsNullOrWhiteSpace(dto.FamilyName))
            ModelState.AddModelError(nameof(dto.FamilyName), "Surname cannot be empty.");

        // Empty ImageProfile is for removing the picture
        if (dto.ImageProfile is not null && !string.IsNullOrWhiteSpace(dto.ImageProfile) 
            && !IsHttpUrl(dto.ImageProfile.Trim()))
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

    // Changes the password after checking the old one
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.ChangePassword)]
    [HttpPatch("password")]
    public async Task<ActionResult> ChangePassword(UpdatePasswordDTO dto)
    {
        var userId = GetCurrentUserId(User);
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
    
    // Starts an email change by sending a code to the new address
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.ChangeEmail)]
    [HttpPatch("email")]
    public async Task<ActionResult> ChangeEmail(UpdateEmailDTO dto)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }
        
        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();

        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return BadRequest("Password is incorrect.");

        var email = dto.Email.Trim().ToLowerInvariant();

        if(email == user.Email)
            return BadRequest("New email is the same as the old one.");
        
        bool EmailExists = await db.Users.AnyAsync(u => u.Email == email);
        if(EmailExists)
            return Conflict("Email already exists.");

		user.PendingEmail = dto.Email;
		user.ForgotPasswordRequested = false;
		var code = emailVerificationService.SetNewCode(user);
		user.UpdatedAt = DateTime.UtcNow;
		await db.SaveChangesAsync();
		
		try{
			await emailVerificationService.SendCodeAsync(user.PendingEmail, code, EmailCodePurpose.ChangeEmail);
		}
		catch(Exception ex){
			logger.LogError(ex, "Error sending email change code to {Email}", user.PendingEmail);
			return StatusCode(500, "Could not send the code. Try again.");
		}

        return Ok("Verification code sent to the new email.");
    }

    // Confirms the new email with the code and saves it
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.ConfirmEmail)]
    [HttpPost("email/confirm")]
    public async Task<ActionResult> ConfirmNewEmail(ConfirmEmailDTO dto)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var user = await db.Users.FindAsync(userId.Value);
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

    // Turns on two-factor authentication
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.TwoFactor)]
    [HttpPost("2fa/enable")]
    public Task<ActionResult> EnableTwoFactor(TwoFactorDTO twoFactorDTO) => HandleTwoFactor(twoFactorDTO, true);

    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.TwoFactor)]
    [HttpPost("2fa/disable")]
    public Task<ActionResult> DisableTwoFactor(TwoFactorDTO twoFactorDTO) => HandleTwoFactor(twoFactorDTO, false);
    
    private async Task<ActionResult> HandleTwoFactor(TwoFactorDTO twoFactorDTO, bool enable)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();

        if(!user.EmailVerified && enable)
            return BadRequest("Verify your email before enabling two-factor authentication.");
        
        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, twoFactorDTO.Password) == PasswordVerificationResult.Failed)
            return BadRequest("Password is incorrect.");

        user.TwoFactorEnabled = enable;
        user.UpdatedAt = DateTime.UtcNow;

        if (!enable)
        {
            var loginChallenge = user.LoginChallenge;
            
            if (loginChallenge is not null)
            {
                db.LoginChallenges.Remove(loginChallenge);
            }
        }

        await db.SaveChangesAsync();

        return Ok($"Two-factor authentication {(enable ? "enabled" : "disabled")} successfully.");
    }

    // Deletes the logged-in user's account
    [Authorize]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    [HttpDelete]
    public async Task<ActionResult> DeleteUser() {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }
        
        var user = await db.Users.FindAsync(userId.Value);
        if (user is null)
            return NotFound();
        
        db.Users.Remove(user);
        await db.SaveChangesAsync();

        return NoContent();
    }
}