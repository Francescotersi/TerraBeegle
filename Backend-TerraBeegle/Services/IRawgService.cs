using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IRawgService
{
    // Searches games at RAWG
    Task<GameSearchResponseDTO?> SearchGamesAsync(string query);
    // Gets a game's details from the database or RAWG
    Task<GameResponseDTO?> GetGameAsync(int rawgGameId);
    // Returns the saved game, saving it from RAWG if needed
    Task<Game?> GetOrCreateGameAsync(int rawgGameId);
}
