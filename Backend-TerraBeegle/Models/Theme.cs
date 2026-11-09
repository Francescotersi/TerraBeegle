using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Theme
{
    public long Id { get; set; }
    public GameTheme ApiGenreId { get; set; }               // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public ICollection<Game> Games { get; set; } = [];
}