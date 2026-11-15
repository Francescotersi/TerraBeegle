using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record RegisterDTO
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FamilyName { get; init; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    [RegularExpression(@"^[-a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores or dashes.")]
    public string Username { get; init; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; init; } = string.Empty;
    
    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}])[-A-Za-z\d`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}]{8,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; init; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; init; } = string.Empty;
}

public class LoginDTO
{
    [Required]
    public string EmailOrUsername { get; init; } = string.Empty;
    [Required]
    public string Password { get; init; } = string.Empty;

    // Only needed when the email is not verified yet (the code sent on register / resend-email)
    [StringLength(8, MinimumLength = 8, ErrorMessage = "Verification code must be 8 characters long.")]
    public string? Code { get; init; }
}

public class TwoFactorLoginDTO
{
    [Required]
    [StringLength(64, MinimumLength = 64)]
    public string ChallengeToken { get; init; } = string.Empty;
    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Code { get; init; } = string.Empty;
}

public class TwoFactorResendDTO
{
    [Required]
    [StringLength(64, MinimumLength = 64)]
    public string ChallengeToken { get; init; } = string.Empty;
}

public class SendEmailDTO
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; init; } = string.Empty;
}

public class ForgotPasswordDTO
{
    [Required]
    public string EmailOrUsername { get; init; } = string.Empty;

    [Required]
    [StringLength(8, MinimumLength = 8)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}])[-A-Za-z\d`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}]{8,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string NewPassword { get; init; } = string.Empty;

    [Required]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
    public string ConfirmNewPassword { get; init; } = string.Empty;
}

public class AuthResponseDTO
{
    public string? Token { get; init; }
    public UserResponseDTO? User { get; init; }
    public bool Requires2FA { get; init; }
    public string? ChallengeToken { get; init; }
}