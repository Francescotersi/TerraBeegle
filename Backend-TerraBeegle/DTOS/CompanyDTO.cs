namespace Backend_TerraBeegle.DTOS;

public record CompanyDTO
{
    public long ApiCompanyId { get; init; }
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
    public string? Logo { get; init; }
    public string? Country { get; init; }
    public string? Description { get; init; }
    public ICollection<GameCardDTO> PublishedGames { get; init; } = [];
    public ICollection<GameCardDTO> DevelopedGames { get; init; } = [];
}