using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class PlatformFamily
{
    public long Id { get; set; }
    public GamePlatformFamily ApiPlatformFamilyId { get; set; }               // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public ICollection<Platform> Platforms { get; set; } = [];
}