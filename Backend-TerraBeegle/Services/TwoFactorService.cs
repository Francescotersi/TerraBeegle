using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;
using System.Security.Cryptography;
using System.Text;

namespace Backend_TerraBeegle.Services;

public class TwoFactorService(IEmailVerificationService emailVerificationService) : ITwoFactorService
{
    public static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(5);

    public static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(15);

    private const int MaxAttempts = 5;
    private const int TokenBytes = 32;

    public (LoginChallenge Challenge, string Token, string Code) CreateChallenge(User user)
    {
        string token = Convert.ToHexString(RandomNumberGenerator.GetBytes(TokenBytes));
        string code = SecureCode.Generate();
        var now = DateTime.UtcNow;

        // hashes are saved
        var challenge = new LoginChallenge
        {
            UserId = user.Id,
            User = user,
            TokenHash = HashToken(token),
            CodeHash = SecureCode.Hash(code),
            CodeExpiration = now + CodeLifetime,
            CodeAttempts = 0,
            TokenExpiration = now + TokenLifetime
        };

        return (challenge, token, code);
    }

    // No Trim / ToUpper (unlike SecureCode.Hash): the token is not typed, so it must match exactly.
    // A plain SHA256 is enough: 256 random bits cannot be guessed, a slow hash would not add anything
    public string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }

    public CodeVerificationResult VerifyChallenge(LoginChallenge challenge, string code)
    {
        var now = DateTime.UtcNow;

        // Both limits: the current code and the whole login
        if (challenge.TokenExpiration < now || challenge.CodeExpiration < now)
            return CodeVerificationResult.Expired;

        if (challenge.CodeAttempts >= MaxAttempts)
            return CodeVerificationResult.TooManyAttempts;

        if (!SecureCode.Matches(challenge.CodeHash, code))
        {
            challenge.CodeAttempts++;
            return CodeVerificationResult.Invalid;
        }

        // Nothing to clear here: on success the controller deletes the whole challenge
        return CodeVerificationResult.Valid;
    }

    public string RenewCode(LoginChallenge challenge)
    {
        string code = SecureCode.Generate();
        var newExpiration = DateTime.UtcNow + CodeLifetime;

        challenge.CodeHash = SecureCode.Hash(code);
        challenge.CodeAttempts = 0;
        // TokenExpiration never changes, so resending cannot keep a login alive forever
        challenge.CodeExpiration = newExpiration < challenge.TokenExpiration ? newExpiration : challenge.TokenExpiration;

        return code;
    }

    public async Task SendCodeAsync(string email, string code)
    {
        await emailVerificationService.SendCodeAsync(email, code, EmailCodePurpose.TwoFactorLogin);
    }
}
