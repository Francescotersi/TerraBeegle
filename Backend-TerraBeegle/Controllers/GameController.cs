using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Services;
using static Backend_TerraBeegle.Utils;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db, IIGDBService ApiService) : ControllerBase
{
    static string CreateFilter (string field, int[] values, bool all) => $"{field}={(all ? "[" : "(")}{string.Join(",", values)}{(all ? "]" : ")")}";
    
    static void AddFilterName(string? name, bool caseSensitive, bool searchExact, bool searchStartExact, List<string> filters)
    {
        if (!string.IsNullOrWhiteSpace(name))
        {
            var opr = caseSensitive ? '=' : '~';
            name = name.Trim().Replace("\\", "\\\\").Replace("\"", "\\\"");  // Escaped, so a " in the name cannot close the string and add other conditions to the IGDB query

            filters.Add((searchExact, searchStartExact) switch
            {
                // No " &" at the end: the conditions are joined with " & " later (it gave "name~*"x"* & & ..." -> 503)
                (true, _) => $"name{opr}\"{name}\"",
                (_, true) => $"name{opr}\"{name}\"*",
                _ => $"name{opr}*\"{name}\"*"
            });
        }
    }

    static void AddFilterList(string field, int[]? values, bool all, List<string> filters)
    {
        if (values is { Length: > 0 })
            filters.Add(CreateFilter(field, values, all));
    }

    static void AddFilterPlatform(int[]? platforms, int[]? platformsFamily, bool platformsExact, bool platformsFamilyExact, List<string> filters)
    {
        var platformsString = (platformsFamily, platforms) switch
        {
            ({ Length: > 0 }, { Length: > 0 }) => $"({CreateFilter("platforms.platform_family", platformsFamily, platformsFamilyExact)} | {CreateFilter("platforms", platforms, platformsExact)})",
            (_, { Length: > 0 }) => CreateFilter("platforms", platforms, platformsExact),
            ({ Length: > 0 }, _) => CreateFilter("platforms.platform_family", platformsFamily, platformsFamilyExact),
            (_, _) => null
        };

        if (platformsString is not null)
            filters.Add(platformsString);        
    }

    static void AddFilterCompany(string field, int[]? values, bool all, List<string> filters)
    {
        if (values is { Length: > 0 })
            filters.Add($"(involved_companies.{field}=true & {CreateFilter("involved_companies.company", values, all)})");
    }
    
    static void AddFilterRange(string field, long? min, long? max, List<string> filters, bool convertToUnix = false)
    {
        if (min is {} MinVal)
            filters.Add($"{field}>={(convertToUnix ? YearToUnixTimestamp((int)MinVal, true) : MinVal)}");
        if (max is {} MaxVal)
            filters.Add($"{field}<={(convertToUnix ? YearToUnixTimestamp((int)MaxVal, false) : MaxVal)}");
    }

    // 7.5 out of 10 -> 75 out of 100
    static long? ToIgdbRating(decimal? rating) => rating is {} r ? (long)Math.Round(r * 10) : null;

    static void AddPagination(int page, int pageSize, List<string> paginationQuery)
    {
        if (page > 1)
            paginationQuery.Add($"offset {(page - 1) * pageSize};");
        
        if (pageSize != 10)
            paginationQuery.Add($"limit {pageSize};");
    }

    // Same URL as the current request (same filters, with our parameter names), only with another page
    string PageUrl(int page)
    {
        var parameters = Request.Query
            .Where(q => !q.Key.Equals("page", StringComparison.OrdinalIgnoreCase))
            .Select(q => KeyValuePair.Create(q.Key, (string?)q.Value.ToString()))
            .Append(KeyValuePair.Create("page", (string?)page.ToString()));

        return QueryHelpers.AddQueryString(Request.Path, parameters);
    }

    // Searches IGDB games with filters, sorting and pagination
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> Search([FromQuery] GameSearchDTO search, [FromQuery] PaginationDTO pagination)
    {
        List<string> filters = [];
        List<string> paginationQuery = [];

        int page = pagination.Page;
        int pageSize = pagination.PageSize;

        // (...) = at least one of the values, [...] = all of them
        AddPagination(page, pageSize, paginationQuery);

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            var sortBy = search.SortBy.Trim().ToLowerInvariant() switch
            {
                "critic_rating" => "aggregated_rating",
                "released" => "first_release_date",
                var s => s
            };
            paginationQuery.Add($"sort {sortBy} {(search.Ascending ? "asc" : "desc")};");
        }

        AddFilterName(search.Name, search.CaseSensitive, search.SearchExact, search.SearchStartExact, filters);

        AddFilterPlatform(search.Platforms, search.PlatformsFamily, search.PlatformsExact, search.PlatformsFamilyExact, filters);

        AddFilterList("genres", search.Genres, search.GenresExact, filters);
        AddFilterList("keywords", search.Keywords, search.KeywordsExact, filters);
        AddFilterList("themes", search.Themes, search.ThemesExact, filters);
        AddFilterList("game_type", search.GameType, false, filters);
        AddFilterList("age_ratings.rating_category", search.PegiRating, false, filters);

        AddFilterCompany("developer", search.Developers, search.DevelopersExact, filters);
        AddFilterCompany("publisher", search.Publishers, search.PublishersExact, filters);

        AddFilterList("website.type", search.Stores, search.StoresExact, filters);

        AddFilterRange("first_release_date", search.ReleaseYearMin, search.ReleaseYearMax, filters, true);

        // The user rating comes out of 10, IGDB stores it out of 100
        AddFilterRange("rating", ToIgdbRating(search.RatingMin), ToIgdbRating(search.RatingMax), filters, false);
        AddFilterRange("aggregated_rating", search.CriticRatingMin, search.CriticRatingMax, filters, false);

        // Minimum number of votes, always applied when > 0: the home page sends 300 so "top rated" is not led by
        // unknown games rated 100 by 2 people. 0 = no minimum (a search by name must find games without votes too)
        AddFilterRange("rating_count", search.MinRatingCount > 0 ? search.MinRatingCount : null, null, filters, false);
        AddFilterRange("aggregated_rating_count", search.MinCriticRatingCount > 0 ? search.MinCriticRatingCount : null, null, filters, false);

        GameSearchResponseDTO? result;
        try
        {
            result = await ApiService.SearchGamesAsync(string.Join(" & ", filters), string.Join(" ", paginationQuery));
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (result is null)
            return StatusCode(503,"External API is unavailable.");

        return Ok(new PagedResponseDTO<GameCardDTO>
        {
            Items = [.. result.Results],
            Page = page,
            PageSize = pageSize,
            TotalCount = result.Count,
            TotalPages = (int)Math.Ceiling((double)result.Count / pageSize),
            PreviousPageUrl = page > 1 ? PageUrl(page - 1) : null,
            NextPageUrl = page * pageSize < result.Count ? PageUrl(page + 1) : null,
        });
    }

    // retrieving all games from the database and projecting them to GameDetailsDTO
    [HttpGet("all")]
    public async Task<ActionResult<PagedResponseDTO<GameDetailsDTO>>> GetAll([FromQuery] PaginationDTO pagination, [FromQuery] bool IncludePlaceholders = false)
    {
        var games = await db.Games
            .Where(g => !g.IsPlaceholder || IncludePlaceholders) // Only return games that are not placeholders, unless 'IncludePlaceholders' is true
            .OrderBy(g => g.Name) // Ordering is required, otherwise Postgres can return the rows in a different order on each page
            .ThenBy(g => g.Slug) // Secondary ordering by slug to ensure consistent ordering for games with the same name
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            // ProjectToType<GameDetailsDTO>() no longer matched the model (cover in Images, DB ids instead of IGDB ids,
            // rating out of 10): load the main data and use the same mapping as GET /api/games/{id}
            .Include(g => g.Images)
            .Include(g => g.Genres)
            .Include(g => g.Themes)
            .Include(g => g.Platforms!).ThenInclude(p => p.PlatformLogo)
            .AsSplitQuery()
            .AsNoTracking()
            .ToListAsync();

        return Ok(CreatePagedResponse(
            games.Select(DBToGameDTO.DBToGameDetailsDTO).ToList(),
            await db.Games.CountAsync(g => !g.IsPlaceholder || IncludePlaceholders), // same filter as the page, otherwise TotalPages counted the hidden placeholders
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize, IncludePlaceholders })
        ));
    }

    [HttpGet("coming-soon")]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> GetComingSoon([FromQuery] PaginationDTO pagination, [FromQuery] GameComingSoonSearchDTO search)
    {
        List<string> filters = [];
        List<string> paginationQuery = [];

        int page = pagination.Page;
        int pageSize = pagination.PageSize;
        int months = search.Months ?? 6;

        AddFilterRange("first_release_date", DateTimeOffset.UtcNow.ToUnixTimeSeconds(), 
            DateTimeOffset.UtcNow.AddMonths(months).ToUnixTimeSeconds(), filters, false);
        
        AddPagination(page, pageSize, paginationQuery);
        AddFilterName(search.Name, search.CaseSensitive, search.SearchExact, search.SearchStartExact, filters);
        AddFilterPlatform(search.Platforms, search.PlatformsFamily, search.PlatformsExact, search.PlatformsFamilyExact, filters);
        
        AddFilterList("genres", search.Genres, search.GenresExact, filters);
        AddFilterList("keywords", search.Keywords, search.KeywordsExact, filters);
        AddFilterList("themes", search.Themes, search.ThemesExact, filters);
        AddFilterList("game_type", search.GameType, false, filters);

        AddFilterCompany("developer", search.Developers, search.DevelopersExact, filters);
        AddFilterCompany("publisher", search.Publishers, search.PublishersExact, filters);

        GameSearchResponseDTO? result;
        try
        {
            result = await ApiService.SearchGamesAsync(string.Join(" & ", filters), string.Join(" ", paginationQuery));
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (result is null)
            return StatusCode(503,"External API is unavailable.");

        return Ok(new PagedResponseDTO<GameCardDTO>
        {
            Items = [.. result.Results],
            Page = page,
            PageSize = pageSize,
            TotalCount = result.Count,
            TotalPages = (int)Math.Ceiling((double)result.Count / pageSize),
            PreviousPageUrl = page > 1 ? PageUrl(page - 1) : null,
            NextPageUrl = page * pageSize < result.Count ? PageUrl(page + 1) : null,
        });
    }

    // searching by the IGDB id the same one used for the IGDB request below
    [HttpGet("{igdbGameId:long}", Order = 1)]
    public Task<ActionResult<GameDetailsDTO>> GetById(long igdbGameId) => GetGame(igdbGameId.ToString());

    [HttpGet("{igdbGameSlug}", Order = 2)]
    public Task<ActionResult<GameDetailsDTO>> GetBySlug(string igdbGameSlug) => GetGame($"\"{igdbGameSlug}\"", "Slug");

    private async Task<ActionResult<GameDetailsDTO>> GetGame(string igdbGame, string field = "ID")
    {
        // The service looks for the game in the database first, then at IGDB (one lookup, see point 52)
        GameDetailsDTO? game;
        try
        {
            game = await ApiService.GetGameAsync(igdbGame, field.ToLowerInvariant());
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
            return NotFound($"Game with IGDB {field} {igdbGame} not found.");

        return Ok(game);
    }
}