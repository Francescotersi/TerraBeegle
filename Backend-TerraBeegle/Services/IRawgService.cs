using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IRawgService
{
    Task<GameResponseDTO?> GetGameAsync(int rawgGameId);

    Task<Game?> GetOrCreateGameAsync(int rawgGameId);
}
