using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class User
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageProfile { get; set; }          // URL imagine
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Theme Theme { get; set; } = Theme.Light;       // "light" | "dark"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<Friendship> Friendships { get; set; } = [];
    public ICollection<Game> Favorites { get; set; } = [];
    public ICollection<Game> WishlistItems { get; set; } = [];
}