using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Game
{
    public long Id { get; set; }
    public int ApiGameId { get; set; }                // API Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Summary { get; set; } = null!;
    public PegiRating? PegiRating { get; set; }
    public bool IsPlaceholder { get; set; } = false; // If true, this game is a placeholder for a game that is not yet in the database. It will be replaced by the real game when it is added to the database.
    public Image? Cover { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool? Tba { get; set; }
    public string? Website { get; set; }

    public decimal? Rating { get; set; }
    public int? AggregatedRating { get; set; }

    public string? NameOriginal { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Image> Artworks { get; set; } = [];
    public ICollection<Image> Screenshots { get; set; } = [];

    public ICollection<Game> DLCs { get; set; } = [];
    public ICollection<Game> ParentGames { get; set; } = [];
    public ICollection<Game> Series { get; set; } = [];

    public ICollection<Genre> Genres { get; set; } = [];
    public ICollection<Theme> Themes { get; set; } = [];
    // public ICollection<Store> Stores { get; set; } = [];
    // public ICollection<Developer> Developers { get; set; } = [];
    // public ICollection<Publisher> Publishers { get; set; } = [];

    public ICollection<Platform> Platforms { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
    public ICollection<User> FavoritedByUsers { get; set; } = [];
    public ICollection<User> WishlistedByUsers { get; set; } = [];
}