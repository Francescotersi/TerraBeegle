using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using System.Text.Json;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db, IHttpClientFactory httpClientFactory, IConfiguration config) : ControllerBase
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
                var ApiKey = config["EnvironmentVariables:RAWG_API_KEY"];
                var url = $"games/{id}?key={ApiKey}";
                var response = await client.GetFromJsonAsync<RawgResponseDTO>(url, RawgJsonOptions);
                if (response is null)
                    return NotFound();

                var gameData = new GameResponseDTO
                {
                    RawgGameId = response.Id,
                    Name = response.Name,
                    Slug = response.Slug,
                    NameOriginal = response.NameOriginal,
                    Description = response.Description,
                    BackgroundImage = response.BackgroundImage,
                    Released = response.Released,
                    Tba = response.Tba,
                    Website = response.Website,
                    Rating = response.Rating,
                    Metacritic = response.Metacritic,
                    ParentPlatforms = [
                        .. response.Platforms.Select(p => new PlatformDTO
                        {
                            Name = p.Platform.Name,
                            RawgPlatformId = p.Platform.Id,
                            Slug = p.Platform.Slug,
                        })
                    ],
                    Platforms = [
                        .. response.Platforms.Select(p => new PlatformDTO
                        {
                            Name = p.Platform.Name,
                            RawgPlatformId = p.Platform.Id,
                            Slug = p.Platform.Slug,
                            ReleasedAt = p.ReleasedAt
                        })
                    ],
                    Genres = [
                        .. response.Genres.Select(g => new GenreDTO
                        {
                            Name = g.Name,
                            RawgGenreId = g.Id,
                            Slug = g.Slug
                        })
                    ]
                };

                return Ok(gameData);
            } 
            catch (HttpRequestException)
            {
                return StatusCode(503,"External API is unavailable.");
            }
        }

        return Ok(game.Adapt<GameResponseDTO>());
    }
    
    private static readonly JsonSerializerOptions RawgJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };
}