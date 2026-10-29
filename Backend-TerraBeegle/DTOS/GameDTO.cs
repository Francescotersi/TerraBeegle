namespace Backend_TerraBeegle.DTOS;

public class GameResponseDTO
{
    public int RawgGameId { get; set; }
    public string Title { get; set; } = null!;
    public string NameOriginal { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public DateOnly? ReleaseDate { get; set; }
    public bool Tba { get; set; }
    public string Website { get; set; } = null!;
    public double? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> ParentPlatforms { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
}
