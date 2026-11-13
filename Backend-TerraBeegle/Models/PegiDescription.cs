using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class PegiDescription
{
    public long Id { get; set; } 
    public PegiDescriptionEnum Name { get; set; }

    public ICollection<Game> Games { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}