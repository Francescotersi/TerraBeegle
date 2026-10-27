namespace Backend_TerraBeegle.DTOS;

public class PlatformDTO
{
    public string Name { get; set; } = null!;
    public int RawgPlatformId { get; set; }               // RAWG Id
    public string Slug { get; set; } = null!;
    public string? ReleasedAt { get; set; }
}
