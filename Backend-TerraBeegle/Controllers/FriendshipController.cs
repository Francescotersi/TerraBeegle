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
        if(!IsCurrentUser(userId))
            return Forbid();

        var friendshipsQuery = db.Friendships
            .Where(f => f.User1Id == userId || f.User2Id == userId);
     
        //TODO: implement search functionality if query is provided

        var friends = await friendshipsQuery
        .Where(f => f.Status == FriendshipStatus.Accepted)
        .ProjectToType<FriendshipDTO>()
        .ToListAsync();
    
        var friendshipsSent = await friendshipsQuery
        .Where(f => f.Status == FriendshipStatus.Pending && f.ReceiverId != userId)
        .ProjectToType<FriendshipDTO>()
        .ToListAsync();

        var friendshipsReceived = await friendshipsQuery
        .Where(f => f.Status == FriendshipStatus.Pending && f.ReceiverId == userId)
        .ProjectToType<FriendshipDTO>()
        .ToListAsync();

        return Ok(new FriendsListDTO()
        {
            Friends = friends,
            FriendshipsSent = friendshipsSent,
            FriendshipsReceived = friendshipsReceived
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<FriendshipResponseDTO>> CreateFriendship(long userId, FriendshipRequestDTO dto)
    {
        if(!IsCurrentUser(userId))
            return Forbid();
        
        if(dto.SenderId != userId)
            return Forbid("SenderId must match the authenticated user's ID.");

        if(dto.SenderId == dto.ReceiverId)
            return BadRequest("Cannot create friendship with oneself.");

        // if(!await db.Users.AnyAsync(u => u.Id == dto.SenderId))
        //     return NotFound("Sender user not found.");
        
        if(!await db.Users.AnyAsync(u => u.Id == dto.ReceiverId))
            return NotFound("Receiver user not found.");

        var User1Id = Math.Min(dto.SenderId, dto.ReceiverId);
        var User2Id = Math.Max(dto.SenderId, dto.ReceiverId);
        var friendshipExists = await db.Friendships.AnyAsync(f => f.User1Id == User1Id && f.User2Id == User2Id);

        if (friendshipExists)
        {
            var existingFriendship = await db.Friendships.FindAsync(User1Id, User2Id);
            if (existingFriendship != null)
            {
                if (existingFriendship.Status != FriendshipStatus.Rejected)
                    return Conflict("Friendship already exists.");
                else if (existingFriendship.Status == FriendshipStatus.Rejected && existingFriendship.ReceiverId == userId)
                {
                    existingFriendship.ReceiverId = dto.ReceiverId;
                    existingFriendship.Status = FriendshipStatus.Pending;
                    existingFriendship.UpdatedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                    return existingFriendship.Adapt<FriendshipResponseDTO>();
                }
            }
        }

        // Create the friendship
        var friendship = new Friendship
        {
            User1Id = User1Id,
            User2Id = User2Id,
            ReceiverId = dto.ReceiverId,
            Status = FriendshipStatus.Pending
        };

        db.Friendships.Add(friendship);
        await db.SaveChangesAsync();

        return friendship.Adapt<FriendshipResponseDTO>();
    }

    [Authorize]
    [HttpPatch("{id:long}")]
    public async Task<ActionResult<FriendshipResponseDTO>> UpdateFriendship(long userId, long id, FriendshipDTO dto)
    {
        if(!IsCurrentUser(userId))
            return Forbid();
        
        if(dto.Status != FriendshipStatus.Accepted.ToString() && dto.Status != FriendshipStatus.Rejected.ToString())
            return BadRequest("Invalid status. Only 'Accepted' or 'Rejected' are allowed.");

        var friendship = await db.Friendships.FindAsync(id);
        if(friendship is null)
            return NotFound("Friendship not found.");
        
        if(friendship.ReceiverId != userId)
            return Forbid("Only the receiver can update the friendship status.");
        
        friendship.Status = dto.Status.Adapt<FriendshipStatus>();
        friendship.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return friendship.Adapt<FriendshipResponseDTO>();
    }

    [Authorize]
    [HttpDelete("{id:long}")]
    public async Task<ActionResult<FriendshipResponseDTO>> DeleteFriendship(long userId, long id, FriendshipDTO dto)
    {
        if(!IsCurrentUser(userId))
            return Forbid();
        
        var friendship = await db.Friendships.FindAsync(id);
        if(friendship is null)
            return NotFound("Friendship not found.");
        
        if(friendship.Status == FriendshipStatus.Rejected)
            return Forbid("Cannot delete a rejected friendship.");
        
        if(friendship.User1Id != userId && friendship.User2Id != userId)
            return Forbid("Only the users involved in the friendship can delete it.");

        if(friendship.Status == FriendshipStatus.Pending && friendship.ReceiverId == userId)
            return Forbid("Only the sender can delete a pending friendship request.");

        db.Friendships.Remove(friendship);
        await db.SaveChangesAsync();
        return friendship.Adapt<FriendshipResponseDTO>();
    }

    private bool IsCurrentUser(long id)
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }
}