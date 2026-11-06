using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Services;

public interface ITwoFactorService
{
    (LoginChallenge Challenge, string Token, string Code) CreateChallenge(User user);
    string HashToken(string token);
    CodeVerificationResult VerifyChallenge(LoginChallenge challenge, string code);
    string RenewCode(LoginChallenge challenge);
    Task SendCodeAsync(string email, string code);
}