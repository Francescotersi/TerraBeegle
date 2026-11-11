using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Services;

public interface ITwoFactorService
{
    // Starts a 2FA login: returns the challenge, its token and the code
    (LoginChallenge Challenge, string Token, string Code) CreateChallenge(User user);
    // Hashes a challenge token
    string HashToken(string token);
    // Checks a 2FA code against the challenge
    CodeVerificationResult VerifyChallenge(LoginChallenge challenge, string code);
    // Creates a new code for the challenge
    string RenewCode(LoginChallenge challenge);
    // Emails the 2FA code
    Task SendCodeAsync(string email, string code);
}