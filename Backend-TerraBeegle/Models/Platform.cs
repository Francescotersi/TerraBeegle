using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Platform
{
    public long Id { get; set; }

    public long ApiPlatformId { get; set; }             // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Abbreviation { get; set; } = null!;

    public Image? PlatformLogo { get; set; }

    public long? PlatformFamilyId { get; set; }
    public PlatformFamily? PlatformFamily { get; set; }

    public ICollection<Game> Games { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}