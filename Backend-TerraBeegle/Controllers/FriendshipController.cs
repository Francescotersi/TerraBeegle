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

using Npgsql;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/users/{userId:long}/friendship")]
public class FriendshipController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpGet("{query?}")]
    public async Task<ActionResult<FriendsListDTO>> GetFriendships(long userId, string? query = null)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
     
        //TODO: implement search functionality if query is provided
        var allFriendships = await db.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId)
            .ProjectToType<FriendshipDTO>()
            .ToListAsync();

        var friends = allFriendships
            .Where(f => f.Status == FriendshipStatus.Accepted)
            .ToList();
    
        var friendshipsSent = allFriendships
            .Where(f => f.Status == FriendshipStatus.Pending && f.ReceiverId != userId)
            .ToList();

        var friendshipsReceived = allFriendships
            .Where(f => f.Status == FriendshipStatus.Pending && f.ReceiverId == userId)
            .ToList();

        return Ok(new FriendsListDTO()
        {
            Friends = friends.Adapt<IEnumerable<FriendshipResponseDTO>>(),
            FriendshipsSent = [
                .. friendshipsSent.Select(f => new FriendshipResponseDTO
                {
                    Id = f.Id,
                    SenderId = f.User1Id == f.ReceiverId ? f.User2Id : f.User1Id,
                    ReceiverId = f.ReceiverId,
                    Status = f.Status.ToString(),
                    UpdatedAt = f.UpdatedAt
                })
            ],
            FriendshipsReceived = [
                .. friendshipsReceived.Select(f => new FriendshipResponseDTO
                {
                    Id = f.Id,
                    SenderId = f.User1Id == f.ReceiverId ? f.User2Id : f.User1Id,
                    ReceiverId = f.ReceiverId,
                    Status = f.Status.ToString(),
                    UpdatedAt = f.UpdatedAt
                })
            ]
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<FriendshipResponseDTO>> CreateFriendship(long userId, FriendshipRequestDTO dto)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
        
        if (dto.SenderId != userId)
            return Forbid("SenderId must match the authenticated user's ID.");

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

        return CreatedAtAction(nameof(GetFriendships), new { id = friendship.Id }, friendship.Adapt<FriendshipResponseDTO>());
    }

    [Authorize]
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
            return Forbid("Only the users involved in the friendship can update it.");

        if (friendship.Status != FriendshipStatus.Pending)
            return Forbid("Only pending friendships can be updated.");
        
        if (friendship.ReceiverId != userId)
            return Forbid("Only the receiver can update the friendship status.");
        
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

    [Authorize]
    [HttpDelete("{id:long}")]
    public async Task<ActionResult> DeleteFriendship(long userId, long id)
    {
        if (!IsCurrentUser(userId))
            return Forbid();
        
        var friendship = await db.Friendships.FindAsync(id);
        if (friendship is null)
            return NotFound("Friendship not found.");
        
        if (friendship.Status == FriendshipStatus.Rejected)
            return Forbid("Cannot delete a rejected friendship.");
        
        if (friendship.User1Id != userId && friendship.User2Id != userId)
            return Forbid("Only the users involved in the friendship can delete it.");

        if (friendship.Status == FriendshipStatus.Pending && friendship.ReceiverId == userId)
            return Forbid("Only the sender can delete a pending friendship request.");

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