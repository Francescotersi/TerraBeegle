using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface ITokenService
{
    // Creates a JWT for the user
    string CreateToken(User user);
}