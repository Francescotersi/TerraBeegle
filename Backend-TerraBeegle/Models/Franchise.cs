namespace Backend_TerraBeegle.Models;

public class Franchise
{
    public long Id { get; set; }
    public long ApiFranchiseId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public ICollection<Game> Games { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}