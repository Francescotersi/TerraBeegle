namespace Backend_TerraBeegle.Models;

public class ApiObject
{
    public long Id { get; set; }
    public int ApiId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}
