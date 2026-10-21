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
    public string Theme { get; set; } = "light";       // "light" | "dark"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Game> Favorites { get; set; } = [];
    public List<Game> WishlistItems { get; set; } = [];
}

public class Game
{
    public long Id { get; set; }
    public int RawgGameId { get; set; }                // RAWG Id
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public decimal? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public long Favorites { get; set; };
    public long WishlistItems { get; set; };
}