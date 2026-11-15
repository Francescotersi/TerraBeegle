using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.AspNetCore.WebUtilities;
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
    GetFavorites(string username, [FromQuery] PaginationDTO pagination, [FromQuery] UserGameSearchDTO search) => GetUserGames(username, pagination, search, nameof(GetFavorites));

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
    GetWishlist(string username, [FromQuery] PaginationDTO pagination, [FromQuery] UserGameSearchDTO search) => GetUserGames(username, pagination, search, nameof(GetWishlist));

    [HttpPost("{ApiGameId:long}")]
    public Task<IActionResult> AddGameToWishlist(string username, long ApiGameId) => AddGameToList(username, ApiGameId);


    [HttpDelete("{ApiGameId:long}")]
    public Task<IActionResult> DeleteGameFromWishlist(string username, long ApiGameId) => DeleteGameFromList(username, ApiGameId);
}

public abstract class UserGamesController(AppDbContext db, IIGDBService ApiService, Expression<Func<User, IEnumerable<Game>>> ItemsList, string ListName) : ControllerBase
{
    private static IQueryable<Game> FilterGamesBySearchDTO(IQueryable<Game> query, UserGameSearchDTO search)
    {
        if (!string.IsNullOrEmpty(search.Name))
            query = query.Where(g => EF.Functions.ILike(g.Name, $"{search.Name}%"));

        if (search.Genres is { Length: > 0 })
            query = query.Where(g => g.Genres!.Any(g => search.Genres.Contains(g.ApiGenreId)));

        if (search.Platforms is { Length: > 0 })
            query = query.Where(g => g.Platforms!.Any(p => search.Platforms.Contains(p.ApiPlatformId)));

        if (search.Themes is { Length: > 0 })
            query = query.Where(g => g.Themes!.Any(t => search.Themes.Contains(t.ApiThemeId)));

        if (search.MinYear is {} minYear)
            query = query.Where(g => g.ReleaseDate >= new DateOnly(minYear, 1, 1));
        if (search.MaxYear is {} maxYear)
            query = query.Where(g => g.ReleaseDate <= new DateOnly(maxYear, 12, 31));

        if (search.MinRating is { } minRating)
            query = query.Where(g => g.AggregatedRating >= minRating);
        if (search.MaxRating is { } maxRating)
            query = query.Where(g => g.AggregatedRating <= maxRating);

        if (search.MinCriticRating is { } minCriticRating)
            query = query.Where(g => g.AggregatedRating >= minCriticRating);
        if (search.MaxCriticRating is { } maxCriticRating)
            query = query.Where(g => g.AggregatedRating <= maxCriticRating);


        if (search.GameType is {} gameType)
        {
            var NormalizeGameType = gameType switch
            {
                0 => "main_game",
                1 => "dlc_addon",
                2 => "expansion",
                3 => "bundle",
                4 => "standalone_expansion",
                5 => "remake",
                6 => "remaster",
                7 => "expanded_game",
                8 => "port",
                9 => "fork",
                _ => "unknown"
            };
            
            query = query.Where(g => g.GameType == NormalizeGameType);
        }

        IOrderedQueryable<Game> orderedQuery = search.SortBy?.ToLowerInvariant() switch
        {
            "name" => search.Ascending ? query.OrderBy(g => g.Name) : query.OrderByDescending(g => g.Name),
            "released" => search.Ascending ? query.OrderBy(g => g.ReleaseDate) : query.OrderByDescending(g => g.ReleaseDate),
            "rating" => search.Ascending ? query.OrderBy(g => g.Rating) : query.OrderByDescending(g => g.Rating),
            "critic_rating" => search.Ascending ? query.OrderBy(g => g.AggregatedRating) : query.OrderByDescending(g => g.AggregatedRating),
            _ => search.Ascending ? query.OrderBy(g => g.Name) : query.OrderByDescending(g => g.Name)
        };
        return orderedQuery.ThenBy(g => g.Slug); // To ensure consistent ordering for games with the same name, release date, or rating
    }

    string PageUrl(int page)
    {
        var parameters = Request.Query
            .Where(q => !q.Key.Equals("page", StringComparison.OrdinalIgnoreCase))
            .Select(q => KeyValuePair.Create(q.Key, (string?)q.Value.ToString()))
            .Append(KeyValuePair.Create("page", (string?)page.ToString()));

        return QueryHelpers.AddQueryString(Request.Path, parameters);
    }

    protected async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetUserGames(string username, PaginationDTO pagination, UserGameSearchDTO search, string actionName)
    {
        var viewerId = GetCurrentUserId(User);
        if (viewerId is null)
            return Unauthorized("User ID not found in token.");

        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user is null)
            return NotFound("User not found.");

        if (!await CanSeeUserGamesAsync(viewerId.Value, user.Id))
            return StatusCode(StatusCodes.Status403Forbidden, $"Only friends can see this user's {ListName}.");

        var query = db.Entry(user).Collection(ItemsList).Query();
        query = FilterGamesBySearchDTO(query, search);

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
                .Include(g => g.Videos)
                .AsSplitQuery()
                .ToListAsync();

            gameCards = [.. savedGames.Select(DBToGameDTO.DBToGameCardDTO)];
        }

        return Ok(new PagedResponseDTO<GameCardDTO>
        {
            Items = gameCards,
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling((double)totalCount / pagination.PageSize),
            PreviousPageUrl = pagination.Page > 1 ? PageUrl(pagination.Page - 1) : null,
            NextPageUrl = pagination.Page * pagination.PageSize < totalCount ? PageUrl(pagination.Page + 1) : null,
        });
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

        var collection = db.Entry(user).Collection(ItemsList);
        await collection.Query().Where(g => g.ApiGameId == ApiGameId).LoadAsync();

        var items = (ICollection<Game>)collection.CurrentValue!;
        if (items.Count > 0)
            return NoContent();

        items.Add(game);
        
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

        var collection = db.Entry(user).Collection(ItemsList);
        await collection.Query().Where(g => g.ApiGameId == ApiGameId).LoadAsync();

        var items = (ICollection<Game>)collection.CurrentValue!;
        var game = items.FirstOrDefault();
        if (game is null)
            return NotFound($"Game is not in {ListName}.");

        items.Remove(game);
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