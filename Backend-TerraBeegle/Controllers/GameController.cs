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
    // Searches IGDB games with filters, sorting and pagination
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> Search([FromQuery] GameSearchDTO search)
    {
        string query = "";
        string pagination = "";

        // Always brackets: "platforms = 167" means "exactly [167]" at IGDB (only PS5 exclusives), "platforms = (167)"
        // means "contains 167". (...) = at least one of the values, [...] = all of them
        static string GetBrackets(int values, bool all, bool open) => all ? (open ? "(" : ")") : (open ? "[" : "]");
        static string GetQuery (string field, int[] values, bool all) => $"{field}={GetBrackets(values.Length, all, true)}{string.Join(",", values)}{GetBrackets(values.Length, all, false)} &";
        static string GetQueryInt(string field, long value, bool min) => $"{field}{(min ? ">=" : "<=")}{value} &";

        if (search.Page.HasValue && search.Page.Value != 1)
            pagination += $"offset {(search.Page.Value - 1) * (search.PageSize ?? 24)};";

        if (search.PageSize.HasValue)
            pagination += $"limit {search.PageSize.Value};";

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            var sortby = search.SortBy.Trim().ToLowerInvariant();
            var igdbField = sortby switch
            {
                "critic_rating" => "aggregated_rating",
                "released" => "first_release_date",
                _ => sortby
            };
            pagination += $"sort {igdbField} {(search.Ascending ? "asc" : "desc")};";
        }

        if (!string.IsNullOrWhiteSpace(search.Name))
        {
            var opr = search.CaseSensitive ? '=' : '~';
            // Escaped, so a " in the name cannot close the string and add other conditions to the IGDB query
            var name = search.Name.Trim().Replace("\\", "\\\\").Replace("\"", "\\\"");

            if (search.SearchExact)
                query += $"name{opr}\"{name}\" &";
            else if (search.SearchStartExact)
                query += $"name{opr}\"{name}\"* &";
            else
                query += $"name{opr}*\"{name}\"* &";
        }

        if (search.PlatformsFamily is { Length: > 0 } && search.Platforms is { Length: > 0 }) {
            query += $"({GetQuery("platforms.platform_family", search.PlatformsFamily, search.PlatformsFamilyExact)} | {GetQuery("platforms", search.Platforms, search.PlatformsExact)}) &";
        }
        else if (search.PlatformsFamily is { Length: > 0 }){
            query += GetQuery("platforms.platform_family", search.PlatformsFamily, search.PlatformsFamilyExact);
        }
        else if (search.Platforms is { Length: > 0 }) {
            query += GetQuery("platforms", search.Platforms, search.PlatformsExact);
        }

        if (search.Genres is { Length: > 0 })
            query += GetQuery("genres", search.Genres, search.GenresExact);
        
        if (search.Keywords is { Length: > 0 })
            query += GetQuery("keywords", search.Keywords, search.KeywordsExact);

        if (search.Themes is { Length: > 0 })
            query += GetQuery("themes", search.Themes, search.ThemesExact);

        if (search.Developers is { Length: > 0 })
            query += $"(involved_companies.developer=true & {GetQuery("involved_companies.company", search.Developers, search.DevelopersExact)}) &";

        if (search.Publishers is { Length: > 0 })
            query += $"(involved_companies.publisher=true & {GetQuery("involved_companies.company", search.Publishers, search.PublishersExact)}) &";

        if (search.Stores is { Length: > 0 })
            query += GetQuery("website.type", search.Stores, search.StoresExact);

        if (search.ReleaseYearMin.HasValue)
            query += GetQueryInt("first_release_date", YearToUnixTimestamp(search.ReleaseYearMin.Value, true), true);

        if (search.ReleaseYearMax.HasValue)
            query += GetQueryInt("first_release_date", YearToUnixTimestamp(search.ReleaseYearMax.Value, false), false);

        if (search.RatingMin.HasValue)
            query += GetQueryInt("rating", search.RatingMin.Value, true);
        
        if (search.RatingMax.HasValue)
            query += GetQueryInt("rating", search.RatingMax.Value, false);

        if (search.MinRatingCount.HasValue)
            query += GetQueryInt("rating_count", search.MinRatingCount.Value, true);

        if (search.CriticRatingMin.HasValue)
            query += GetQueryInt("aggregated_rating", search.CriticRatingMin.Value, true);

        if (search.CriticRatingMax.HasValue)
            query += GetQueryInt("aggregated_rating", search.CriticRatingMax.Value, false);

        if (search.MinCriticRatingCount.HasValue)
            query += GetQueryInt("aggregated_rating_count", search.MinCriticRatingCount.Value, true);

        if (search.GameType is { Length: > 0 })
            query += GetQuery("game_type", search.GameType, false);

        if (search.PegiRating is { Length: > 0 })
            query += GetQuery("age_ratings.rating_category", search.PegiRating, false);

        GameSearchResponseDTO? result;
        try
        {
            result = await ApiService.SearchGamesAsync(query.TrimEnd('&',' '), pagination);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (result is null)
        {
            return StatusCode(503,"External API is unavailable.");
        }

        int page = search.Page ?? 1;
        int pageSize = search.PageSize ?? 24;

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

    // Same URL as the current request (same filters, with our parameter names), only with another page
    private string PageUrl(int page)
    {
        var parameters = Request.Query
            .Where(q => !q.Key.Equals("page", StringComparison.OrdinalIgnoreCase))
            .Select(q => KeyValuePair.Create(q.Key, (string?)q.Value.ToString()))
            .Append(KeyValuePair.Create("page", (string?)page.ToString()));

        return QueryHelpers.AddQueryString(Request.Path, parameters);
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
            .ProjectToType<GameDetailsDTO>()
            .ToListAsync();

        return Ok(CreatePagedResponse(
            games,
            await db.Games.CountAsync(),
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize, IncludePlaceholders })
        ));
    }

    [HttpGet("coming-soon")]
    public async Task<ActionResult<PagedResponseDTO<GameDetailsDTO>>> GetComingSoon([FromQuery] PaginationDTO pagination)
    {
        var query = $"first_release_date > {DateTimeOffset.UtcNow.ToUnixTimeSeconds()}" +
            $"& first_release_date < {DateTimeOffset.UtcNow.AddYears(1).ToUnixTimeSeconds()}";
        var paginationQuery = $"offset {(pagination.Page - 1) * pagination.PageSize};" +
            $"limit {pagination.PageSize}; sort first_release_date asc;";

        GameSearchResponseDTO? result;
        try
        {
            result = await ApiService.SearchGamesAsync(query, paginationQuery);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (result is null)
        {
            return StatusCode(503,"External API is unavailable.");
        }

        int page = pagination.Page;
        int pageSize = pagination.PageSize;

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
    [HttpGet("{igdbGameId:long}")]
    public async Task<ActionResult<GameDetailsDTO>> GetById(long igdbGameId)
    {
        // The service looks for the game in the database first, then at IGDB (one lookup, see point 52)
        GameDetailsDTO? game;
        try
        {
            game = await ApiService.GetGameAsync(igdbGameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
            return NotFound($"Game with IGDB ID {igdbGameId} not found.");

        return Ok(game);
    }
}