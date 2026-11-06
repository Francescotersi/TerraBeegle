namespace Backend_TerraBeegle.Models;

public class Game
{
    public long Id { get; set; }
    public int ApiGameId { get; set; }                // API Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = null!;
    public bool IsPlaceholder { get; set; } = false; // If true, this game is a placeholder for a game that is not yet in the database. It will be replaced by the real game when it is added to the database.
    public string? BackgroundImage { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool Tba { get; set; }
    public string? Website { get; set; }

    public decimal? Rating { get; set; }
    public long? RatingCount { get; set; }
    public int? Rating5count { get; set; }
    public int? Rating4count { get; set; }
    public int? Rating3count { get; set; }
    public int? Rating2count { get; set; }
    public int? Rating1count { get; set; }
    public int? Metacritic { get; set; }

    public string? NameOriginal { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ApiObject> DLCs { get; set; } = [];
    public ICollection<ApiObject> ParentGames { get; set; } = [];
    public ICollection<ApiObject> Series { get; set; } = [];

    public ICollection<Genre> Genres { get; set; } = [];
    // public ICollection<Tags> Stores { get; set; } = [];
    // public ICollection<Store> Stores { get; set; } = [];
    // public ICollection<Developer> Developers { get; set; } = [];
    // public ICollection<Publisher> Publishers { get; set; } = [];

    public ICollection<Platform> Platforms { get; set; } = [];
    public ICollection<ParentPlatform> ParentPlatforms { get; set; } = [];

    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<User> FavoritedByUsers { get; set; } = [];
    public ICollection<User> WishlistedByUsers { get; set; } = [];
}