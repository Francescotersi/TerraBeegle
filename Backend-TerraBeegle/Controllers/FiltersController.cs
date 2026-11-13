using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Backend_TerraBeegle.DTOS;
using IGDB;

namespace Backend_TerraBeegle.Controllers;

// Lists for the advanced search filters (sidebar): genres, themes and platforms from IGDB, cached for 24 hours
[ApiController]
[Route("api")]
public class FiltersController(IGDBClient igdb, IMemoryCache cache, ILogger<FiltersController> logger) : ControllerBase
{
    // They change very rarely, and IGDB limits the number of requests
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

    // All IGDB genres, sorted by name
    [HttpGet("genres")]
    public Task<ActionResult<List<ApiObjectDTO>>> GetGenres() =>
        GetListAsync<IGDB.Models.Genre>("filters:genres", IGDBClient.Endpoints.Genres,
            g => new ApiObjectDTO { Id = g.Id ?? 0, Name = g.Name, Slug = g.Slug });

    [HttpGet("themes")]
    public Task<ActionResult<List<ApiObjectDTO>>> GetThemes() =>
        GetListAsync<IGDB.Models.Theme>("filters:themes", IGDBClient.Endpoints.Themes,
            t => new ApiObjectDTO { Id = t.Id ?? 0, Name = t.Name, Slug = t.Slug });

    // All IGDB platforms, sorted by name
    [HttpGet("platforms")]
    public Task<ActionResult<List<ApiObjectDTO>>> GetPlatforms() =>
        GetListAsync<IGDB.Models.Platform>("filters:platforms", IGDBClient.Endpoints.Platforms,
            p => new ApiObjectDTO { Id = p.Id ?? 0, Name = p.Name, Slug = p.Slug });

    // Shared by the filter lists: from the cache, otherwise from IGDB (500 = the IGDB maximum per request)
    private async Task<ActionResult<List<ApiObjectDTO>>> GetListAsync<T>(string cacheKey, string endpoint, Func<T, ApiObjectDTO> map)
    {
        if (cache.TryGetValue(cacheKey, out List<ApiObjectDTO>? cached) && cached is not null)
            return Ok(cached);

        T[] response;
        try
        {
            response = await igdb.QueryAsync<T>(endpoint, query: "fields id,name,slug; limit 500; sort name asc;");
        }
        catch (Exception ex) when (ex is RestEase.ApiException or HttpRequestException)
        {
            logger.LogError(ex, "Could not load {Endpoint} from IGDB", endpoint);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "External API is unavailable.");
        }

        var items = response.Select(map).Where(item => !string.IsNullOrWhiteSpace(item.Name)).ToList();
        cache.Set(cacheKey, items, CacheDuration);
        return Ok(items);
    }
}
