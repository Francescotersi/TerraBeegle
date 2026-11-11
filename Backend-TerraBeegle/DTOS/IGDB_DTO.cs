using System.Text.Json.Serialization;

namespace Backend_TerraBeegle.DTOS;

public record ApiObjectDTO
{
    public long Id { get; init; }           // IGDB Id
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
}

public record VideoDTO
{
    public string Name { get; init; } = null!;
    public string VideoUrl { get; init; } = null!;
}

public record WebsiteDTO
{
    public long Type { get; init; }
    public string Url { get; init; } = null!;
}