namespace Backend_TerraBeegle.Models;

public class RegisterDTO
{
    public string Name { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDTO
{
    public string Email { get; set; } = string.Empty;
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
    public UserStatus Status { get; set; }
}

public class UpdateUserDto
{
    public string? Name { get; set; }
    public string? FamilyName { get; set; }
    public string? ImageProfile { get; set; }
    public Theme? Theme { get; set; }
    public UserStatus? Status { get; set; }
}