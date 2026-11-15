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
[Route("api/users/{userId:long}/favorites")]
public class UserFavoritesController(AppDbContext db, IIGDBService ApiService) : UserGamesController(db, ApiService, u => u.Favorites, "favorites")
{
    // favorites
    // Lists a user's favorite games
    [DisableRateLimiting]
    [HttpGet]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> 
    GetFavorites(long userId, [FromQuery] PaginationDTO pagination) => GetUserGames(userId, pagination, nameof(GetFavorites));

    [HttpPost("{ApiGameId:long}")]
    public Task<IActionResult> AddGameToFavorites(long userId, long ApiGameId) => AddGameToList(userId, ApiGameId);

    [HttpDelete("{ApiGameId:long}")]
    public Task<IActionResult> DeleteGameFromFavorites(long userId, long ApiGameId) => DeleteGameFromList(userId, ApiGameId);
}

[Authorize]
[ApiController]
[EnableRateLimiting(RateLimitPolicies.UserGames)]
[Route("api/users/{userId:long}/wishlist")]
public class UserWishlistController(AppDbContext db, IIGDBService ApiService) : UserGamesController(db, ApiService, u => u.WishlistItems, "wishlist")
{
    // wishlist
    // Lists a user's wishlist games
    [DisableRateLimiting]
    [HttpGet]
    public Task<ActionResult<PagedResponseDTO<GameCardDTO>>> 
    GetWishlist(long userId, [FromQuery] PaginationDTO pagination) => GetUserGames(userId, pagination, nameof(GetWishlist));

    [HttpPost("{ApiGameId:long}")]
    public Task<IActionResult> AddGameToWishlist(long userId, long ApiGameId) => AddGameToList(userId, ApiGameId);


    [HttpDelete("{ApiGameId:long}")]
    public Task<IActionResult> DeleteGameFromWishlist(long userId, long ApiGameId) => DeleteGameFromList(userId, ApiGameId);
}

public abstract class UserGamesController(AppDbContext db, IIGDBService ApiService, Expression<Func<User, IEnumerable<Game>>> ItemsList, string ListName) : ControllerBase
{
    protected async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetUserGames(long userId, PaginationDTO pagination, string actionName)
    {
        var viewerId = GetCurrentUserId(User);
        if (viewerId is null)
            return Unauthorized("User ID not found in token.");

        // Any user by id: CanSeeUserGamesAsync below lets the owner and accepted friends see the list
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
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
                .Skip((pagination.Page - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .Include(g => g.Images.Where(i => i.Type == ImageType.Cover))
                .Include(g => g.Genres)
                .Include(g => g.Platforms!).ThenInclude(p => p.PlatformLogo)
                .Include(g => g.Platforms!).ThenInclude(p => p.PlatformFamily)
                .Include(g => g.Themes)
                .AsSplitQuery()
                .ToListAsync();

            gameCards = [.. savedGames.Select(DBToGameDTO.DBToGameCardDTO)];
        }

        return Ok(CreatePagedResponse(
            gameCards,
            totalCount,
            pagination,
            page => Url.Action(actionName, new { userId, Page = page, pagination.PageSize })
        ));
    }

    protected async Task<IActionResult> AddGameToList(long userId, long ApiGameId)
    {
        var currentUserId = GetCurrentUserId(User);
        if (currentUserId is null)
            return Unauthorized("User ID not found in token.");

        // You can change only your own lists
        if (currentUserId != userId)
            return StatusCode(StatusCodes.Status403Forbidden, $"You can only change your own {ListName}.");

        if (ApiGameId <= 0)
            return BadRequest("Game ID must be positive.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
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

        // Add to the user's real collection (user.Favorites / user.WishlistItems) so EF saves the new row;
        // adding to a separate List from query.ToListAsync() is not tracked and saved nothing
        await db.Entry(user).Collection(ItemsList).LoadAsync();
        UserList(user).Add(game);

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

    protected async Task<IActionResult> DeleteGameFromList(long userId, long ApiGameId)
    {
        var currentUserId = GetCurrentUserId(User);
        if (currentUserId is null)
            return Unauthorized("User ID not found in token.");

        // You can change only your own lists
        if (currentUserId != userId)
            return StatusCode(StatusCodes.Status403Forbidden, $"You can only change your own {ListName}.");

        if (ApiGameId <= 0)
            return BadRequest("Game ID must be positive.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return NotFound("User not found.");

        var query = db.Entry(user).Collection(ItemsList).Query();
        var game = await query.FirstOrDefaultAsync(g => g.ApiGameId == ApiGameId);

        if (game is null)
            return NoContent();

        // Same as above: remove from the user's real collection so EF deletes the row
        await db.Entry(user).Collection(ItemsList).LoadAsync();
        UserList(user).Remove(game);

        await db.SaveChangesAsync();
        return NoContent();
    }

    // user.Favorites or user.WishlistItems (the collection this controller works on)
    private ICollection<Game> UserList(User user) => (ICollection<Game>)ItemsList.Compile()(user);

    private async Task<bool> CanSeeUserGamesAsync(long viewerId, long ownerId)
    {
        if (viewerId == ownerId)
            return true;

        var user1Id = Math.Min(viewerId, ownerId);
        var user2Id = Math.Max(viewerId, ownerId);

        return await db.Friendships.AnyAsync(f => f.User1Id == user1Id && f.User2Id == user2Id && f.Status == FriendshipStatus.Accepted);
    }
}
