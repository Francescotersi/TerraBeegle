using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IIGDBService
{
    Task<GameSearchResponseDTO?> SearchGamesAsync(string query, string pagination);
    Task<GameDetailsDTO?> GetGameAsync(long igdbGameId);
    // Task<Game?> GetOrCreateGameAsync(long igdbGameId);
}
