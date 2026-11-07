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
using System.Linq.Expressions;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{userId:long}")]
public class UserGamesController(AppDbContext db, IRawgService rawgService) : ControllerBase
{
    // favorites
    [DisableRateLimiting]
    [HttpGet("favorites")]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetFavorites(long userId, [FromQuery] UserGameSearchDTO search)
        => GetUserGamesAsync(userId, search, u => u.Favorites, "favorites", nameof(GetFavorites));

    [HttpPost("favorites/{rawgGameId:int}")]
    public async Task<IActionResult> AddGameToFavorites(long userId, int rawgGameId)
    {
        if (!Utils.IsCurrentUser(User, userId))
            return Forbid();

        Game? game;
        try
        {
            game = await rawgService.GetOrCreateGameAsync(rawgGameId);
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

    [HttpDelete("favorites/{rawgGameId:int}")]
    public async Task<IActionResult> DeleteGameFromFavorites(long userId, int rawgGameId)
    {
        if(!Utils.IsCurrentUser(User, userId))
            return Forbid();

        var user = await db.Users
            .Include(u => u.Favorites.Where(g => g.RawgGameId == rawgGameId))
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

    // wishlist
    [DisableRateLimiting]
    [HttpGet("wishlist")]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetWishlist(long userId, [FromQuery] UserGameSearchDTO search)
        => GetUserGamesAsync(userId, search, u => u.WishlistItems, "wishlist", nameof(GetWishlist));

    [HttpPost("wishlist/{rawgGameId:int}")]
    public async Task<IActionResult> AddGameToWishlist(long userId, int rawgGameId)
    {
        if (!Utils.IsCurrentUser(User, userId))
            return Forbid();

        Game? game;
        try
        {
            game = await rawgService.GetOrCreateGameAsync(rawgGameId);
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

    [HttpDelete("wishlist/{rawgGameId:int}")]
    public async Task<IActionResult> DeleteGameFromWishlist(long userId, int rawgGameId)
    {
        if(!Utils.IsCurrentUser(User, userId))
            return Forbid();

        var user = await db.Users
            .Include(u => u.WishlistItems.Where(g => g.RawgGameId == rawgGameId))
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
    
    // Shared by GetFavorites and GetWishlist: only the list, the word in the 403 message and the action
    // used for the page links differ. Private, otherwise ASP.NET would treat it as an endpoint.
    // Expression (not Func), so EF can translate u => u.Favorites to a JOIN instead of loading the users
    private async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetUserGamesAsync(
        long userId,
        UserGameSearchDTO search,
        Expression<Func<User, IEnumerable<Game>>> games,
        string listName,
        string actionName)
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
            return StatusCode(StatusCodes.Status403Forbidden, $"Only friends can see this user's {listName}.");

        // One query for both the count and the page, so the filters (next step) apply to both
        var query = db.Users
            .Where(u => u.Id == userId)
            .SelectMany(games);

        if (!string.IsNullOrWhiteSpace(search.Name))
        {
            var term = search.Name.Trim().ToLower();
            query = query.Where(g => g.Name.ToLower().Contains(term));
        }
        
        if (search.Genre.HasValue)
        {
            var genre = (GameGenre)search.Genre.Value;
            query = query.Where(g => g.Genres.Any(x => x.RawgGenreId == genre));
        }
        
        if (search.Platform.HasValue)
        {
            var platform = (GamePlatform)search.Platform.Value;
            query = query.Where(g => g.Platforms.Any(x => x.RawgPlatformId == platform));
        }
        
        if (search.Year.HasValue)
        {
            var from = new DateOnly(search.Year.Value, 1, 1);
            var to = new DateOnly(search.Year.Value, 12, 31);
            query = query.Where(g => g.ReleaseDate >= from && g.ReleaseDate <= to);
        }
        
        if (search.MinRating.HasValue)
        {
            var minRating = search.MinRating.Value;
            query = query.Where(g => g.Rating >= minRating);
        }
        
        var totalCount = await query.CountAsync();
        
        IOrderedQueryable<Game> ordered = search.SortBy?.ToLowerInvariant() switch
        {
            "released" => search.Ascending 
                ? query.OrderBy(g => g.ReleaseDate == null).ThenBy(g => g.ReleaseDate) 
                : query.OrderBy(g => g.ReleaseDate == null).ThenByDescending(g => g.ReleaseDate),
            "rating" => search.Ascending 
                ? query.OrderBy(g => g.Rating == null).ThenBy(g => g.Rating) 
                : query.OrderBy(g => g.Rating == null).ThenByDescending(g => g.Rating),
            _ => search.Ascending ? query.OrderBy(g => g.Name) : query.OrderByDescending(g => g.Name),
        };
        
        ordered = ordered.ThenBy(g => g.Id);

        var items = new List<GameCardDTO>();
        if (totalCount != 0)
        {
            items = await ordered
                .Skip((search.Page - 1) * search.PageSize)
                .Take(search.PageSize)
                .ProjectToType<GameCardDTO>()
                .ToListAsync();
        }

        return Ok(Utils.CreatePagedResponse(
            items,
            totalCount,
            search,
            page => Url.Action(actionName, new
            {
                userId,
                Page = page,
                search.PageSize,
                search.Name,
                search.Genre,
                search.Platform,
                search.Year,
                search.MinRating,
                search.SortBy,
                search.Ascending
            })
        ));
    }

    private async Task<bool> CanSeeUserGamesAsync(long viewerId, long ownerId)
    {
        if(viewerId == ownerId)
            return true;
        
        var user1Id = Math.Min(viewerId, ownerId);
        var user2Id = Math.Max(viewerId, ownerId);
        
        return await db.Friendships.AnyAsync(f => f.User1Id == user1Id && f.User2Id == user2Id && f.Status == FriendshipStatus.Accepted);
    }
}