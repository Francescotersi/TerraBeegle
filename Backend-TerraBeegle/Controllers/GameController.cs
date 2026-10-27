using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using Backend_TerraBeegle.DTOS;
using System.Text.Json;
using System.Globalization;
using System.Net;

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

    [HttpGet("{rawgGameId:int}")]
    public async Task<ActionResult<GameResponseDTO>> GetById(int rawgGameId)
    {
        // Searching by the RAWG id, the same one used for the RAWG request below.
        var game = await db.Games
            .Where(g => g.RawgGameId == rawgGameId)
            .ProjectToType<GameResponseDTO>()
            .FirstOrDefaultAsync();
        if (game is null)
        {
            var client = httpClientFactory.CreateClient("RawgAPI");
            try
            {
                var ApiKey = config["EnvironmentVariables:RAWG_API_KEY"];
                var url = $"games/{rawgGameId}?key={ApiKey}";
                var response = await client.GetFromJsonAsync<RawgResponseDTO>(url, RawgJsonOptions);
                if (response is null)
                    return NotFound();

                var gameData = new GameResponseDTO
                {
                    RawgGameId = response.Id,
                    Title = response.Name,
                    Slug = response.Slug,
                    NameOriginal = response.NameOriginal,
                    Description = response.Description,
                    BackgroundImage = response.BackgroundImage,
                    ReleaseDate = DateOnly.TryParse(response.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
                    Tba = response.Tba,
                    Website = response.Website,
                    Rating = response.Rating,
                    Metacritic = response.Metacritic,
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
            catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound("Game not found.");
            }
            catch (HttpRequestException)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
            }
        }

        return Ok(game);
    }
    
    private static readonly JsonSerializerOptions RawgJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };
}