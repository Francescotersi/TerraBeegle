using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Services;

public class EmailVerificationService(IEmailService emailService) : IEmailVerificationService
{
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);
    private const int MaxAttempts = 5;

    // Creates a new code, stores its hash and returns the code
    public string SetNewCode(User user)
    {
        string code = SecureCode.Generate();
        
        user.EmailVerificationCodeHash = SecureCode.Hash(code);
        user.EmailVerificationCodeExpiration = DateTime.UtcNow + CodeLifetime;
        user.EmailVerificationAttempts = 0;
        
        return code;
    }

    // Only changes the user; the caller saves the changes (like SetNewCode)
    // Checks the code: valid, invalid, expired or too many attempts
    public CodeVerificationResult VerifyCode(User user, string code)
    {
        if (user.EmailVerificationCodeHash is null || user.EmailVerificationCodeExpiration < DateTime.UtcNow)
            return CodeVerificationResult.Expired;

        if (user.EmailVerificationAttempts >= MaxAttempts)
            return CodeVerificationResult.TooManyAttempts;

        if (!SecureCode.Matches(user.EmailVerificationCodeHash, code))
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

    // Emails the code with the text for its purpose
    public async Task SendCodeAsync(string email, string code, EmailCodePurpose purpose)
    {
        // Only the subject, the first paragraph and the "did not request" line change;
        // the code, its lifetime (except 2FA: 5 minutes) and the security warning are the same in every email
        var lifetime = purpose == EmailCodePurpose.TwoFactorLogin ? TwoFactorService.CodeLifetime : CodeLifetime;
        
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

            EmailCodePurpose.TwoFactorLogin => (
                "Your TerraBeegle login code",
                "Someone is trying to log in to your TerraBeegle account. If it was you, enter this code to finish logging in:",
                "If you are not trying to log in, someone knows your password. Do not share this code and change your password as soon as possible."),

            _ => throw new ArgumentOutOfRangeException(nameof(purpose), purpose, "Unknown email code purpose.")
        };

        string text =
$@"Hello,

{intro}

{code}

This code is valid for {lifetime.TotalMinutes} minutes and can be used only once.

For security reasons, please do not share this code with anyone. TerraBeegle will never ask you for this code by phone, email, or any other channel.

{ignoreText}

Best regards,
The TerraBeegle Team";

        await emailService.SendAsync(email, subject, text);
    }
}