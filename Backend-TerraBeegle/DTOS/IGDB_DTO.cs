using System.Text.Json.Serialization;

namespace Backend_TerraBeegle.DTOS;

public class IGDBSearchDTO
{
    public int Count { get; set; }
    public string? Next { get; set; }
    public string? Previous { get; set; }
    public IEnumerable<IGDBGameDTO> Results { get; set; } = [];
}

public class IGDBGameDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int? Metacritic { get; set; }
    public string? Released { get; set; }
    public bool Tba { get; set; }
    public string? BackgroundImage { get; set; }
    public double Rating { get; set; }
    public IEnumerable<IGDBParentPlatformListDTO> ParentPlatforms { get; set; } = [];
    public IEnumerable<IGDBPlatformListDTO> Platforms { get; set; } = [];
    public IEnumerable<IGDBGenreDTO> Genres { get; set; } = [];
}

public class IGDBGameDetailsDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string NameOriginal { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? Summary { get; set; }
    public int? Metacritic { get; set; }
    public string? Released { get; set; }
    public bool Tba { get; set; }
    public string? BackgroundImage { get; set; }
    public double Rating { get; set; }
    public string Website { get; set; } = null!;
    public IEnumerable<IGDBParentPlatformListDTO> ParentPlatforms { get; set; } = [];
    public IEnumerable<IGDBPlatformListDTO> Platforms { get; set; } = [];
    public IEnumerable<IGDBGenreDTO> Genres { get; set; } = [];
}

public class IGDBPlatformListDTO
{
    [JsonPropertyName("platform")]
    public IGDBPlatformDTO Platform { get; set; } = null!;

    [JsonPropertyName("released_at")]
    public string? ReleasedAt { get; set; }
}

public class IGDBParentPlatformListDTO
{
    [JsonPropertyName("platform")]
    public IGDBPlatformDTO Platform { get; set; } = null!;
}

public class IGDBPlatformDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class IGDBGenreDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class IGDBObjectDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}