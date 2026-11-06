using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IIGDBService
{
    Task<GameSearchResponseDTO?> SearchGamesAsync(string query);
    Task<GameResponseDTO?> GetGameAsync(int rawgGameId);
    Task<Game?> GetOrCreateGameAsync(int rawgGameId);
}
