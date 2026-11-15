using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record ReviewCreateDTO
{
    [Range(1, 10)]
    public int Rating { get; init; }               // 1-10
    public long ApiGameId { get; init; }               // IGDB Id
    public string? Content { get; init; }
}

public record ReviewUpdateDTO
{
    public long Id { get; init; }
    [Range(1, 10)]
    public int Rating { get; init; }               // 1-10
    public string? Content { get; init; }
}

public record ReviewResponseDTO
{
    public long Id { get; init; }

    [Range(1, 10)]
    public int Rating { get; init; }               // 1-10
    public string? Content { get; init; }
    public DateTime CreatedAt { get; init; }
    public UserPublicResponseDTO? User { get; init; }
    public GameCardDTO? Game { get; init; }        // only filled in a user's review list (name, cover, link)
}

public record ReviewOrderDTO
{
     [RegularExpression(@"^(date|rating)$", 
        ErrorMessage = "Invalid sort parameter. Allowed values are 'date' or 'rating'.")]
    public string? SortBy { get; init; }
    public bool Ascending { get; init; } = false;
}