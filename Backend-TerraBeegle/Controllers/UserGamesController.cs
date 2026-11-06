using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Services;
using Npgsql;
using Mapster;
using Backend_TerraBeegle.RateLimiting;
using Backend_TerraBeegle.Enums;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{userId:long}/favorites")]
public class UserFavoritesController(AppDbContext db, IIGDBService ApiService) : ControllerBase
{
    // favorites
    [DisableRateLimiting]
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetFavorites(long userId, [FromQuery] PaginationDTO pagination)
    {
        var viewerId = Utils.GetCurrentUserId(User);
        if (viewerId is null)
        {
            return Unauthorized();
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        if (!await CanSeeUserGamesAsync(viewerId.Value, userId))
            return StatusCode(StatusCodes.Status403Forbidden, "Only friends can see this user's favorites.");

        var totalCount = await db.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Favorites)
            .CountAsync();

        var games = new List<GameCardDTO>();

        if (totalCount != 0) {
            games = await db.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.Favorites)
                .OrderBy(g => g.Name)
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ProjectToType<GameCardDTO>()
                .ToListAsync();
        }

        return Ok(Utils.CreatePagedResponse(
            games,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetFavorites), new { userId, Page = page, pagination.PageSize })
        ));
    }

    [HttpPost("{ApiGameId:int}")]
    public async Task<IActionResult> AddGameToFavorites(long userId, int ApiGameId)
    {
        if (!Utils.IsCurrentUser(User, userId))
            return Forbid();

        Game? game;
        try
        {
            game = await ApiService.GetOrCreateGameAsync(ApiGameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
            return NotFound("Game not found.");

        var user = await db.Users
            .Include(u => u.Favorites.Where(g => g.Id == game.Id))
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return NotFound("User not found.");

        if (user.Favorites.Count > 0)
            return NoContent();

        user.Favorites.Add(game);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Two requests at the same time for the same game: the other one already added it, so the game is
            // in the favorites anyway. Same answer (204) as the "already in the list" check above
            return NoContent();
        }

        return NoContent();
    }

    [HttpDelete("{ApiGameId:int}")]
    public async Task<IActionResult> DeleteGameFromFavorites(long userId, int ApiGameId)
    {
        if(!Utils.IsCurrentUser(User, userId))
            return Forbid();

        var user = await db.Users
            .Include(u => u.Favorites.Where(g => g.ApiGameId == ApiGameId))
            .FirstOrDefaultAsync(u => u.Id == userId);

        if(user is null)
            return NotFound("User not found.");

        var game = user.Favorites.FirstOrDefault();
        if(game is null)
            return NotFound("Game is not in favorites.");

        // Only the row from the join table is removed (not the game), so no foreign key can be violated
        user.Favorites.Remove(game);
        await db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> CanSeeUserGamesAsync(long viewerId, long ownerId)
    {
        if (viewerId == ownerId)
            return true;
        
        var user1Id = Math.Min(viewerId, ownerId);
        var user2Id = Math.Max(viewerId, ownerId);
        
        return await db.Friendships.AnyAsync(f => f.User1Id == user1Id && f.User2Id == user2Id && f.Status == FriendshipStatus.Accepted);
    }
}

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{userId:long}/wishlist")]
public class UserWishlistController(AppDbContext db, IIGDBService ApiService) : ControllerBase
{
    // wishlist
    [DisableRateLimiting]
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetWishlist(long userId, [FromQuery] PaginationDTO pagination)
    {
        var viewerId = Utils.GetCurrentUserId(User);
        if (viewerId is null)
        {
            return Unauthorized();
        }

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        if (!await CanSeeUserGamesAsync(viewerId.Value, userId))
            return StatusCode(StatusCodes.Status403Forbidden, "Only friends can see this user's wishlist.");

        var totalCount = await db.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.WishlistItems)
            .CountAsync();
        
        var games = new List<GameCardDTO>();
        if (totalCount != 0) {
            games = await db.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.WishlistItems)
                .OrderBy(g => g.Name)
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ProjectToType<GameCardDTO>()
                .ToListAsync();
        }

        return Ok(Utils.CreatePagedResponse(
            games,
            totalCount,
            pagination,
            page => Url.Action(nameof(GetWishlist), new { userId, Page = page, pagination.PageSize })
        ));
    }

    [HttpPost("{ApiGameId:int}")]
    public async Task<IActionResult> AddGameToWishlist(long userId, int ApiGameId)
    {
        if (!Utils.IsCurrentUser(User, userId))
            return Forbid();

        Game? game;
        try
        {
            game = await ApiService.GetOrCreateGameAsync(ApiGameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
            return NotFound("Game not found.");

        var user = await db.Users
            .Include(u => u.WishlistItems.Where(g => g.Id == game.Id))
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return NotFound("User not found.");

        if (user.WishlistItems.Count > 0)
            return NoContent();

        user.WishlistItems.Add(game);

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            // Two requests at the same time for the same game: the other one already added it, so the game is
            // in the wishlist anyway. Same answer (204) as the "already in the list" check above
            return NoContent();
        }

        return NoContent();
    }

    [HttpDelete("{ApiGameId:int}")]
    public async Task<IActionResult> DeleteGameFromWishlist(long userId, int ApiGameId)
    {
        if(!Utils.IsCurrentUser(User, userId))
            return Forbid();

        var user = await db.Users
            .Include(u => u.WishlistItems.Where(g => g.ApiGameId == ApiGameId))
            .FirstOrDefaultAsync(u => u.Id == userId);

        if(user is null)
            return NotFound("User not found.");

        var game = user.WishlistItems.FirstOrDefault();
        if(game is null)
            return NotFound("Game is not in wishlist.");

        // Only the row from the join table is removed (not the game), so no foreign key can be violated
        user.WishlistItems.Remove(game);
        await db.SaveChangesAsync();

        return NoContent();
    }
    
    private async Task<bool> CanSeeUserGamesAsync(long viewerId, long ownerId)
    {
        if (viewerId == ownerId)
            return true;
        
        var user1Id = Math.Min(viewerId, ownerId);
        var user2Id = Math.Max(viewerId, ownerId);
        
        return await db.Friendships.AnyAsync(f => f.User1Id == user1Id && f.User2Id == user2Id && f.Status == FriendshipStatus.Accepted);
    }
}