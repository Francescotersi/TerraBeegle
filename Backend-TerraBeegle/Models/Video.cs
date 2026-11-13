namespace Backend_TerraBeegle.Models;

public class Video
{
    public long Id { get; set; }
    public string ApiVideoId { get; set; } = null!;              // IGDB Id
    public long? GameId { get; set; }
    public Game? Game { get; set; }
}