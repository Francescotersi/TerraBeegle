using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Enums;
using System.Linq.Expressions;
using Backend_TerraBeegle.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using static Backend_TerraBeegle.Utils;

using Npgsql;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[Route("api/users/friendship")]
public class FriendshipController(AppDbContext db) : ControllerBase
{
    [HttpGet("friends")]
    public Task<ActionResult<PagedResponseDTO<FriendshipResponseDTO>>> 
    GetFriends([FromQuery] PaginationDTO pagination) => GetFriendships(pagination, "friends");

    [HttpGet("received")]
    public Task<ActionResult<PagedResponseDTO<FriendshipResponseDTO>>> 
    GetReceivedFriendships([FromQuery] PaginationDTO pagination) => GetFriendships(pagination, "received");

    [HttpGet("sent")]
    public Task<ActionResult<PagedResponseDTO<FriendshipResponseDTO>>> 
    GetSentFriendships([FromQuery] PaginationDTO pagination) => GetFriendships(pagination, "sent");

    private async Task<ActionResult<PagedResponseDTO<FriendshipResponseDTO>>> GetFriendships([FromQuery] PaginationDTO pagination, string search)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound("User not found.");
        }

        Expression<Func<Friendship, bool>>? filter = search switch
        {
            "friends" => f => (f.User1Id == userId || f.User2Id == userId)
                && f.Status == FriendshipStatus.Accepted,
            "sent" => f => (f.User1Id == userId || f.User2Id == userId)
                && f.Status == FriendshipStatus.Pending && f.ReceiverId != userId,
            "received" => f => (f.User1Id == userId || f.User2Id == userId)
                && f.Status == FriendshipStatus.Pending && f.ReceiverId == userId,
            _ => null
        };

        if (filter is null)
            return BadRequest("Invalid search parameter. Allowed values are: friends, sent, received.");
        
        var totalCount = await db.Friendships.CountAsync(filter);
        var friendships = new List<FriendshipResponseDTO>();
        
        if (totalCount != 0) {
            friendships = await db.Friendships
            .Where(filter)
            .OrderBy(f => f.User1Id == userId ? f.User2.Username : f.User1.Username) // Order by the other user's username
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(f => new FriendshipResponseDTO
            {
                Id = f.Id,
                SenderId = f.User1Id == f.ReceiverId ? f.User2Id : f.User1Id,
                ReceiverId = f.ReceiverId,
                Status = f.Status.ToString(),
                UpdatedAt = f.UpdatedAt,

                // EF translates the navigations to a JOIN with Users, no Include needed
                User = f.User1Id == userId ? f.User2.Adapt<UserPublicResponseDTO>() : f.User1.Adapt<UserPublicResponseDTO>()
            })
            .ToListAsync();
        }

        return Ok(CreatePagedResponse(
            friendships, 
            totalCount, 
            pagination, 
            page => Url.Action(nameof(GetFriendships), new { userId, search, Page = page, pagination.PageSize })
        ));
    }

    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    public async Task<ActionResult<FriendshipResponseDTO>> CreateFriendship(FriendshipCreateDTO dto)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId && u.EmailVerified);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        if (dto.SenderId != userId)
            return BadRequest("SenderId must match the authenticated user's ID.");

        if (userId == dto.ReceiverId)
            return BadRequest("Cannot create friendship with oneself.");

        var senderExists = await db.Users.AnyAsync(u => u.Id == dto.SenderId);
        // Loaded (not only checked), because the response contains the receiver's username and image
        var receiver = await db.Users.FindAsync(dto.ReceiverId);

        if (!senderExists)
            return NotFound("Sender user not found.");

        // An unverified account is hidden from the other users (it cannot log in to answer), so it is "not found"
        if (receiver is null || !receiver.EmailVerified)
            return NotFound("Receiver user not found.");

        var User1Id = Math.Min(dto.SenderId, dto.ReceiverId);
        var User2Id = Math.Max(dto.SenderId, dto.ReceiverId);
        var friendship = await db.Friendships.FirstOrDefaultAsync(f => f.User1Id == User1Id && f.User2Id == User2Id);

        if (friendship != null)
        {
            if (friendship.Status == FriendshipStatus.Rejected && friendship.ReceiverId == userId)
            {
                friendship.ReceiverId = dto.ReceiverId;
                friendship.Status = FriendshipStatus.Pending;
                friendship.CreatedAt = DateTime.UtcNow;
                friendship.UpdatedAt = DateTime.UtcNow;
            }
            else
                return Conflict("Friendship already exists.");
        }
        else {
            friendship = new Friendship {
                User1Id = User1Id,
                User2Id = User2Id,
                ReceiverId = dto.ReceiverId,
                Status = FriendshipStatus.Pending
            };

            db.Friendships.Add(friendship);
        }

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            return Conflict("Cannot create friendship due to database constraints.");
        }

        var createdFriendship = new FriendshipResponseDTO
        {
            Id = friendship.Id,
            SenderId = dto.SenderId,
            ReceiverId = dto.ReceiverId,
            Status = friendship.Status.ToString(),
            UpdatedAt = friendship.UpdatedAt
        };

        return CreatedAtAction(nameof(GetFriendships), new { userId, search = "sent" }, createdFriendship);
    }

    [HttpPatch]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    public async Task<ActionResult<FriendshipResponseDTO>> UpdateFriendship(FriendshipUpdateDTO dto)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId && u.EmailVerified);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        if (dto.Status != FriendshipStatus.Accepted && dto.Status != FriendshipStatus.Rejected)
            return BadRequest("Invalid status. Only 'Accepted' or 'Rejected' are allowed.");

        var friendship = await db.Friendships.FindAsync(dto.Id);
        var user1Id = Math.Min(dto.SenderId, dto.ReceiverId);
        var user2Id = Math.Max(dto.SenderId, dto.ReceiverId);

        if (friendship is null)
            return NotFound("Friendship not found.");

        if (friendship.User1Id != user1Id || friendship.User2Id != user2Id)
            // Forbid("...") expects an authentication scheme name, not a message, so StatusCode(403, ...) is used
            return StatusCode(StatusCodes.Status403Forbidden, "Only the users involved in the friendship can update it.");

        // 409: the user is allowed, but the friendship is not in a state that allows it
        if (friendship.Status != FriendshipStatus.Pending)
            return Conflict("Only pending friendships can be updated.");

        if (friendship.ReceiverId != userId)
            return StatusCode(StatusCodes.Status403Forbidden, "Only the receiver can update the friendship status.");

        friendship.Status = dto.Status.Adapt<FriendshipStatus>();
        friendship.UpdatedAt = DateTime.UtcNow;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            return Conflict("Cannot update friendship due to database constraints.");
        }

        return Ok(new FriendshipResponseDTO {
            Id = friendship.Id,
            SenderId = friendship.User1Id == friendship.ReceiverId ? friendship.User2Id : friendship.User1Id,
            ReceiverId = friendship.ReceiverId,
            Status = friendship.Status.ToString(),
            UpdatedAt = friendship.UpdatedAt,
            User = friendship.User1Id == userId ? friendship.User2.Adapt<UserPublicResponseDTO>() : friendship.User1.Adapt<UserPublicResponseDTO>()
        });
    }

    [HttpDelete("{id:long}")]
    [EnableRateLimiting(RateLimitPolicies.UserWrite)]
    public async Task<ActionResult> DeleteFriendship(long id)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
        {
            return Unauthorized("User ID not found in token.");
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId && u.EmailVerified);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        var friendship = await db.Friendships.FindAsync(id);
        if (friendship is null)
            return NotFound("Friendship not found.");
        
        if (friendship.Status == FriendshipStatus.Rejected)
            return Conflict("Cannot delete a rejected friendship.");

        if (friendship.User1Id != userId && friendship.User2Id != userId)
            return StatusCode(StatusCodes.Status403Forbidden, "Only the users involved in the friendship can delete it.");

        if (friendship.Status == FriendshipStatus.Pending && friendship.ReceiverId == userId)
            return StatusCode(StatusCodes.Status403Forbidden, "Only the sender can delete a pending friendship request.");

        db.Friendships.Remove(friendship);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            return Conflict("Cannot delete friendship due to existing references in the database.");
        }

        return NoContent();
    }
}