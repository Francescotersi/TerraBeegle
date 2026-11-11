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
    public List<GenreDTO> Genres { get; init; } = [];
    public List<PlatformDTO> Platforms { get; init; } = [];
    public List<ThemeDTO> Themes { get; init; } = [];
}

public record GameDetailsDTO
{
    public long ApiGameId { get; set; }
    public string Name { get; set; } = null!;
    public string? PegiRating { get; set; }
    public IEnumerable<string>? PegiRatingDescription { get; set; }
    public int? CriticRating { get; set; }
    public int? CriticRatingCount { get; set; }
    public IEnumerable<string>? Artworks { get; set; }
    public string? Cover { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public IEnumerable<ApiObjectDTO>? Franchises { get; set; }
    public IEnumerable<ApiObjectDTO>? GameModes { get; set; }
    public string? GameStatus { get; set; }
    public IEnumerable<ApiObjectDTO>? Genres { get; set; }
    public List<CompanyDTO>? Developers { get; set; }
    public List<CompanyDTO>? Publishers { get; set; }
    public IEnumerable<ApiObjectDTO>? Keywords { get; set; }
    public IEnumerable<PlatformDTO>? Platforms { get; set; }
    public IEnumerable<ApiObjectDTO>? Perspectives { get; set; }
    public double? Rating { get; set; }
    public int? RatingCount { get; set; }
    public IEnumerable<ReleseDateDTO>? ReleaseDates { get; set; }
    public IEnumerable<string>? Screenshots { get; set; }
    public string Slug { get; set; } = null!;
    public string? Summary { get; set; } = null!;
    public string? Storyline { get; set; } = null!;
    public IEnumerable<ApiObjectDTO>? Themes { get; set; }
    public IEnumerable<ApiObjectDTO>? Videos { get; set; }
    public string? Website { get; set; }
    public IEnumerable<WebsiteDTO>? Websites { get; set; }
    public IEnumerable<WebsiteDTO>? Stores { get; set; }
    public IEnumerable<LanguageSupportDTO>? LanguageSupports { get; set; }
    public IEnumerable<SerieDTO>? Series { get; set; }
    public string? GameType { get; set; }
    public IEnumerable<GameCardDTO>? Bundles { get; set; }
    public IEnumerable<GameCardDTO>? DLCs { get; set; }
    public IEnumerable<GameCardDTO>? ExpandedGames { get; set; }
    public IEnumerable<GameCardDTO>? Expansions { get; set; }
    public IEnumerable<GameCardDTO>? Forks { get; set; }
    public GameCardDTO? ParentGame { get; set; }
    public IEnumerable<GameCardDTO>? Ports { get; set; }
    public IEnumerable<GameCardDTO>? SimilarGames { get; set; }
    public IEnumerable<GameCardDTO>? StandaloneExpansions { get; set; }
    public IEnumerable<GameCardDTO>? Remakes { get; set; }
    public IEnumerable<GameCardDTO>? Remasters { get; set; }
    public GameCardDTO? VersionParent { get; set; }
}

public class GameSearchDTO
{
    [Range(1, 1000000)]
    public int? Page { get; set; } = 1;

    [Range(1, 50)]
    public int? PageSize { get; set; } = 24;

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

    // Genres, Themes and Game Types
    public int[]? Genres { get; set; }
    public bool GenresExact { get; set; } = true;
    public int[]? Themes { get; set; }
    public bool ThemesExact { get; set; } = true;
    public int[]? GameType { get; set; }

    // Keywords
    public int[]? Keywords { get; set; }
    public bool KeywordsExact { get; set; } = true;

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

    // PEGI Ratings
    public int[]? PegiRating { get; set; }
}

public class GameSearchResponseDTO
{
    public int Count { get; set; }
    public IEnumerable<GameCardDTO> Results { get; set; } = [];
}

public class UserGameSearchDTO
{
    [MaxLength(100)]
    public string? Name { get; set; }
    public int? Genre { get; set; }
    public int? Platform { get; set; }
    
    [Range(1950, 2100)]
    public int? MinYear { get; set; }

    [Range(1950, 2100)]
    [Compare(nameof(MinYear), ErrorMessage = "MaxYear must be greater than or equal to MinYear.")]
    public int? MaxYear { get; set; }
    public int? GameType { get; set; }

    [Range(0.0, 10.0)]
    public decimal? MinRating { get; set; }
    [Range(0.0, 10.0)]
    [Compare(nameof(MinRating), ErrorMessage = "MaxRating must be greater than or equal to MinRating.")]
    public decimal? MaxRating { get; set; }

    [Range(0, 100)]
    public int? MinCriticRating { get; set; }
    [Range(0, 100)]
    [Compare(nameof(MinCriticRating), ErrorMessage = "MaxCriticRating must be greater than or equal to MinCriticRating.")]
    public int? MaxCriticRating { get; set; }

    [RegularExpression(@"^(?i:name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating' or 'critic_rating'.")]
    public string? SortBy { get; set; }
    public bool Ascending { get; set; } = true;
}