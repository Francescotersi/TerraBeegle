using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class PegiDescription
{
    public long Id { get; set; } 
    public string Description { get; set; } = null!;

    public ICollection<Game> Games { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}