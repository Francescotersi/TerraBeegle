namespace Backend_TerraBeegle.Models;

public class Company
{
    public long Id { get; set; }
    public int ApiId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public Image? Logo { get; set; }
    public string? Country { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Game> PublishedGames { get; set; } = [];
    public ICollection<Game> DevelopedGames { get; set; } = [];
}