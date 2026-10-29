namespace Backend_TerraBeegle.DTOS;

public class GameResponseDTO
{
    public int RawgGameId { get; set; }
    public string Name { get; set; } = null!;
    public string NameOriginal { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool Tba { get; set; }
    public string Website { get; set; } = null!;
    public double? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
}

public class GameCardDTO
{
    public int RawgGameId { get; set; }
    public string Title { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public double? Rating { get; set; }
    public DateOnly? ReleaseDate { get; set; }
}

public class GameSearchDTO
{
    public int? Page { get; set; } = 1;
    public int? PageSize { get; set; } = 20;
    public bool? SearchPrecise { get; set; } = false;
    public bool? SearchExact { get; set; } = false;
    public string? SortBy { get; set; }
    public bool Ascending { get; set; } = true;

    public string? Title { get; set; } = null!;
    public string? ParentPlatforms { get; set; }
    public string? Platforms { get; set; }
    public string? Genres { get; set; }
    public int? Metacritic { get; set; }
    public string? Tags { get; set; }
    public string? Developers { get; set; }
    public string? Publishers { get; set; }
    public string? Stores { get; set; }
}
