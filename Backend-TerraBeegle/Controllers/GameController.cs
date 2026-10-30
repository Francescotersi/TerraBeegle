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
        if (!string.IsNullOrWhiteSpace(search.Title))
            search.Title = $"search={search.Title.Trim()}";

        if (search.Page <= 0)
            search.Page = 1;
        
        if (search.PageSize <= 0 || search.PageSize > 40) //controllare il massimo consentito da RAWG
            search.PageSize = 20;

        if (!string.IsNullOrWhiteSpace(search.SortBy))
        {
            var allowedSortValues = new[] { "name", "released", "added", "created", "updated", "rating", "metacritic" };
            search.SortBy = search.SortBy.Trim().ToLowerInvariant();

            if (allowedSortValues.Contains(search.SortBy))
            {
                search.SortBy = $"order={(search.Ascending ? search.SortBy : $"-{search.SortBy}")}";
            }
            else
            {
                return BadRequest("Invalid sort parameter. Allowed values are 'name', 'released', 'added', 'created', 'updated', 'rating', or 'metacritic'.");
            }
        }
        
        string query = $"{search.Title}&page={search.Page}&page_size={search.PageSize}";
        var games = await rawgService.SearchGamesAsync(query);

        return Ok(games);
    }

	// retrieving all games from the database and projecting them to GameResponseDTO
    [HttpGet("all")]
    public async Task<ActionResult<PagedResponseDTO<GameResponseDTO>>> GetAll([FromQuery] PaginationDTO pagination)
    {
        var games = await db.Games
            .OrderBy(g => g.Name) // Ordering is required, otherwise Postgres can return the rows in a different order on each page
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