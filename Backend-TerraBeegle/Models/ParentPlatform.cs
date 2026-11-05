using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class ParentPlatform
{
    public long Id { get; set; }
    public GameParentPlatform RawgPlatformId { get; set; }             // RAWG Id
    public string Name { get; set; } = null!;
    public string? Image { get; set; }
    public ICollection<Platform> Platforms { get; set; } = [];
    public ICollection<Game> Games { get; set; } = [];
}