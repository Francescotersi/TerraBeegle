using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Image
{
    public long Id { get; set; }
    public string ApiImageId { get; set; } = null!;              // IGDB Id
    public ImageType? Type { get; set; }
    public ICollection<Game> Games { get; set; } = [];
}