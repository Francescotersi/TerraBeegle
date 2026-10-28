using Backend_TerraBeegle.DTOS;
using System.Globalization;
using System.Net;
using System.Text.Json;

namespace Backend_TerraBeegle.Services;

// All the communication with the RAWG API: key, URLs, JSON options and mapping to our DTOs
public class RawgService(IConfiguration config, IHttpClientFactory httpClientFactory) : IRawgService
{
    // RAWG sends the fields in snake_case (background_image, name_original, ...)
    private static readonly JsonSerializerOptions RawgJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public async Task<GameResponseDTO?> GetGameAsync(int rawgGameId)
    {
        var client = httpClientFactory.CreateClient("RawgAPI");

        RawgResponseDTO? response;
        try
        {
            response = await client.GetFromJsonAsync<RawgResponseDTO>(WithKey($"games/{rawgGameId}"), RawgJsonOptions);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (response is null)
            return null;

        return new GameResponseDTO
        {
            RawgGameId = response.Id,
            Title = response.Name,
            Slug = response.Slug,
            NameOriginal = response.NameOriginal,
            Description = response.Description,
            BackgroundImage = response.BackgroundImage,
            ReleaseDate = DateOnly.TryParse(response.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
            Tba = response.Tba,
            Website = response.Website,
            Rating = response.Rating,
            Metacritic = response.Metacritic,
            Platforms = [
                .. response.Platforms.Select(p => new PlatformDTO
                {
                    Name = p.Platform.Name,
                    RawgPlatformId = p.Platform.Id,
                    Slug = p.Platform.Slug,
                    ReleasedAt = p.ReleasedAt
                })
            ],
            Genres = [
                .. response.Genres.Select(g => new GenreDTO
                {
                    Name = g.Name,
                    RawgGenreId = g.Id,
                    Slug = g.Slug
                })
            ]
        };
    }

    // Adds the API key to every RAWG URL, so the next methods (search, genres, ...) don't repeat it
    private string WithKey(string path)
    {
        var separator = path.Contains('?') ? '&' : '?';
        return $"{path}{separator}key={config["EnvironmentVariables:RAWG_API_KEY"]}";
    }
}
