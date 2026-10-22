using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;

using Mapster;

namespace Backend_TerraBeegle.Controllers;

[ApiController]
[Route("api/games")]
public class GameController(AppDbContext db, IHttpClientFactory httpClientFactory) : ControllerBase
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
            
        }

        return game.Adapt<GameResponseDTO>();
    }
}