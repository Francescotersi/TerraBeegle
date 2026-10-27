using System.Text.Json.Serialization;

namespace Backend_TerraBeegle.DTOS;

public class RawgResponseDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string NameOriginal { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int? Metacritic { get; set; }
    public string? Released { get; set; }
    public bool Tba { get; set; }
    public string? BackgroundImage { get; set; }
    public double Rating { get; set; }
    public string Website { get; set; } = null!;
    public IEnumerable<RawgParentPlatformListDTO> ParentPlatforms { get; set; } = [];
    public IEnumerable<RawgPlatformListDTO> Platforms { get; set; } = [];
    public IEnumerable<RawgGenreDTO> Genres { get; set; } = [];
}

public class RawgPlatformListDTO
{
    [JsonPropertyName("platform")]
    public RawgPlatformDTO Platform { get; set; } = null!;

    [JsonPropertyName("released_at")]
    public string? ReleasedAt { get; set; }
}

public class RawgParentPlatformListDTO
{
    [JsonPropertyName("platform")]
    public RawgPlatformDTO Platform { get; set; } = null!;
}

public class RawgPlatformDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class RawgGenreDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}