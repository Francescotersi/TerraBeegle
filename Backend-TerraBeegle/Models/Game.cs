using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Game
{
    public long Id { get; set; }
    public int RawgGameId { get; set; }                // RAWG Id
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? CoverImageUrl { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool Tba { get; set; }
    public decimal? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Genre> Genres { get; set; } = [];
    public ICollection<Platform> Platforms { get; set; } = [];
    public ICollection<User> FavoritedByUsers { get; set; } = [];
    public ICollection<User> WishlistedByUsers { get; set; } = [];
}