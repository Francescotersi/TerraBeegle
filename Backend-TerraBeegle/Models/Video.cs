namespace Backend_TerraBeegle.Models;

public class Video
{
    public long Id { get; set; }
    public string ApiVideoId { get; set; } = null!;              // IGDB Id
    public string Name { get; set; } = null!;
    public long? GameId { get; set; }
    public Game? Game { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}