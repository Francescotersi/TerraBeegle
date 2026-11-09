using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class GameMinDTO
{
    public int ApiGameId { get; set; }
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

    [Range(1, 50)]
    public int? PageSize { get; set; } = 20;

    // Sorting
    [StringLength(12)]
    [RegularExpression(@"^(?i:name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating', or 'critic_rating'.")]
    public string? SortBy { get; set; }
    public bool Ascending { get; set; } = true;

    // Name search
    public string? Name { get; set; }
    public bool SearchExact { get; set; } = false;
    public bool SearchStartExact { get; set; } = false;
    public bool CaseSensitive { get; set; } = false;

    // Platforms
    public int[]? PlatformsFamily { get; set; }
    public bool PlatformsFamilyExact { get; set; } = true;
    public int[]? Platforms { get; set; }
    public bool PlatformsExact { get; set; } = true;

    // Genres and Themes
    public int[]? Genres { get; set; }
    public bool GenresExact { get; set; } = true;
    public int[]? Themes { get; set; }
    public bool ThemesExact { get; set; } = true;

    // Keywords and Tags
    public int[]? Keywords { get; set; }
    public bool KeywordsExact { get; set; } = true;
    public int[]? Tags { get; set; }
    public bool TagsExact { get; set; } = true;

    // Developers and Publishers
    public int[]? Developers { get; set; }
    public bool DevelopersExact { get; set; } = true;
    public int[]? Publishers { get; set; }
    public bool PublishersExact { get; set; } = true;

    // Stores
    public int[]? Stores { get; set; }
    public bool StoresExact { get; set; } = true;
    

    // Date
    public int? ReleaseYearMin { get; set; }
    public int? ReleaseYearMax { get; set; }

    // Ratings
    public int? RatingMin { get; set; }
    public int? RatingMax { get; set; }
    public int? CriticRatingMin { get; set; }
    public int? CriticRatingMax { get; set; }

    // Exclusions
    public bool? ExcludeAdditions { get; set; }
    public bool? ExcludeRemakes { get; set; }
    public bool? ExcludeRemasters { get; set; }
    public bool? ExcludeParents { get; set; }
    public bool? ExcludeFranchises { get; set; }
}

public class GameSearchResponseDTO
{
    public int Count { get; set; }
    public IEnumerable<GameCardDTO> Results { get; set; } = [];
}