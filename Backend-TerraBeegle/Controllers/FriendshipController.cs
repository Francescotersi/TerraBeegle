using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;  
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Services;
using Backend_TerraBeegle.Enums;
using System.Linq.Expressions;

using Npgsql;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[Route("api/users/{userId:long}/friendship")]
public class FriendshipController(AppDbContext db) : ControllerBase
{
    // GET api/users/{userId}/friendship?search=friends|sent|received (without search => friends)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FriendshipResponseDTO>>> GetFriendships(long userId, [FromQuery] string search = "friends")
    {
        if (!IsCurrentUser(userId))
            return Forbid();

        Expression<Func<Friendship, bool>>? filter = search.ToLowerInvariant() switch
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
            return BadRequest("Invalid query parameter. Allowed values are 'friends', 'sent', or 'received'.");

        var friendships = await db.Friendships
            .Where(filter)
            .Select( f => new FriendshipResponseDTO 
            {
                Id = f.Id,
                SenderId = f.User1Id == f.ReceiverId ? f.User2Id : f.User1Id,
                ReceiverId = f.ReceiverId,
                Status = f.Status.ToString(),
                UpdatedAt = f.UpdatedAt
            })
            .ToListAsync();

        return friendships;
    }

    [HttpPost]
    public async Task<ActionResult<FriendshipResponseDTO>> CreateFriendship(long userId, FriendshipRequestDTO dto)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
        
        if (dto.SenderId != userId)
            return BadRequest("SenderId must match the authenticated user's ID.");

        if (dto.SenderId == dto.ReceiverId)
            return BadRequest("Cannot create friendship with oneself.");

        var senderExists = await db.Users.AnyAsync(u => u.Id == dto.SenderId);
        var receiverExists = await db.Users.AnyAsync(u => u.Id == dto.ReceiverId);

        if (!senderExists)
            return NotFound("Sender user not found.");

        if (!receiverExists)
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

        var createdFriendship = friendship.Adapt<Friendship, FriendshipResponseDTO>();
        createdFriendship.SenderId = dto.SenderId;

        return CreatedAtAction(nameof(GetFriendships), new { userId, search = "sent" }, createdFriendship);
    }

    [HttpPatch]
    public async Task<ActionResult<FriendshipDTO>> UpdateFriendship(long userId, FriendshipDTO dto)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
        
        if (dto.Status != FriendshipStatus.Accepted && dto.Status != FriendshipStatus.Rejected)
            return BadRequest("Invalid status. Only 'Accepted' or 'Rejected' are allowed.");

        var friendship = await db.Friendships.FindAsync(dto.Id);
        if (friendship is null)
            return NotFound("Friendship not found.");

        if (friendship.User1Id != userId && friendship.User2Id != userId)
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

        return Ok(friendship.Adapt<FriendshipDTO>());
    }

    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteFriendship(long userId, long id)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
        
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

    private bool IsCurrentUser(long id)
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }
}