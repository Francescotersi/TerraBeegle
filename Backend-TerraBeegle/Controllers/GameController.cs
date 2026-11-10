using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Services;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db, IIGDBService ApiService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> Search([FromQuery] GameSearchDTO search)
    {
        string query = "";
        string pagination = "";

        static string GetBrackets(int values, bool all, bool open) => values <= 1 ? "" : all ? (open ? "(" : ")") : (open ? "[" : "]");
        static string GetQuery (string field, int[] values, bool all) => $"{field}={GetBrackets(values.Length, all, true)}{string.Join(",", values)}{GetBrackets(values.Length, all, false)} &";
        static string GetQueryInt(string field, long value, bool min) => $"{field}{(min ? ">=" : "<=")}{value} &";

        if (search.Page.HasValue && search.Page.Value != 1)
            pagination += $"offset {(search.Page.Value - 1) * (search.PageSize ?? 20)};";

        if (search.PageSize.HasValue && search.PageSize.Value != 20)
            pagination += $"limit {search.PageSize.Value};";

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            search.SortBy = search.SortBy.Trim().ToLowerInvariant();
            pagination += $"sort {(search.SortBy == "critic_rating" ? "aggregated_rating" : search.SortBy)} {(search.Ascending ? "asc" : "desc")};";
        }

        if (!string.IsNullOrWhiteSpace(search.Name))
        {
            var opr = search.CaseSensitive ? '=' : '~';

            if (search.SearchExact)
                query += $"name{opr}\"{search.Name.Trim()}\" &";
            else if (search.SearchStartExact)
                query += $"name{opr}\"{search.Name.Trim()}*\" &";
            else
                query += $"name{opr}*\"{search.Name.Trim()}*\" &";
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
            query += GetQueryInt("first_release_date", Utils.YearToUnixTimestamp(search.ReleaseYearMin.Value, true), true);

        if (search.ReleaseYearMax.HasValue)
            query += GetQueryInt("first_release_date", Utils.YearToUnixTimestamp(search.ReleaseYearMax.Value, false), false);

        if (search.RatingMin.HasValue)
            query += GetQueryInt("rating", search.RatingMin.Value, true);
        
        if (search.RatingMax.HasValue)
            query += GetQueryInt("rating", search.RatingMax.Value, false);

        if (search.CriticRatingMin.HasValue)
            query += GetQueryInt("aggregated_rating", search.CriticRatingMin.Value, true);

        if (search.CriticRatingMax.HasValue)
            query += GetQueryInt("aggregated_rating", search.CriticRatingMax.Value, false);

        if (search.GameType is { Length: > 0 })
            query += GetQuery("game_type", search.GameType, false);

        var result = await ApiService.SearchGamesAsync(query.TrimEnd('&',' '), pagination);

        if (result is null)
        {
            return StatusCode(503,"External API is unavailable.");
        }

        int page = search.Page ?? 1;
        int pageSize = search.PageSize ?? 20;

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

        return Ok(Utils.CreatePagedResponse(
            games,
            await db.Games.CountAsync(),
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize, IncludePlaceholders })
        ));
    }

	// searching by the IGDB id the same one used for the IGDB request below
    // [HttpGet("{igdbGameId:long}")]
    // public async Task<ActionResult<GameDetailsDTO>> GetById(long igdbGameId)
    // {
    //     // The service looks for the game in the database first, then at IGDB (one lookup, see point 52)
    //     GameDetailsDTO? game;
    //     try
    //     {
    //         game = await ApiService.GetGameAsync(igdbGameId);
    //     }
    //     catch (HttpRequestException)
    //     {
    //         return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
    //     }

    //     if (game is null)
    //         return NotFound($"Game with IGDB ID {igdbGameId} not found.");

    //     return Ok(game);
    // }
}