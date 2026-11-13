namespace Backend_TerraBeegle.Models;

public class Website
{
    public long Id { get; set; }
    public string Url { get; set; } = null!;              // IGDB Id
    public int Type { get; set; }               // IGDB Id
    public long? GameId { get; set; }
    public Game? Game { get; set; }
}