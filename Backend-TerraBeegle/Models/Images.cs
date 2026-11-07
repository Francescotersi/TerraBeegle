using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Image
{
    public long Id { get; set; }
    public long ApiImageId { get; set; }               // RAWG Id
    public ImageType Type { get; set; }               // RAWG Id
    public string Url { get; set; } = null!;
    public long GameId { get; set; }
    public ICollection<Game> Games { get; set; } = [];
}