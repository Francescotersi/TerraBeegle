using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db, IHttpClientFactory httpClientFactory, string ApiKey) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameResponseDTO>>> GetAll()
    {
        // Retrieving all games from the database and projecting them to GameResponseDTO
        var games = await db.Games.ProjectToType<GameResponseDTO>().ToListAsync();
        return games;
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<GameResponseDTO>> GetById(long id)
    {
        // Searching for the game by ID
        var game = await db.Games.FindAsync(id);
        if (game is null)
        {
            var client = httpClientFactory.CreateClient("RawgAPI");
            try
            {
                var url = $"games/{id}?key={ApiKey}";
                Console.WriteLine($"Fetching game with ID {id} from RAWG API.");
                Console.WriteLine($"Request URL: {url}");
                var response = await client.GetFromJsonAsync<RawgResponseDTO>(url);
                if (response is null)
                    return NotFound();

                var gameData = new GameResponseDTO
                {
                    RawgGameId = response.id,
                    Name = response.name,
                    Description = response.description,
                    BackgroundImage = response.background_image,
                    Released = response.released,
                    Tba = response.tba,
                    Website = response.website,
                    Rating = response.rating,
                    Metacritic = response.metacritic,
                };

                return Ok(gameData);
            } 
            catch (HttpRequestException)
            {
                return Problem(detail: "External API is unavailable.", statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        }

        return game.Adapt<GameResponseDTO>();
    }
}