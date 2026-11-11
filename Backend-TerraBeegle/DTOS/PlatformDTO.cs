namespace Backend_TerraBeegle.DTOS;

public record PlatformDTO
{
    public string Name { get; init; } = null!;
    public long ApiPlatformId { get; init; }               // IGDB Id
    public string Slug { get; init; } = null!;
    public string Abbreviation { get; init; } = null!;
    public string? Logo { get; init; }
    public PlatformFamilyDTO? PlatformFamily { get; init; }
}

public record PlatformFamilyDTO
{
    public long ApiPlatformFamilyId { get; init; }               // IGDB Id
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
}
