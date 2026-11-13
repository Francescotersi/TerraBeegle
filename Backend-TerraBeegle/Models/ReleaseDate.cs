namespace Backend_TerraBeegle.Models;

public class ReleaseDate
{
    public long Id { get; set; }
    public DateOnly? Date { get; set; }
    public string Human { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Platform { get; set; } = null!;

    public long GameId { get; set; }
    public Game Games { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}