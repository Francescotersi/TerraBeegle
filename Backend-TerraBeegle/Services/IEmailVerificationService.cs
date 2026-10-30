using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IEmailVerificationService
{
    string SetNewCode(User user);
    string HashCode(string code);
    Task SendCodeAsync(string email, string code);
}