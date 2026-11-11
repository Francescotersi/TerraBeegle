using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record GameCardDTO
{
    public long ApiGameId { get; init; }
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
    public string? Cover { get; init; }
    public double? Rating { get; init; }
    public int? CriticRating { get; init; }
    public string? GameType { get; init; }
    public string? GameStatus { get; init; }
    public DateOnly? ReleaseDate { get; init; }
    public List<ApiObjectDTO>? Genres { get; init; } = [];
    public List<PlatformDTO>? Platforms { get; init; } = [];
    public List<ApiObjectDTO>? Themes { get; init; } = [];
}

public record GameDetailsDTO
{
    public long ApiGameId { get; init; }
    public string Name { get; init; } = null!;
    public string? PegiRating { get; init; }
    public IEnumerable<string>? PegiRatingDescription { get; init; }
    public int? CriticRating { get; init; }
    public int? CriticRatingCount { get; init; }
    public IEnumerable<string>? Artworks { get; init; }
    public string? Cover { get; init; }
    public DateOnly? ReleaseDate { get; init; }
    public IEnumerable<ApiObjectDTO>? Franchises { get; init; }
    public IEnumerable<ApiObjectDTO>? GameModes { get; init; }
    public string? GameStatus { get; init; }
    public IEnumerable<ApiObjectDTO>? Genres { get; init; }
    public List<CompanyDTO>? Developers { get; init; }
    public List<CompanyDTO>? Publishers { get; init; }
    public IEnumerable<ApiObjectDTO>? Keywords { get; init; }
    public IEnumerable<PlatformDTO>? Platforms { get; init; }
    public IEnumerable<ApiObjectDTO>? Perspectives { get; init; }
    public double? Rating { get; init; }
    public int? RatingCount { get; init; }
    public IEnumerable<ReleaseDateDTO>? ReleaseDates { get; init; }
    public IEnumerable<string>? Screenshots { get; init; }
    public string Slug { get; init; } = null!;
    public string? Summary { get; init; } = null!;
    public string? Storyline { get; init; } = null!;
    public IEnumerable<ApiObjectDTO>? Themes { get; init; }
    public IEnumerable<VideoDTO>? Videos { get; init; }
    public string? OfficialWebsite { get; init; }
    public IEnumerable<WebsiteDTO>? Websites { get; init; }
    public IEnumerable<WebsiteDTO>? Stores { get; init; }
    public IEnumerable<LanguageSupportDTO>? LanguageSupports { get; init; }
    public IEnumerable<SerieDTO>? Series { get; init; }
    public string? GameType { get; init; }
    public IEnumerable<GameCardDTO>? Bundles { get; init; }
    public IEnumerable<GameCardDTO>? Dlcs { get; init; }
    public IEnumerable<GameCardDTO>? ExpandedGames { get; init; }
    public IEnumerable<GameCardDTO>? Expansions { get; init; }
    public IEnumerable<GameCardDTO>? Forks { get; init; }
    public GameCardDTO? ParentGame { get; init; }
    public IEnumerable<GameCardDTO>? Ports { get; init; }
    public IEnumerable<GameCardDTO>? SimilarGames { get; init; }
    public IEnumerable<GameCardDTO>? StandaloneExpansions { get; init; }
    public IEnumerable<GameCardDTO>? Remakes { get; init; }
    public IEnumerable<GameCardDTO>? Remasters { get; init; }
    public GameCardDTO? VersionParent { get; init; }
}

public record GameSearchDTO
{
    [Range(1, 1000000)]
    public int? Page { get; init; } = 1;

    [Range(1, 50)]
    public int? PageSize { get; init; } = 24;

    // Sorting
    [StringLength(12)]
    [RegularExpression(@"^(?i:name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating', or 'critic_rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = true;

    // Name search
    public string? Name { get; init; }
    public bool SearchExact { get; init; } = false;
    public bool SearchStartExact { get; init; } = false;
    public bool CaseSensitive { get; init; } = false;

    // Platforms
    public int[]? PlatformsFamily { get; init; }
    public bool PlatformsFamilyExact { get; init; } = true;
    public int[]? Platforms { get; init; }
    public bool PlatformsExact { get; init; } = true;

    // Genres, Themes and Game Types
    public int[]? Genres { get; init; }
    public bool GenresExact { get; init; } = true;
    public int[]? Themes { get; init; }
    public bool ThemesExact { get; init; } = true;
    public int[]? GameType { get; init; }

    // Keywords
    public int[]? Keywords { get; init; }
    public bool KeywordsExact { get; init; } = true;

    // Developers and Publishers
    public int[]? Developers { get; init; }
    public bool DevelopersExact { get; init; } = true;
    public int[]? Publishers { get; init; }
    public bool PublishersExact { get; init; } = true;

    // Stores
    public int[]? Stores { get; init; }
    public bool StoresExact { get; init; } = true;

    // Date
    public int? ReleaseYearMin { get; init; }
    public int? ReleaseYearMax { get; init; }

    // Ratings
    public int? RatingMin { get; init; }
    public int? RatingMax { get; init; }
    public int? CriticRatingMin { get; init; }
    public int? CriticRatingMax { get; init; }

    // PEGI Ratings
    public int[]? PegiRating { get; init; }
}

public record GameSearchResponseDTO
{
    public int Count { get; init; }
    public IEnumerable<GameCardDTO> Results { get; init; } = [];
}

public record UserGameSearchDTO
{
    [MaxLength(100)]
    public string? Name { get; init; }
    public int? Genre { get; init; }
    public int? Platform { get; init; }
    
    [Range(1950, 2100)]
    public int? MinYear { get; init; }

    [Range(1950, 2100)]
    [Compare(nameof(MinYear), ErrorMessage = "MaxYear must be greater than or equal to MinYear.")]
    public int? MaxYear { get; init; }
    public int? GameType { get; init; }

    [Range(0.0, 10.0)]
    public decimal? MinRating { get; init; }
    [Range(0.0, 10.0)]
    [Compare(nameof(MinRating), ErrorMessage = "MaxRating must be greater than or equal to MinRating.")]
    public decimal? MaxRating { get; init; }

    [Range(0, 100)]
    public int? MinCriticRating { get; init; }
    [Range(0, 100)]
    [Compare(nameof(MinCriticRating), ErrorMessage = "MaxCriticRating must be greater than or equal to MinCriticRating.")]
    public int? MaxCriticRating { get; init; }

    [RegularExpression(@"^(?i:name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating' or 'critic_rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = true;
}