namespace Backend_TerraBeegle.DTOS;

public class GameCardDTO
{
    public int RawgGameId { get; set; }
    public string Title { get; set; } = null!;
    public string? BackgroundImage { get; set; }
    public double? Rating { get; set; }
    public DateOnly? ReleaseDate { get; set; }
}