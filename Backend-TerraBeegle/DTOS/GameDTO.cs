namespace Backend_TerraBeegle.DTOS;

public class GameResponseDTO
{
    public int RawgGameId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public string? Released { get; set; }
    public bool Tba { get; set; }
    public string Website { get; set; } = null!;
    public double? Rating { get; set; }
    public int? Metacritic { get; set; }
    public string? Developer { get; set; }
    public string? Publisher { get; set; }
    public List<GenreDTO> Genres { get; set; } = [];
    public List<PlatformDTO> Platforms { get; set; } = [];
}

public class RawgResponseDTO
{
    public int id;
    public string slug = null!;
    public string name = null!;
    public string name_original = null!;
    public string description = null!;
    public int? metacritic;
    public string? released;
    public bool tba;
    public string? background_image;
    public double rating;
    public string website = null!;
    public IEnumerable<PlatformDTO> platforms = null!;
}
