using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class RegisterDTO
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string FamilyName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    [RegularExpression(@"^[-a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores or dashes.")]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}])[-A-Za-z\d`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}]{8,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Passwords do not match.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class LoginDTO
{
    [Required]
    public string EmailOrUsername { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}

    // Only needed when the email is not verified yet (the code sent on register / resend-email)
    [StringLength(8, MinimumLength = 8)]
    public string? Code { get; set; }
}

public class ResendEmailDTO
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
}

public class AuthResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public UserResponseDTO User { get; set; } = null!;
}