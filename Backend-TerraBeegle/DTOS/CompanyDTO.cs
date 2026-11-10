namespace Backend_TerraBeegle.DTOS;

public class CompanyDTO
{
    public int ApiId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    // public ImageDTO? Logo { get; set; }
    public string? Country { get; set; }
    public string? Description { get; set; }
    public ICollection<GameCardDTO> PublishedGames { get; set; } = [];
    public ICollection<GameCardDTO> DevelopedGames { get; set; } = [];
}