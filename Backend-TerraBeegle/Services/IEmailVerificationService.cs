using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IEmailVerificationService
{
    string SetNewCode(User user);
    CodeVerificationResult VerifyCode(User user, string code);
    Task SendCodeAsync(string email, string code);
}