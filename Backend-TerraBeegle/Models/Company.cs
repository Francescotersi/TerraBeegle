namespace Backend_TerraBeegle.Models;

public class Company
{
    public long Id { get; set; }
    public int ApiCompanyId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public long? LogoId { get; set; }
    public Image? Logo { get; set; }
    public string? Country { get; set; }
    public string? Description { get; set; }
    public ICollection<Game> PublishedGames { get; set; } = [];
    public ICollection<Game> DevelopedGames { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}