using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public record PaginationDTO
{
    [Range(1, 10000)]
    public int Page { get; init; } = 1;
    
    [Range(1, 500)]
    public int PageSize { get; init; } = 24;
}

public record PagedResponseDTO<T>
{
    public List<T> Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages { get; init; }
    public string? PreviousPageUrl { get; init; }
    public string? NextPageUrl { get; init; }
}