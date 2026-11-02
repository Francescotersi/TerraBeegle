using Microsoft.AspNetCore.Mvc;
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
    public async Task<ActionResult<PagedResponseDTO<GameResponseDTO>>> Search(GameSearchDTO search)
    {
        string query = "";

        if (!string.IsNullOrWhiteSpace(search.Title))
            query += $"search={search.Title.Trim()}";

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
            query += $"&order={(search.Ascending ? search.SortBy : $"-{search.SortBy}")}";
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
                query += $"&dates={startDate},{endDate}";
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
        return Ok(result);
    }

	// retrieving all games from the database and projecting them to GameResponseDTO
    [HttpGet("all")]
    public async Task<ActionResult<PagedResponseDTO<GameResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination)
    {
        var games = await db.Games
            .OrderBy(g => g.Slug) // Ordering is required, otherwise Postgres can return the rows in a different order on each page
            .Skip((pagination.Page - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ProjectToType<GameResponseDTO>()
            .ToListAsync();

        return Ok(Utils.CreatePagedResponse(
            games,
            await db.Games.CountAsync(),
            pagination,
            page => Url.Action(nameof(GetAll), new { Page = page, pagination.PageSize })
        ));
    }

	// searching by the RAWG id the same one used for the RAWG request below
    [HttpGet("{rawgGameId:int}")]
    public async Task<ActionResult<GameResponseDTO>> GetById(int rawgGameId)
    {
        var game = await db.Games
            .Where(g => g.RawgGameId == rawgGameId)
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