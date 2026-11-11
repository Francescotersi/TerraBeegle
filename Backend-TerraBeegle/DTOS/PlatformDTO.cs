namespace Backend_TerraBeegle.DTOS;

public class PlatformDTO
{
    public string Name { get; set; } = null!;
    public long ApiPlatformId { get; set; }               // IGDB Id
    public string Slug { get; set; } = null!;
    public string Abbreviation { get; set; } = null!;
    public string? Logo { get; set; }
    public PlatformFamilyDTO? PlatformFamily { get; set; }
}

public class PlatformFamilyDTO
{
    public long ApiPlatformFamilyId { get; set; }               // IGDB Id
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
}
