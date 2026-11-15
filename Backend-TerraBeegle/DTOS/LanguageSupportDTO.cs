namespace Backend_TerraBeegle.DTOS;

public record LanguageSupportDTO
{
    public string? Language { get; init; }
    public string? LanguageSupportType { get; init; }
}