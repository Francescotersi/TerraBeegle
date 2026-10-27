using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface ITokenService
{
    string CreateToken(User user);
}