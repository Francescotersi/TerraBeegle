using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public interface IEmailVerificationService
{
    // Creates a new code for the user and returns it
    string SetNewCode(User user);
    // Checks a code typed by the user
    CodeVerificationResult VerifyCode(User user, string code);
    // Emails the code with the text for its purpose
    Task SendCodeAsync(string email, string code, EmailCodePurpose purpose);
}