using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;
using System.Security.Cryptography;
using System.Text;

namespace Backend_TerraBeegle.Services;

public class EmailVerificationService(IEmailService emailService) : IEmailVerificationService
{
    private const string Characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private const int CodeLength = 8;
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);
    private const int MaxAttempts = 5;

    private static string HashCode(string code)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code.Trim().ToUpperInvariant())));
    }

    public string SetNewCode(User user)
    {
        string code = RandomNumberGenerator.GetString(Characters, CodeLength);
        
        user.EmailVerificationCodeHash = HashCode(code);
        user.EmailVerificationCodeExpiration = DateTime.UtcNow + CodeLifetime;
        user.EmailVerificationAttempts = 0;
        
        return code;
    }

    // Only changes the user; the caller saves the changes (like SetNewCode)
    public CodeVerificationResult VerifyCode(User user, string code)
    {
        if (user.EmailVerificationCodeHash is null || user.EmailVerificationCodeExpiration < DateTime.UtcNow)
            return CodeVerificationResult.Expired;

        if (user.EmailVerificationAttempts >= MaxAttempts)
            return CodeVerificationResult.TooManyAttempts;

        // Fixed time comparison, so the response time does not reveal how much of the code is correct
        bool matches = CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(user.EmailVerificationCodeHash),
            Convert.FromHexString(HashCode(code)));

        if (!matches)
        {
            user.EmailVerificationAttempts++;
            return CodeVerificationResult.Invalid;
        }

        user.EmailVerified = true;
        user.EmailVerificationCodeHash = null;
        user.EmailVerificationCodeExpiration = null;
        user.EmailVerificationAttempts = 0;

        return CodeVerificationResult.Valid;
    }

    public async Task SendCodeAsync(string email, string code)
    {
        string subject = "TerraBeegle Verification Code";
        string text = 
$@"Hello,

Thank you for creating an account with TerraBeegle.

To complete the verification of your email address, please enter the following one-time verification code:

{code}

This code is valid for {CodeLifetime.TotalMinutes} minutes and can be used only once.

For security reasons, please do not share this code with anyone. TerraBeegle will never ask you to provide your verification code by phone, email, or any other channel.

If you did not request this verification, you can safely ignore this email. No changes will be made to your account.

If you have any questions or need assistance, please contact our support team.

Best regards,
The TerraBeegle Team";
        
        await emailService.SendAsync(email, subject, text);
    }
}