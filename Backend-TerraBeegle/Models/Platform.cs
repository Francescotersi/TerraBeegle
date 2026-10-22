namespace Backend_TerraBeegle.Models;

public class Platform
{
    public long Id { get; set; }
    public GamePlatform RawgPlatformId { get; set; }             // RAWG Id
    public string Name { get; set; } = string.Empty;
    public ICollection<Game> Games { get; set; } = [];
}