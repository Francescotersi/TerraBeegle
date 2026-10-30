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

// All the communication with the RAWG API: key, URLs, JSON options and mapping to our DTOs
public class RawgService(AppDbContext db, IConfiguration config, IHttpClientFactory httpClientFactory) : IRawgService
{
    // RAWG sends the fields in snake_case (background_image, name_original, ...)
    private static readonly JsonSerializerOptions RawgJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public async Task<RawgSearchDTO> SearchGamesAsync(string query)
    {
        var client = httpClientFactory.CreateClient("RawgAPI");

        RawgSearchDTO? response;
        try
        {
            response = await client.GetFromJsonAsync<RawgSearchDTO>(WithKey($"games?{query}"), RawgJsonOptions);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return new RawgSearchDTO { 
                Results = [],
                Next = null,
                Previous = null,
                Count = 0
            };
        }

        if (response is null)
        {
            return new RawgSearchDTO { 
                Results = [],
                Next = null,
                Previous = null,
                Count = 0
            };
        }

        return new RawgSearchDTO { 
            Results = [.. response.Results.Select(ToGameCardDTO)],
            Next = response.Next,
            Previous = response.Previous,
            Count = response.Count
        };
    }

    private async Task<RawgGameIdDTO?> FetchGameAsync(int rawgGameId)
    {
        var client = httpClientFactory.CreateClient("RawgAPI");

        RawgGameIdDTO? response;
        try
        {
            response = await client.GetFromJsonAsync<RawgGameIdDTO>(WithKey($"games/{rawgGameId}"), RawgJsonOptions);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        
        return response;
    }

    public async Task<GameResponseDTO?> GetGameAsync(int rawgGameId)
    {
        var game = await db.Games.FirstOrDefaultAsync(g => g.RawgGameId == rawgGameId);
        if (game is not null)
        {
            return game.Adapt<Game, GameResponseDTO>();
        }

        var response = await FetchGameAsync(rawgGameId);

        if (response is null)
            return null;

        return ToGameResponseDTO(response);
    }

    public async Task<Game?> CreateGameAsync(int rawgGameId)
    {
        var game = await db.Games.FirstOrDefaultAsync(g => g.RawgGameId == rawgGameId);
        if (game is not null)
        {
            return game;
        }
        
        var response = await FetchGameAsync(rawgGameId);
        if (response is null)
        {
            return null;
        }
        
        // loads the genres and the platforms thet already exist in the DB using their ID
        var genreIds = response.Genres.Select(g => (GameGenre)g.Id).ToList();
        var existingGenres = await db.Genres.Where(g => genreIds.Contains(g.RawgGenreId)).ToListAsync();

        var platformIds = response.Platforms.Select(p => (GamePlatform)p.Platform.Id).ToList();
        var existingPlatforms = await db.Platforms.Where(p => platformIds.Contains(p.RawgPlatformId)).ToListAsync();
        
        game = new Game
        {
            RawgGameId = response.Id,
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
                .. response.Platforms.Select(p => existingPlatforms.FirstOrDefault(ep => ep.RawgPlatformId == (GamePlatform)p.Platform.Id) 
                ?? new Platform
                {
                    Name = p.Platform.Name,
                    RawgPlatformId = (GamePlatform)p.Platform.Id
                })
            ],
            Genres = [
                .. response.Genres.Select(g => existingGenres.FirstOrDefault(eg => eg.RawgGenreId == (GameGenre)g.Id) 
                ?? new Genre
                {
                    Name = g.Name,
                    RawgGenreId = (GameGenre)g.Id
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
        return $"{path}{separator}key={config["EnvironmentVariables:RAWG_API_KEY"]}";
    }

    private static readonly Func<RawgGameDTO, GameCardDTO> ToGameCardDTO = r => new GameCardDTO
    {
        RawgGameId = r.Id,
        Title = r.Name,
        BackgroundImage = r.BackgroundImage,
        Rating = r.Rating,
        ReleaseDate = DateOnly.TryParse(r.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
        Tba = r.Tba,
        Platforms = [
            .. r.Platforms.Select(p => new PlatformDTO
            {
                Name = p.Platform.Name,
                RawgPlatformId = p.Platform.Id,
                Slug = p.Platform.Slug,
                ReleasedAt = p.ReleasedAt
            })
        ],
        Genres = [
            .. r.Genres.Select(g => new GenreDTO
            {
                Name = g.Name,
                RawgGenreId = g.Id,
                Slug = g.Slug
            })
        ]
    };

    private static readonly Func<RawgGameIdDTO, GameResponseDTO> ToGameResponseDTO = r => new GameResponseDTO
    {
        RawgGameId = r.Id,
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
                RawgPlatformId = p.Platform.Id,
                Slug = p.Platform.Slug,
                ReleasedAt = p.ReleasedAt
            })
        ],
        Genres = [
            .. r.Genres.Select(g => new GenreDTO
            {
                Name = g.Name,
                RawgGenreId = g.Id,
                Slug = g.Slug
            })
        ]
    };
}
