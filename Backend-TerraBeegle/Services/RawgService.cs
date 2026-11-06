using Backend_TerraBeegle.DTOS;
using System.Globalization;
using System.Net;
using System.Text.Json;
using Backend_TerraBeegle.Data;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Mapster;
using Backend_TerraBeegle.Controllers;

namespace Backend_TerraBeegle.Services;

// All the communication with the Api API: key, URLs, JSON options and mapping to our DTOs
public class ApiService(AppDbContext db, IConfiguration config, IHttpClientFactory httpClientFactory) : IRawgService
{
    // Api sends the fields in snake_case (background_image, name_original, ...)
    private static readonly JsonSerializerOptions ApiJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query)
    {
        var client = httpClientFactory.CreateClient("RawgAPI");

        RawgSearchDTO? response;
        try
        {
            if (!string.IsNullOrWhiteSpace(query))
                query = "?" + query;

            response = await client.GetFromJsonAsync<RawgSearchDTO>(WithKey($"games{query}"), ApiJsonOptions);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (response is null)
        {
            return new GameSearchResponseDTO { 
                Results = [],
                Count = 0
            };
        }

        return new GameSearchResponseDTO {
            Results = [.. response.Results.Select(ToGameCardDTO)],
            Count = response.Count
        };
    }

    private async Task<RawgGameIdDTO?> FetchGameAsync(int ApiGameId)
    {
        var client = httpClientFactory.CreateClient("RawgAPI");

        RawgGameIdDTO? response;
        try
        {
            response = await client.GetFromJsonAsync<RawgGameIdDTO>(WithKey($"games/{ApiGameId}"), ApiJsonOptions);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        
        return response;
    }

    // The only place where a game is looked up for GET /api/games/{id}: first in the database, then at Api
    public async Task<GameResponseDTO?> GetGameAsync(int ApiGameId)
    {
        // ProjectToType puts the genres and the platforms in the same SELECT (an Adapt on the entity
        // without Include would return them empty). Placeholders are skipped, so they come from Api
        var game = await db.Games
            .Where(g => g.ApiGameId == ApiGameId && !g.IsPlaceholder)
            .ProjectToType<GameResponseDTO>()
            .FirstOrDefaultAsync();

        if (game is not null)
        {
            return game;
        }

        var response = await FetchGameAsync(ApiGameId);

        if (response is null)
            return null;

        return ToGameResponseDTO(response);
    }

    public async Task<Game?> GetOrCreateGameAsync(int ApiGameId)
    {
        var game = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == ApiGameId);
        if (game is not null)
        {
            return game;
        }
        
        var response = await FetchGameAsync(ApiGameId);
        if (response is null)
        {
            return null;
        }
        
        // loads the genres and the platforms that already exist in the DB using their ID
        var genreIds = response.Genres.Select(g => (GameGenre)g.Id).ToList();
        var existingGenres = await db.Genres.Where(g => genreIds.Contains(g.ApiGenreId)).ToListAsync();

        var platformIds = response.Platforms.Select(p => (GamePlatform)p.Platform.Id).ToList();
        var existingPlatforms = await db.Platforms.Where(p => platformIds.Contains(p.ApiPlatformId)).ToListAsync();
        
        game = new Game
        {
            ApiGameId = response.Id,
            Name = response.Name,
            Slug = response.Slug,
            NameOriginal = response.NameOriginal,
            Description = response.Description,
            BackgroundImage = response.BackgroundImage,
            ReleaseDate = DateOnly.TryParse(response.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
            Tba = response.Tba,
            Website = response.Website,
            Rating = (decimal)response.Rating,
            Metacritic = response.Metacritic,
            Platforms = [
                .. response.Platforms.Select(p => existingPlatforms.FirstOrDefault(ep => ep.ApiPlatformId == (GamePlatform)p.Platform.Id) 
                ?? new Platform
                {
                    Name = p.Platform.Name,
                    ApiPlatformId = (GamePlatform)p.Platform.Id
                })
            ],
            Genres = [
                .. response.Genres.Select(g => existingGenres.FirstOrDefault(eg => eg.ApiGenreId == (GameGenre)g.Id) 
                ?? new Genre
                {
                    Name = g.Name,
                    ApiGenreId = (GameGenre)g.Id
                })
            ]
        };
        
        db.Games.Add(game);
        await db.SaveChangesAsync();
        return game;
    }
    
    private string WithKey(string path)
    {
        var separator = path.Contains('?') ? '&' : '?';
        return $"{path}{separator}key={config["EnvironmentVariables:Api_API_KEY"]}";
    }

    private static readonly Func<RawgGameDTO, GameCardDTO> ToGameCardDTO = r => new GameCardDTO
    {
        ApiGameId = r.Id,
        Name = r.Name,
        BackgroundImage = r.BackgroundImage,
        Rating = r.Rating,
        ReleaseDate = DateOnly.TryParse(r.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
        Tba = r.Tba,
        Platforms = [
            .. r.Platforms.Select(p => new PlatformDTO
            {
                Name = p.Platform.Name,
                ApiPlatformId = p.Platform.Id,
                Slug = p.Platform.Slug,
                ReleasedAt = p.ReleasedAt
            })
        ],
        Genres = [
            .. r.Genres.Select(g => new GenreDTO
            {
                Name = g.Name,
                ApiGenreId = g.Id,
                Slug = g.Slug
            })
        ]
    };
    private static readonly Func<RawgGameIdDTO, GameResponseDTO> ToGameResponseDTO = r => new GameResponseDTO
    {
        ApiGameId = r.Id,
        Name = r.Name,
        Slug = r.Slug,
        NameOriginal = r.NameOriginal,
        Description = r.Description,
        BackgroundImage = r.BackgroundImage,
        ReleaseDate = DateOnly.TryParse(r.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
        Tba = r.Tba,
        Website = r.Website,
        Rating = r.Rating,
        Metacritic = r.Metacritic,
        Platforms = [
            .. r.Platforms.Select(p => new PlatformDTO
            {
                Name = p.Platform.Name,
                ApiPlatformId = p.Platform.Id,
                Slug = p.Platform.Slug,
                ReleasedAt = p.ReleasedAt
            })
        ],
        Genres = [
            .. r.Genres.Select(g => new GenreDTO
            {
                Name = g.Name,
                ApiGenreId = g.Id,
                Slug = g.Slug
            })
        ]
    };
}
