namespace Backend_TerraBeegle.DTOS;

public class GenreDTO
{
    public string Name { get; set; } = null!;
    public long ApiGenreId { get; set; }           // IGDB Id
    public string Slug { get; set; } = null!;
}