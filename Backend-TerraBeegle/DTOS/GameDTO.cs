using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record GameCardDTO
{
    public long ApiGameId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Cover { get; set; }
    public double? Rating { get; set; }
    public int? CriticRating { get; set; }
    public string? GameType { get; set; }
    public string? GameStatus { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
    public List<ThemeDTO> Themes { get; set; } = [];
}

public class GameDetailsDTO
{
    public long ApiGameId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Cover { get; set; }
    public double? Rating { get; set; }
    public int? CriticRating { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public string? GameType { get; set; }
    public string? GameStatus { get; set; }
    public string Summary { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Website { get; set; } = null!;
    public List<CompanyDTO>? Developer { get; set; }
    public List<CompanyDTO>? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
    public List<ThemeDTO> Themes { get; set; } = [];
    // public List<KeywordDTO> Keywords { get; set; } = [];
    // public List<StoreDTO> Stores { get; set; } = [];
    // public List<LanguageSupportDTO> LanguageSupports { get; set; } = [];
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
}

public class GameSearchResponseDTO
{
    public int Count { get; set; }
    public IEnumerable<GameCardDTO> Results { get; set; } = [];
}