using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Game
{
    public long Id { get; set; }
    public long ApiGameId { get; set; }                // API Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public bool IsPlaceholder { get; set; } = false; // If true, this game is a placeholder for a game that is not yet in the database. It will be replaced by the real game when it is added to the database.

    public string? Summary { get; set; }
    public string? Storyline { get; set; }
    public int? GameType { get; set; }
    public PegiRating? PegiRating { get; set; }
   
    public DateOnly? ReleaseDate { get; set; }
    public bool? Tba { get; set; }
    public string? Website { get; set; }

    public decimal? Rating { get; set; }
    public int? AggregatedRating { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Image? Cover { get; set; }
    public ICollection<Image> Artworks { get; set; } = [];
    public ICollection<Image> Screenshots { get; set; } = [];

    public Game? ParentGame { get; set; }
    public ICollection<Game> Bundles { get; set; } = [];
    public ICollection<Game> DLCs { get; set; } = [];
    public ICollection<Game> Expansions { get; set; } = [];
    public ICollection<Game> Remakes { get; set; } = [];
    public ICollection<Game> Remasters { get; set; } = [];
    public ICollection<Game> Series { get; set; } = [];
    public ICollection<Game> Franchises { get; set; } = [];

    public ICollection<Genre> Genres { get; set; } = [];
    public ICollection<Theme> Themes { get; set; } = [];
    // public ICollection<Keyword> Keywords { get; set; } = [];
    // public ICollection<Store> Stores { get; set; } = [];
    public ICollection<Company> Developers { get; set; } = [];
    public ICollection<Company> Publishers { get; set; } = [];

    public ICollection<Platform> Platforms { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];

    public ICollection<User> FavoritedByUsers { get; set; } = [];
    public ICollection<User> WishlistedByUsers { get; set; } = [];
}