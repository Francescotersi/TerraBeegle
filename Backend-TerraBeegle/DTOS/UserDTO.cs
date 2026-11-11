using System.ComponentModel.DataAnnotations;

using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.DTOS;

public record UserPublicResponseDTO
{
    public long Id { get; init; }
    public string? ImageProfile { get; init; }
    public string Username { get; init; } = string.Empty;
}

public record UserResponseDTO
{
    public long Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string FamilyName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public bool EmailVerified { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public string? ImageProfile { get; init; }
    public string Username { get; init; } = string.Empty;
    public UserTheme Theme { get; init; }
}

public record UpdateUserDTO
{
    [MaxLength(100)]
    public string? Name { get; init; }

    [MaxLength(100)]
    [RegularExpression(@"^[-a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers, and underscores or dashes.")]
    public string? Username { get; init; }

    [MaxLength(100)]
    public string? FamilyName { get; init; }
    public string? ImageProfile { get; init; }
    public UserTheme? Theme { get; init; }
}

public record UpdateEmailDTO
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; init; } = string.Empty;

	[Required]
	public string Password { get; init; } = string.Empty;
}

public record ConfirmEmailDTO
{
	[Required]
	[StringLength(8, MinimumLength = 8)]
	public string Code { get; init; } = string.Empty;
}

public record UpdatePasswordDTO
{
    [Required]
    public string OldPassword { get; init; } = string.Empty;

    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}])[-A-Za-z\d`~!@#$%^&*()_=+\\|/?.,;:<>\[\]{}]{8,}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string NewPassword { get; init; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword), ErrorMessage = "The new password and confirmation password do not match.")]
    public string ConfirmNewPassword { get; init; } = string.Empty;
}

public record TwoFactorDTO
{
    [Required]
    public string Password { get; init; } = string.Empty;
}