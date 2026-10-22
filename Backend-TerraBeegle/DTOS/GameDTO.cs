namespace Backend_TerraBeegle.DTOS;

public class GameResponseDTO
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BackgroundImage { get; set; }
    public string? Released { get; set; }
    public double? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
}



