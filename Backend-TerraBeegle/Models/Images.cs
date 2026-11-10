using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Image
{
    public long Id { get; set; }
    public string ApiImageId { get; set; } = null!;              // IGDB Id
    public ImageType? Type { get; set; }
    public Game? Game { get; set; }
    public Company? Company { get; set; }
    public Platform? Platform { get; set; }
    public ICollection<Game> ArtworksOfGames { get; set; } = [];
    public ICollection<Game> ScreenshotsOfGames { get; set; } = [];
}