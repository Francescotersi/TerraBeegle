namespace Backend_TerraBeegle.DTOS;

public record ApiObjectDTO
{
    public long ApiObjectId { get; init; }           // IGDB Id
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
}