using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Genre
{
    public long Id { get; set; }
    public GameGenre ApiGenreId { get; set; }               // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public ICollection<Game> Games { get; set; } = [];
}