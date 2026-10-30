using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IRawgService
{
    Task<RawgSearchDTO> SearchGamesAsync(string query);
    Task<GameResponseDTO?> GetGameAsync(int rawgGameId);
    Task<Game?> CreateGameAsync(int rawgGameId);
}
