namespace Backend_TerraBeegle.Models;

public class RawgObject
{
    public long Id { get; set; }
    public int RawgId { get; set; }               // RAWG Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}
