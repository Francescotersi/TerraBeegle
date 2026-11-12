using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Image
{
    public long Id { get; set; }
    public string ApiImageId { get; set; } = null!;              // IGDB Id
    public long? GameId { get; set; }
    public Game? Game { get; set; }
    public Company? Company { get; set; }
    public Platform? Platform { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}