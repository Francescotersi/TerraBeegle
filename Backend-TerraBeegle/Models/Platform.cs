using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Platform
{
    public long Id { get; set; }
    public GamePlatform RawgPlatformId { get; set; }             // RAWG Id
    public string Name { get; set; } = null!;
    public ICollection<Game> Games { get; set; } = [];
    public ParentPlatform? ParentPlatform { get; set; }
}