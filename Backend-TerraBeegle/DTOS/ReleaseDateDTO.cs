namespace Backend_TerraBeegle.DTOS;

public record ReleaseDateDTO
{
    public DateTime? Date { get; init; }
    public string? Human { get; init; }
    public string? Status { get; init; }
    public string? PlatformName { get; init; }
}