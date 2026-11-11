namespace Backend_TerraBeegle.DTOS;

public class CompanyDTO
{
    public long ApiCompanyId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Logo { get; set; }
    public string? Country { get; set; }
    public string? Description { get; set; }
    public ICollection<GameCardDTO> PublishedGames { get; set; } = [];
    public ICollection<GameCardDTO> DevelopedGames { get; set; } = [];
}