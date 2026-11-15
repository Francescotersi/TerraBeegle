using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Expressions;
using Backend_TerraBeegle.Services;
using Npgsql;
using Backend_TerraBeegle.RateLimiting;
using Backend_TerraBeegle.Enums;
using Microsoft.AspNetCore.RateLimiting;
using static Backend_TerraBeegle.Utils;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{username}/favorites")]
public class UserFavoritesController(AppDbContext db, IIGDBService ApiService) : UserGamesController(db, ApiService, u => u.Favorites, "favorites")
{
    // favorites
    // Lists a user's favorite games
    [DisableRateLimiting]
    [HttpGet]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> 
    GetFavorites(string username, [FromQuery] PaginationDTO pagination) => GetUserGames(username, pagination, nameof(GetFavorites));

    [HttpPost("{ApiGameId:long}")]
    public Task<IActionResult> AddGameToFavorites(string username, long ApiGameId) => AddGameToList(username, ApiGameId);

    [HttpDelete("{ApiGameId:long}")]
    public Task<IActionResult> DeleteGameFromFavorites(string username, long ApiGameId) => DeleteGameFromList(username, ApiGameId);
}

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{username}/wishlist")]
public class UserWishlistController(AppDbContext db, IIGDBService ApiService) : UserGamesController(db, ApiService, u => u.WishlistItems, "wishlist")
{
    // wishlist
    // Lists a user's wishlist games
    [DisableRateLimiting]
    [HttpGet]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> 
    GetWishlist(string username, [FromQuery] PaginationDTO pagination) => GetUserGames(username, pagination, nameof(GetWishlist));

    [HttpPost("{ApiGameId:long}")]
    public Task<IActionResult> AddGameToWishlist(string username, long ApiGameId) => AddGameToList(username, ApiGameId);


    [HttpDelete("{ApiGameId:long}")]
    public Task<IActionResult> DeleteGameFromWishlist(string username, long ApiGameId) => DeleteGameFromList(username, ApiGameId);
}

public abstract class UserGamesController(AppDbContext db, IIGDBService ApiService, Expression<Func<User, IEnumerable<Game>>> ItemsList, string ListName) : ControllerBase
{
    protected async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetUserGames(string username, PaginationDTO pagination, string actionName)
    {
        var viewerId = GetCurrentUserId(User);
        if (viewerId is null)
            return Unauthorized("User ID not found in token.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == viewerId && u.Username == username);
        if (user is null)
            return NotFound("User not found.");

        if (!await CanSeeUserGamesAsync(viewerId.Value, user.Id))
            return StatusCode(StatusCodes.Status403Forbidden, $"Only friends can see this user's {ListName}.");

        var query = db.Entry(user).Collection(ItemsList).Query();
        var totalCount = await query.CountAsync();
        
        List<GameCardDTO> gameCards = [];

        if (totalCount != 0) {
            var savedGames = await query
                .OrderBy(g => g.Name)
                .ThenBy(g => g.Slug)
                .Where(u => u.Id == user.Id)
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Include(g => g.Images.Where(i => i.Type == ImageType.Cover))
                .Include(g => g.Genres)
                .Include(g => g.Platforms)
                .Include(g => g.Themes)
                .ToListAsync();

            gameCards = [.. savedGames.Select(DBToGameDTO.DBToGameCardDTO)];
        }

        return Ok(CreatePagedResponse(
            gameCards,
            totalCount,
            pagination,
            page => Url.Action(actionName, new { username, Page = page, pagination.PageSize })
        ));
    }

    protected async Task<IActionResult> AddGameToList(string username, long ApiGameId)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
            return Unauthorized("User ID not found in token.");

        if (ApiGameId <= 0)
            return BadRequest("Game ID must be positive.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Username == username);
        if (user is null)
            return NotFound("User not found.");

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
            return NotFound($"Game with ID {ApiGameId} not found.");

        var query = db.Entry(user).Collection(ItemsList).Query();
        
        if (await query.AnyAsync(g => g.ApiGameId == ApiGameId))
            return NoContent();

        var games = await query.ToListAsync();

        games.Add(game);

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

    protected async Task<IActionResult> DeleteGameFromList(string username, long ApiGameId)
    {
        var userId = GetCurrentUserId(User);
        if (userId is null)
            return Unauthorized("User ID not found in token.");

        if (ApiGameId <= 0)
            return BadRequest("Game ID must be positive.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.Username == username);
        if (user is null)
            return NotFound("User not found.");

        var query = db.Entry(user).Collection(ItemsList).Query();
        var game = await query.FirstOrDefaultAsync(g => g.ApiGameId == ApiGameId);

        if (game is null)
            return NoContent();

        var games = await query.ToListAsync();

        games.Remove(game);

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
