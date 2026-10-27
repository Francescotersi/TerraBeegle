using System.ComponentModel.DataAnnotations;

using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.DTOS;

public class UserPublicResponseDTO
{
    public long Id { get; set; }
    public string? ImageProfile { get; set; }
    public string Username { get; set; } = string.Empty;
    public List<GameResponseDTO>? Favorites { get; set; }
    public List<GameResponseDTO>? Whishlist { get; set; }
}

public class UserResponseDTO
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageProfile { get; set; }
    public string Username { get; set; } = string.Empty;
    public Theme Theme { get; set; }
}

public class UpdateUserDTO
{
    [MaxLength(100)]
    public string? Name { get; set; }

    [MaxLength(100)]
    [RegularExpression(@"^[-a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores or dashes.")]
    public string? Username { get; set; }

    [MaxLength(100)]
    public string? FamilyName { get; set; }
    public string? ImageProfile { get; set; }
    public Theme? Theme { get; set; }
}

public class UpdateEmailDTO
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
}

public class UpdatePasswordDTO
{
    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}])[-A-Za-z\d`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}]{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; } = string.Empty;
}