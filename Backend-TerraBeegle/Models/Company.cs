namespace Backend_TerraBeegle.Models;

public class Company
{
    public long Id { get; set; }
    public long ApiCompanyId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;

    public Image? CompanyLogo { get; set; }

    public ICollection<Game> PublishedGames { get; set; } = [];
    public ICollection<Game> DevelopedGames { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}