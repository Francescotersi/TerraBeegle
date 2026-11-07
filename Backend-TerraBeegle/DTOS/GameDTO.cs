using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class GameMinDTO
{
    public int RawgGameId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public double? Rating { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool Tba { get; set; }
}

public class GameResponseDTO : GameMinDTO
{
    public string NameOriginal { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Website { get; set; } = null!;
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
}


public class GameCardDTO : GameMinDTO
{
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
    //public List<ParentPlatformDTO> ParentPlatforms { get; set; } = [];
    public List<ReviewResponseDTO> Reviews { get; set; } = [];
}

public class GameSearchDTO
{
    [Range(1, 1000000)]
    public int? Page { get; set; } = 1;

    [Range(1, 40)]
    public int? PageSize { get; set; } = 20;
    public bool SearchPrecise { get; set; } = false;
    public bool SearchExact { get; set; } = false;

    [StringLength(12)]
    [RegularExpression(@"^(?i:name|released|added|created|updated|rating|metacritic)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'added', 'created', 'updated', 'rating', or 'metacritic'.")]
    public string? SortBy { get; set; }
    public bool Ascending { get; set; } = true;

    public string? Name { get; set; }
    public string? ParentPlatforms { get; set; }
    public string? Platforms { get; set; }
    public string? Stores { get; set; }
    public string? Developers { get; set; }
    public string? Publishers { get; set; }
    public string? Creators { get; set; }
    public string? Genres { get; set; }
    public string? Tags { get; set; }
    public string? ReleaseDate { get; set; }
    public string? Updated { get; set; }
    public int? PlatformsCount { get; set; }
    public string? Metacritic { get; set; }
    public bool? ExcludeAdditions { get; set; }
    public bool? ExcludeParents { get; set; }
    public bool? ExcludeGameSeries { get; set; }
    public string? ExcludeStores { get; set; }
}

public class GameSearchResponseDTO
{
    public int Count { get; set; }
    public IEnumerable<GameCardDTO> Results { get; set; } = [];
}

public class UserGameSearchDTO : PaginationDTO
{
    [MaxLength(100)]
    public string? Name { get; set; }
    public int? Genre { get; set; }
    public int? Platform { get; set; }
    
    [Range(1950, 2100)]
    public int? Year { get; set; }

    [Range(0.0, 5.0)]
    public decimal? MinRating { get; set; }
    
    [RegularExpression(@"^(?i:name|released|rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released' or 'rating'.")]
    public string? SortBy { get; set; }
    
    public bool Ascending { get; set; } = true;
}