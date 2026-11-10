using System.Text.Json.Serialization;

namespace Backend_TerraBeegle.DTOS;

public class IGDBGameDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int? Metacritic { get; set; }
    public string? Released { get; set; }
    public bool Tba { get; set; }
    public string? Cover { get; set; }
    public double Rating { get; set; }
    public IEnumerable<IGDBPlatformListDTO> Platforms { get; set; } = [];
    public IEnumerable<IGDBGenreDTO> Genres { get; set; } = [];
}

public class IGDBImageDTO
{
    public string ImageId { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? ImageType { get; set; }
}

public class IGDBGameDetailsDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Summary { get; set; }
    public string? Storyline { get; set; }

    public double Rating { get; set; }
    public long RatingCount { get; set; }
    public double TotalRating { get; set; }
    public long TotalRatingCount { get; set; }
    [JsonPropertyName("aggregated_rating")]
    public int CriticRating { get; set; }
    [JsonPropertyName("aggregated_rating_count")]
    public long CriticRatingCount { get; set; }

    public string? FirstReleaseDate { get; set; }
    public IGDBImageDTO? Cover { get; set; }
    public string? Website { get; set; }
    public IEnumerable<IGDBImageDTO>? Artworks { get; set; }
    public IEnumerable<IGDBImageDTO>? Screenshots { get; set; }
    public IEnumerable<IGDBPlatformListDTO>? Platforms { get; set; }
    public IEnumerable<IGDBGenreDTO>? Genres { get; set; } = [];
    public IEnumerable<IGDBThemeDTO>? Themes { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? Bundles { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? DLCs { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? Expansions { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? Remakes { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? Remasters { get; set; } = [];
    public IEnumerable<IGDBGameListDTO>? Series { get; set; } = [];
    public IEnumerable<IGDBGameDTO>? SimilarGames { get; set; } = [];
    public IGDBGameDTO? ParentGame { get; set; }
     public IGDBGameDTO? VersionParent { get; set; }
    public IEnumerable<IGDBGameListDTO> Franchises { get; set; } = [];
}

public class IGDBGameListDTO
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public IEnumerable<IGDBGameDTO> Games { get; set; } = [];
}

public class IGDBPlatformListDTO
{
    [JsonPropertyName("platform")]
    public IGDBPlatformDTO Platform { get; set; } = null!;

    [JsonPropertyName("released_at")]
    public string? ReleasedAt { get; set; }
}

public class IGDBPlatformDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public IGDBImageDTO? Logo { get; set; }
}

public class IGDBGenreDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class IGDBThemeDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}