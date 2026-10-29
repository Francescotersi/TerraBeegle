using Backend_TerraBeegle.Models;
using System.Security.Cryptography;
using System.Text;

namespace Backend_TerraBeegle.Services;

public class EmailVerificationService(IEmailService emailService) : IEmailVerificationService
{
    private const string Characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private const int CodeLength = 8;
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(15);

    public string HashCode(string code)
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

    public async Task SendCodeAsync(string email, string code)
    {
        string subject = "TerraBeegle Verification Code";
        string text = $@"Hello,

Use the following verification code to confirm your email address:

{code}

This code will expire in {CodeLifetime.TotalMinutes} minutes.

If you did not request this verification, you can safely ignore this email.

Best regards,
The TerraBeegle Team";
        await emailService.SendAsync(email, subject, text);
    }
}