namespace Backend_TerraBeegle.Models;

public class Review
{
    public long Id { get; set; }
    public int Rating { get; set; }               // 1-5
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public long GameId { get; set; }               // IGDB Id
    public Game Game { get; set; } = null!;
}
