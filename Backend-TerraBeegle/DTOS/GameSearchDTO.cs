using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record GameSearchDTO : IValidatableObject
{
    // Sorting (no StringLength: the regex already allows only these 4 values, and "critic_rating" has 13 characters)
    [RegularExpression(@"^(name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating', or 'critic_rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = true;

    // Name search
    public string? Name { get; init; }
    public bool SearchExact { get; init; } = false;
    public bool SearchStartExact { get; init; } = false;
    public bool CaseSensitive { get; init; } = false;

    // Platforms
    // [Range(1, 9, ErrorMessage = "PlatformsFamily must be between 1 and 9.")]
    public int[]? PlatformsFamily { get; init; }
    public bool PlatformsFamilyExact { get; init; } = true;
    public int[]? Platforms { get; init; }
    public bool PlatformsExact { get; init; } = true;

    // Genres and Themes
    // [AllowedValues(4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 
    //     ErrorMessage = "Invalid genre ID.")] // Example allowed values for genre IDs
    public int[]? Genres { get; init; }
    public bool GenresExact { get; init; } = true;
    public int[]? Themes { get; init; }
    public bool ThemesExact { get; init; } = true;

    // Keywords
    public int[]? Keywords { get; init; }
    public bool KeywordsExact { get; init; } = true;

    // Game Types
    public int[]? GameType { get; init; }

    // Developers and Publishers
    public int[]? Developers { get; init; }
    public bool DevelopersExact { get; init; } = true;
    public int[]? Publishers { get; init; }
    public bool PublishersExact { get; init; } = true;

    // Stores
    // [AllowedValues(10, 11, 12, 13, 15, 16, 17, 22, 23, 24, 25, 26, ErrorMessage = "Invalid store ID.")] // Example allowed values for store IDs
    public int[]? Stores { get; init; }
    public bool StoresExact { get; init; } = true;

    // Date
    public int? ReleaseYearMin { get; init; }
    public int? ReleaseYearMax { get; init; }

    // Ratings: user rating out of 10 with decimals, like the sidebar slider sends it (the controller converts it
    // to the IGDB 0-100 scale), critic score out of 100
    [Range(0.0, 10.0)]
    public decimal? RatingMin { get; init; }
    [Range(0.0, 10.0)]
    public decimal? RatingMax { get; init; }

    [Range(0, 100)]
    public int? CriticRatingMin { get; init; }
    [Range(0, 100)]
    public int? CriticRatingMax { get; init; }

    // Minimum number of votes, so a game rated 100 by 2 people does not top the list; 0 = no minimum
    // (a search by name sends 0, otherwise games without critic reviews could never be found)
    [Range(0, 1000000)]
    public int? MinRatingCount { get; init; } = 25;
    [Range(0, 1000000)]
    public int? MinCriticRatingCount { get; init; } = 5;

    // PEGI Ratings
    [Range(8, 12, ErrorMessage = "PEGI rating must be between 8 and 12.")]
    public int[]? PegiRating { get; init; }

    // Max >= min, checked only when both are sent. [Compare] cannot do this: it requires the two values to be EQUAL,
    // so sending only RatingMin = 8 gave 400 (8 != null)
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (RatingMin > RatingMax)
            yield return new ValidationResult("RatingMax must be greater than or equal to RatingMin.", [nameof(RatingMax)]);
        if (CriticRatingMin > CriticRatingMax)
            yield return new ValidationResult("CriticRatingMax must be greater than or equal to CriticRatingMin.", [nameof(CriticRatingMax)]);
        if (ReleaseYearMin > ReleaseYearMax)
            yield return new ValidationResult("ReleaseYearMax must be greater than or equal to ReleaseYearMin.", [nameof(ReleaseYearMax)]);
    }
}

public record GameComingSoonSearchDTO
{
    // Name search
    public string? Name { get; init; }
    public bool SearchExact { get; init; } = false;
    public bool SearchStartExact { get; init; } = false;
    public bool CaseSensitive { get; init; } = false;

    // Platforms
    // [Range(1, 9, ErrorMessage = "PlatformsFamily must be between 1 and 9.")]
    public int[]? PlatformsFamily { get; init; }
    public bool PlatformsFamilyExact { get; init; } = true;
    public int[]? Platforms { get; init; }
    public bool PlatformsExact { get; init; } = true;

    // Genres and Themes
    // [AllowedValues(4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 
    //     ErrorMessage = "Invalid genre ID.")] // Example allowed values for genre IDs
    public int[]? Genres { get; init; }
    public bool GenresExact { get; init; } = true;
    public int[]? Themes { get; init; }
    public bool ThemesExact { get; init; } = true;

    // Keywords
    public int[]? Keywords { get; init; }
    public bool KeywordsExact { get; init; } = true;

    // Game Types
    public int[]? GameType { get; init; }

    // Developers and Publishers
    public int[]? Developers { get; init; }
    public bool DevelopersExact { get; init; } = true;
    public int[]? Publishers { get; init; }
    public bool PublishersExact { get; init; } = true;

    // Date
    [Range(1, 24, ErrorMessage = "Months must be between 1 and 24.")]
    public int? Months { get; init; } = 6;
}

public record GameSearchResponseDTO
{
    public int Count { get; init; }
    public IEnumerable<GameCardDTO> Results { get; init; } = [];
}

public record UserGameSearchDTO : IValidatableObject
{
    [MaxLength(100)]
    public string? Name { get; init; }
    public int? Genre { get; init; }
    public int? Platform { get; init; }
    
    [Range(1950, 2100)]
    public int? MinYear { get; init; }

    [Range(1950, 2100)]
    public int? MaxYear { get; init; }
    public int? GameType { get; init; }

    [Range(0.0, 10.0)]
    public decimal? MinRating { get; init; }
    [Range(0.0, 10.0)]
    public decimal? MaxRating { get; init; }

    [Range(0, 100)]
    public int? MinCriticRating { get; init; }
    [Range(0, 100)]
    public int? MaxCriticRating { get; init; }

    [RegularExpression(@"^(name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating' or 'critic_rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = true;

    // Max >= min, checked only when both are sent (see GameSearchDTO.Validate)
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (MinYear > MaxYear)
            yield return new ValidationResult("MaxYear must be greater than or equal to MinYear.", [nameof(MaxYear)]);
        if (MinRating > MaxRating)
            yield return new ValidationResult("MaxRating must be greater than or equal to MinRating.", [nameof(MaxRating)]);
        if (MinCriticRating > MaxCriticRating)
            yield return new ValidationResult("MaxCriticRating must be greater than or equal to MinCriticRating.", [nameof(MaxCriticRating)]);
    }
}
