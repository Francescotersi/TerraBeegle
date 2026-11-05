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

    public async Task SendCodeAsync(string email, string code, EmailCodePurpose purpose)
    {
        // Only the subject, the first paragraph and the "did not request" line change;
        // the code, its lifetime and the security warning are the same in every email
        var (subject, intro, ignoreText) = purpose switch
        {
            EmailCodePurpose.Register => (
                "Welcome to TerraBeegle - verify your email",
                "Thank you for creating an account with TerraBeegle. To verify your email address, enter this code the first time you log in:",
                "If you did not create a TerraBeegle account, you can safely ignore this email. The unverified account is deleted automatically after 2 days."),

            EmailCodePurpose.ResendVerification => (
                "Your new TerraBeegle verification code",
                "You asked for a new verification code. Enter it when you log in to verify your email address. Any code sent before this one no longer works:",
                "If you did not ask for a new code, you can safely ignore this email."),

            EmailCodePurpose.ForgotPassword => (
                "Reset your TerraBeegle password",
                "We received a request to reset the password of your TerraBeegle account. Enter this code to choose a new password:",
                "If you did not ask to reset your password, you can safely ignore this email. Your password stays the same."),

            EmailCodePurpose.ChangeEmail => (
                "Confirm your new TerraBeegle email address",
                "You asked to use this email address for your TerraBeegle account. Enter this code to confirm the change:",
                "If you did not ask for this change, you can safely ignore this email. The email address of the account stays the same."),

            _ => throw new ArgumentOutOfRangeException(nameof(purpose), purpose, "Unknown email code purpose.")
        };

        string text =
$@"Hello,

{intro}

{code}

This code is valid for {CodeLifetime.TotalMinutes} minutes and can be used only once.

For security reasons, please do not share this code with anyone. TerraBeegle will never ask you for this code by phone, email, or any other channel.

{ignoreText}

Best regards,
The TerraBeegle Team";

        await emailService.SendAsync(email, subject, text);
    }
}