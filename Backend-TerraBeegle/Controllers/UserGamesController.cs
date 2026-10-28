using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.DTOS;
using Microsoft.AspNetCore.Mvc;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;  
using Microsoft.AspNetCore.Authorization;
using Backend_TerraBeegle.Services;
using Mapster;

namespace Backend_TerraBeegle.Controllers;

[Authorize]
[ApiController]
[Route("api/users/{userId:long}")]
public class UserGamesController(AppDbContext db, IRawgService rawgService) : ControllerBase
{
    [HttpGet("favorites")]
    public async Task<ActionResult<IEnumerable<GameCardDTO>>> GetFavorites(long userId)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            return NotFound("User not found.");
        }
        
        return await db.Users
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Favorites)
            .OrderBy(g => g.Title)
            .ProjectToType<GameCardDTO>()
            .ToListAsync();
    }

    [HttpPost("favorites/{rawgGameId:int}")]
    public async Task<IActionResult> AddGameToFavorites(long userId, int rawgGameId)
    {
        if (!IsCurrentUser(userId))
            return Forbid();

        Game? game;
        try
        {
            game = await rawgService.GetOrCreateGameAsync(rawgGameId);
        }
        catch (HttpRequestException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }
        
        if (game is null)
            return NotFound("Game not found.");
        
        var user = await db.Users.Include(u => u.Favorites.Where(g => g.Id == game.Id)).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return NotFound("User not found.");

        if (user.Favorites.Count > 0)
            return NoContent();

        user.Favorites.Add(game);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("favorites/{rawgGameId:int}")]
    public async Task<IActionResult> DeleteGameFromFavorites(long userId, int rawgGameId)
    {
        if(!IsCurrentUser(userId))
            return Forbid();
        
        var user = await db.Users.Include(u => u.Favorites.Where(g => g.RawgGameId == rawgGameId)).FirstOrDefaultAsync(u => u.Id == userId);
        if(user is null)
            return NotFound("User not found.");
        
        var game = user.Favorites.FirstOrDefault();
        if(game is null)
            return NotFound("Game not found.");

        user.Favorites.Remove(game);
        await db.SaveChangesAsync();
        return NoContent();
    }
    
    private bool IsCurrentUser(long id)
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return long.TryParse(sub, out var tokenUserId) && tokenUserId == id;
    }
}