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

        if (search.Page.HasValue && search.Page.Value != 1)
            query += $"offset {(search.Page.Value - 1) * (search.PageSize ?? 20)};";

        if (search.PageSize.HasValue && search.PageSize.Value != 20)
            query += $"limit {search.PageSize.Value};";

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            search.SortBy = search.SortBy.Trim().ToLowerInvariant();
            query += $"sort {search.SortBy} {(search.Ascending ? "asc" : "desc")};";
        }

        if (!string.IsNullOrWhiteSpace(search.Name))
        {
            if (search.SearchExact)
                query += $"name=\"{search.Name.Trim()}\" &";
            else
                query += $"name=*\"{search.Name.Trim()}*\" &";
        }

        if (!string.IsNullOrWhiteSpace(search.PlatformsFamily))
            query += $"platforms.platformsfamily=({search.PlatformsFamily.Trim()}) &";

        if (!string.IsNullOrWhiteSpace(search.Platforms))
            query += $"platforms=({search.Platforms.Trim()}) &";

        if (!string.IsNullOrWhiteSpace(search.Genres))
            query += $"genres={search.Genres.Trim()} &";

        if (!string.IsNullOrWhiteSpace(search.Themes))
            query += $"themes={search.Themes.Trim()} &";

        if (!string.IsNullOrWhiteSpace(search.Tags))
            query += $"tags={search.Tags.Trim()} &";

        if (search.ReleaseYearMin.HasValue)
        {
            query += $"first_release_date>={Utils.YearToUnixTimestamp(search.ReleaseYearMin.Value, true)} &";
        }

        if (search.ReleaseYearMax.HasValue)
        {
            query += $"first_release_date<={Utils.YearToUnixTimestamp(search.ReleaseYearMax.Value, false)} &";
        }

        var result = await ApiService.SearchGamesAsync(query.TrimEnd('&',' '));

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

	// retrieving all games from the database and projecting them to GameResponseDTO
    [HttpGet("all")]
    public async Task<ActionResult<PagedResponseDTO<GameResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination, [FromQuery] bool IncludePlaceholders = false)
    {
        var games = await db.Games
            .Where(g => !g.IsPlaceholder || IncludePlaceholders) // Only return games that are not placeholders, unless 'IncludePlaceholders' is true
            .OrderBy(g => g.Name) // Ordering is required, otherwise Postgres can return the rows in a different order on each page
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<GameResponseDTO>()
            .ToListAsync();

        return Ok(Utils.CreatePagedResponse(
            games,
            await db.Games.CountAsync(),
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize, IncludePlaceholders })
        ));
    }

	// searching by the RAWG id the same one used for the RAWG request below
    [HttpGet("{rawgGameId:int}")]
    public async Task<ActionResult<GameResponseDTO>> GetById(int rawgGameId)
    {
        // The service looks for the game in the database first, then at RAWG (one lookup, see point 52)
        GameResponseDTO? game;
        try
        {
            game = await ApiService.GetGameAsync(rawgGameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        if (game is null)
            return NotFound($"Game with RAWG ID {rawgGameId} not found.");

        return Ok(game);
    }
}