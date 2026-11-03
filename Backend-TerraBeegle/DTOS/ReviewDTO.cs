using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class ReviewCreateDTO
{
    [Range(1, 5)]
    public int Rating { get; set; }               // 1-5
    public long GameId { get; set; }               // RAWG Id
    public string? Content { get; set; }
}

public class ReviewUpdateDTO
{
    public long Id { get; set; }
    [Range(1, 5)]
    public int Rating { get; set; }               // 1-5
    public string? Content { get; set; }
}

public class ReviewResponseDTO
{
    public long Id { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }               // 1-5
    public string? Content { get; set; }
    public UserPublicResponseDTO User { get; set; } = null!;
}