using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class ReviewCreateDTO
{
    [Range(1, 10)]
    public int Rating { get; set; }               // 1-10
    public long GameId { get; set; }               // IGDB Id
    public string? Content { get; set; }
}

public class ReviewUpdateDTO
{
    public long Id { get; set; }
    [Range(1, 10)]
    public int Rating { get; set; }               // 1-10
    public string? Content { get; set; }
}

public class ReviewResponseDTO
{
    public long Id { get; set; }

    [Range(1, 10)]
    public int Rating { get; set; }               // 1-10
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserPublicResponseDTO? User { get; set; }
    public GameDetailsDTO? Game { get; set; }
}