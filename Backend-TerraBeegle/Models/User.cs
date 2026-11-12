using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class User
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string FamilyName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ImageProfile { get; set; }          // image URL
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public UserTheme Theme { get; set; } = UserTheme.Light;       // "light" | "dark"
    public DogCompanion DogCompanion { get; set; } = DogCompanion.Beagle;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool EmailVerified { get; set; }
    public string? EmailVerificationCodeHash { get; set; }
    public DateTime? EmailVerificationCodeExpiration { get; set; }
    public int EmailVerificationAttempts { get; set; }
    public string? PendingEmail { get; set; }

    public bool ForgotPasswordRequested { get; set; } = false;    
    public bool TwoFactorEnabled { get; set; } = false;

    public LoginChallenge? LoginChallenge { get; set; }
    
    public ICollection<Friendship> FriendRequestsAsUser1 { get; set; } = [];
    public ICollection<Friendship> FriendRequestsAsUser2 { get; set; } = [];

    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<Game> Favorites { get; set; } = [];
    public ICollection<Game> WishlistItems { get; set; } = [];
}