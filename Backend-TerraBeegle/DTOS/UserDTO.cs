using System.ComponentModel.DataAnnotations;
using Backend_TerraBeegle.Enums;

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
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDTO
{
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
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
    public string? Name { get; set; }
    public string? Username { get; set; }
    public string? FamilyName { get; set; }
    public string? Email { get; set; }
    public string? ImageProfile { get; set; }
    public Theme? Theme { get; set; }
}

public class UpdatePasswordDTO
{
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public UserResponseDTO User { get; set; } = null!;
}