namespace Backend_TerraBeegle.Models;

public class Review
{
    public long Id { get; set; }
    public int Rating { get; set; }               // 1-10
    public string? Content { get; set; }

    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public long GameId { get; set; }               // IGDB Id
    public Game Game { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Update is treated as a new review, so we don't need an UpdatedAt field
}
