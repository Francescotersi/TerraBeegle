using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Genre
{
    public long Id { get; set; }
    public GameGenre RawgGenreId { get; set; }               // RAWG Id
    public string Name { get; set; } = string.Empty;
    public ICollection<Game> Games { get; set; } = [];
}