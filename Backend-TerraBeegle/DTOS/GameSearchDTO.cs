using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record GameSearchDTO
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
    public int[]? PlatformsFamily { get; init; }
    public bool PlatformsFamilyExact { get; init; } = true;
    public int[]? Platforms { get; init; }
    public bool PlatformsExact { get; init; } = true;

    // Genres and Themes
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
    [Range(1950, 2100)]
    public int? ReleaseYearMin { get; init; }
    [Range(1950, 2100)]
    [GreaterThanOrEqualTo("ReleaseYearMin", ErrorMessage = "MaxReleaseYear must be greater than or equal to MinReleaseYear.")]
    public int? ReleaseYearMax { get; init; }

    // Ratings: user rating out of 10 with decimals, like the sidebar slider sends it (the controller converts it
    // to the IGDB 0-100 scale), critic score out of 100
    [Range(0.0, 10.0)]
    public decimal? RatingMin { get; init; }
    [Range(0.0, 10.0)]
    [GreaterThanOrEqualTo("RatingMin", ErrorMessage = "MaxRating must be greater than or equal to MinRating.")]
    public decimal? RatingMax { get; init; }

    [Range(0, 100)]
    public int? CriticRatingMin { get; init; }
    [Range(0, 100)]
    [GreaterThanOrEqualTo("CriticRatingMin", ErrorMessage = "MaxCriticRating must be greater than or equal to MinCriticRating.")]
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
}

public record GameComingSoonSearchDTO
{
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

    // Genres and Themes
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

public record UserGameSearchDTO
{
    [MaxLength(100)]
    public string? Name { get; init; }
    public long[]? Genres { get; init; }
    public long[]? Platforms { get; init; }
    public long[]? Themes { get; init; }
    
    [Range(1950, 2100)]
    public int? MinYear { get; init; }

    [Range(1950, 2100)]
    [GreaterThanOrEqualTo("MinYear", ErrorMessage = "MaxYear must be greater than or equal to MinYear.")]
    public int? MaxYear { get; init; }
    public int? GameType { get; init; }

    [Range(0.0, 10.0)]
    public decimal? MinRating { get; init; }

    [Range(0.0, 10.0)]
    [GreaterThanOrEqualTo("MinRating", ErrorMessage = "MaxRating must be greater than or equal to MinRating.")]
    public decimal? MaxRating { get; init; }

    [Range(0, 100)]
    public int? MinCriticRating { get; init; }
    [Range(0, 100)]
    [GreaterThanOrEqualTo("MinCriticRating", ErrorMessage = "MaxCriticRating must be greater than or equal to MinCriticRating.")]
    public int? MaxCriticRating { get; init; }

    [RegularExpression(@"^(name|released|rating|critic_rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'name', 'released', 'rating' or 'critic_rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = true;
}

[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public sealed class GreaterThanOrEqualToAttribute(string minPropertyName) : ValidationAttribute
{
    private readonly string _minPropertyName = minPropertyName;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is null)
            return ValidationResult.Success;

        var minProperty = validationContext.ObjectType.GetProperty(_minPropertyName) ?? throw new ArgumentException($"Property '{_minPropertyName}' not found on type '{validationContext.ObjectType.FullName}'.");
        var minValue = minProperty.GetValue(validationContext.ObjectInstance);

        if (minValue is null)
            return ValidationResult.Success;

        if (value is IComparable maxComparable && minValue is IComparable minComparable)
        {
            if (maxComparable.GetType() != minComparable.GetType())
                throw new InvalidOperationException("Cannot compare values of different types.");

            int comparison = maxComparable.CompareTo(minComparable);
            bool isValid = comparison >= 0;

            if (!isValid)
            {
                var defaultError = $"{validationContext.DisplayName} must be greater than or equal to {_minPropertyName}.";

                return new ValidationResult(
                    ErrorMessage ?? defaultError,
                    [validationContext.MemberName!]
                );
            }
        }

        return ValidationResult.Success;
    }
}