namespace Backend_TerraBeegle.DTOS;

public record SerieDTO
{
    public long ApiSerieId { get; init; }               // IGDB Id
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
    public IEnumerable<GameCardDTO> Games { get; init; } = null!;
}