namespace Backend_TerraBeegle.DTOS;

public class GenreDTO
{
    public long ApiGenreId { get; set; }           // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}