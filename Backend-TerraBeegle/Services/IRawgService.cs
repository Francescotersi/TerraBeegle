using Backend_TerraBeegle.DTOS;

namespace Backend_TerraBeegle.Services;

public interface IRawgService
{
    // null = the game does not exist on RAWG
    Task<GameResponseDTO?> GetGameAsync(int rawgGameId);
}
