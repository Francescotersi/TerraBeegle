using System.ComponentModel.DataAnnotations;

namespace Backend_TerraBeegle.DTOS;

public class PaginationDTO
{
    [Range(1, 10000)]
    public int Page { get; set; } = 1;
    
    [Range(1, 50)]
    public int PageSize { get; set; } = 20;
}

public class PagedResponseDTO<T>
{
    public List<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public string? PreviousPageUrl { get; set; }
    public string? NextPageUrl { get; set; }
}