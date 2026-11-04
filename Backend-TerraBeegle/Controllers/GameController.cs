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
public class GameController(AppDbContext db, IRawgService rawgService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponseDTO<GameCardDTO>>> Search([FromQuery] GameSearchDTO search)
    {
        string query = "";

        if (!string.IsNullOrWhiteSpace(search.Name))
            query += $"search={search.Name.Trim()}";

        if (search.Page.HasValue && search.Page.Value != 1)
            query += $"&page={search.Page.Value}";

        if (search.PageSize.HasValue && search.PageSize.Value != 20)
            query += $"&page_size={search.PageSize.Value}";

        if (search.SearchPrecise)
            query += "&search_precise=true";

        if (search.SearchExact)
            query += "&search_exact=true";

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            search.SortBy = search.SortBy.Trim().ToLowerInvariant();
            query += $"&ordering={(search.Ascending ? search.SortBy : $"-{search.SortBy}")}";
        }

        if (!string.IsNullOrWhiteSpace(search.ParentPlatforms))
            query += $"&parent_platforms={search.ParentPlatforms.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Platforms))
            query += $"&platforms={search.Platforms.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Stores))
            query += $"&stores={search.Stores.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Developers))
            query += $"&developers={search.Developers.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Publishers))
            query += $"&publishers={search.Publishers.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Creators))
            query += $"&creators={search.Creators.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Genres))
            query += $"&genres={search.Genres.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.Tags))
            query += $"&tags={search.Tags.Trim()}";

        if (!string.IsNullOrWhiteSpace(search.ReleaseDate))
        {
            string[] dateParts = search.ReleaseDate.Split(',');

            if (dateParts.Length == 2 && !string.IsNullOrWhiteSpace(dateParts[0]) && !string.IsNullOrWhiteSpace(dateParts[1]) 
                && dateParts[0].Trim().Length == 4 && dateParts[1].Trim().Length == 4)
            {
                string startDate = $"{dateParts[0].Trim()}-01-01";
                string endDate = $"{dateParts[1].Trim()}-12-31";
                query += $"&dates={startDate},{endDate}";
            }
        }

        if (!string.IsNullOrWhiteSpace(search.Updated))
        {
            string[] dateParts = search.Updated.Split(',');

            if (dateParts.Length == 2 && !string.IsNullOrWhiteSpace(dateParts[0]) && !string.IsNullOrWhiteSpace(dateParts[1]) 
                && dateParts[0].Trim().Length == 4 && dateParts[1].Trim().Length == 4)
            {
                string startDate = $"{dateParts[0].Trim()}-01-01";
                string endDate = $"{dateParts[1].Trim()}-12-31";
                query += $"&updated={startDate},{endDate}";
            }
        }

        if (search.PlatformsCount.HasValue)
            query += $"&platforms_count={search.PlatformsCount.Value}";

        if (!string.IsNullOrWhiteSpace(search.Metacritic))
            query += $"&metacritic={search.Metacritic.Trim()}";

        if (search.ExcludeAdditions.HasValue && search.ExcludeAdditions.Value)
            query += "&exclude_additions=true";

        if (search.ExcludeParents.HasValue && search.ExcludeParents.Value)
            query += "&exclude_parents=true";

        if (search.ExcludeGameSeries.HasValue && search.ExcludeGameSeries.Value)
            query += "&exclude_game_series=true";

        if (!string.IsNullOrWhiteSpace(search.ExcludeStores))
            query += $"&exclude_stores={search.ExcludeStores.Trim()}";

        var result = await rawgService.SearchGamesAsync(query.TrimStart('&'));

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
        var game = await db.Games
            .Where(g => g.RawgGameId == rawgGameId && !g.IsPlaceholder) // Only return games that are not placeholders
            .ProjectToType<GameResponseDTO>()
            .FirstOrDefaultAsync();

        if (game is null)
        {
            try
            {
                game = await rawgService.GetGameAsync(rawgGameId);
            }
            catch (HttpRequestException)
            {
                return StatusCode(503,"External API is unavailable.");
            }
        }

        if (game is null)
            return NotFound($"Game with RAWG ID {rawgGameId} not found.");

        return Ok(game);
    }
}