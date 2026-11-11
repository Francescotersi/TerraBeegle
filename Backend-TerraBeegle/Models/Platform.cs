using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Platform
{
    public long Id { get; set; }

    public GamePlatform ApiPlatformId { get; set; }             // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Abbreviation { get; set; } = null!;

    public long? LogoId { get; set; }
    public Image? Logo { get; set; }

    public GamePlatformFamily? PlatformFamilyId { get; set; }
    public PlatformFamily? PlatformFamily { get; set; }

    public ICollection<Game> Games { get; set; } = [];
}