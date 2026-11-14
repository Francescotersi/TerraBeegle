namespace Backend_TerraBeegle.Models;

public class Website
{
    public long Id { get; set; }
    public string Url { get; set; } = null!;              // IGDB Id
    public long Type { get; set; }                        // IGDB Id
    public bool IsStore { get; set; } = false;                  // IGDB Id
    public long? GameId { get; set; }
    public Game? Game { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}