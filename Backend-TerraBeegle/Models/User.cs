using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class User
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string FamilyName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ImageProfile { get; set; }          // URL imagine
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public Theme Theme { get; set; } = Theme.Light;       // "light" | "dark"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsVerified { get; set; } = true; // da cambiare a false quando si implementa la verifica dell'email
    public bool IsChangingMail { get; set; } = false;
    public string? VerificationToken { get; set; }
    public DateTime? TokenExpiration { get; set; }
    public DateTime? TokenRefresh { get; set; }
    
    public ICollection<Friendship> FriendRequestsAsUser1 { get; set; } = [];
    public ICollection<Friendship> FriendRequestsAsUser2 { get; set; } = [];
    public ICollection<Game> Favorites { get; set; } = [];
    public ICollection<Game> WishlistItems { get; set; } = [];
}