using Backend_TerraBeegle.DTOS;
using System.Globalization;
using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Data;
using Mapster;
using IGDB;
using IGDB.Models;

namespace Backend_TerraBeegle.Services;

// All the communication with the IGDB API: key, URLs, JSON options and mapping to our DTOs
public class IGDBService(AppDbContext db, IGDBClient igdb) : IIGDBService
{
    // IGDB sends the fields in snake_case (background_image, name_original, ...)
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query)
    {
        IGDB.Models.Game[]? response;
        try
        {
            var fields = "fields id,name,slug,name_original,summary,first_release_date,aggregated_rating,aggregated_rating_count,cover.url,genres.name,platforms.name;";
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{fields}{query}");
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
            Results = response.Select(ToGameCardDTO),
            Count = response.Count
        };
    }

    private async Task<IGDBGameDetailsDTO?> FetchGameAsync(int GameId)
    {
        IGDB.Models.Game[]? response;
        try
        {
            static string strFields(string str) => $"{str}.name,{str}.slug";
            static string strUrlFields(string str) => $"{strFields(str)}.rating,{str}.cover.url";

            var keyFields = "id,name,slug,storyline,summary,first_release_date,artworks.url";

            var ageRatingsFields = "age_ratings.organization,age_ratings.rating_category";
            var aggregatedRatingFields = "aggregated_rating,aggregated_rating_count";
            var bundlesFields = strUrlFields("bundles");
            var dlcsFields = strUrlFields("dlcs");
            var expansionsFields = strUrlFields("expansions");
            var externalGamesFields = "external_games.url,external_games.external_game_source";
            var franchisesFields = strFields("franchises");
            var game_modesFields = strFields("game_modes");
            var genresFields = strFields("genres");

            //var companiesFields = "involved_companies.company.name,involved_companies.company.slug";

            var keywordsFields = strFields("keywords");
            var platformsFields = strFields("platforms") + ",platforms.abbreviation,platforms.platform_family";
            var playerPerspectivesFields = strFields("player_perspectives");

            //from release_dates

            var ratingsFields = "rating,rating_count";

            var fields = $"fields {keyFields},{ageRatingsFields},{aggregatedRatingFields},{bundlesFields},{dlcsFields},{expansionsFields},{externalGamesFields},{franchisesFields},{game_modesFields},{genresFields},{ratingsFields};";
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{fields} w id = {GameId};");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        
        return response;
    }

    // The only place where a game is looked up for GET /api/games/{id}: first in the database, then at IGDB
    public async Task<GameResponseDTO?> GetGameAsync(int IGDBGameId)
    {
        // ProjectToType puts the genres and the platforms in the same SELECT (an Adapt on the entity
        // without Include would return them empty). Placeholders are skipped, so they come from IGDB
        var game = await db.Games
            .Where(g => g.ApiGameId == IGDBGameId && !g.IsPlaceholder)
            .ProjectToType<GameResponseDTO>()
            .FirstOrDefaultAsync();

        if (game is not null)
        {
            return game;
        }

        var response = await FetchGameAsync(IGDBGameId);

        if (response is null)
            return null;

        return ToGameResponseDTO(response);
    }

    public async Task<Models.Game?> GetOrCreateGameAsync(int IGDBGameId)
    {
        var game = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == IGDBGameId);
        if (game is not null)
        {
            return game;
        }
        
        var response = await FetchGameAsync(IGDBGameId);
        if (response is null)
        {
            return null;
        }
        
        // loads the genres and the platforms that already exist in the DB using their ID
        var genreIds = response.Genres.Select(g => (GameGenre)g.Id).ToList();
        var existingGenres = await db.Genres.Where(g => genreIds.Contains(g.ApiGenreId)).ToListAsync();

        var platformIds = response.Platforms.Select(p => (GamePlatform)p.Platform.Id).ToList();
        var existingPlatforms = await db.Platforms.Where(p => platformIds.Contains(p.ApiPlatformId)).ToListAsync();
        
        game = new Models.Game
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
                ?? new Models.Platform
                {
                    Name = p.Platform.Name,
                    ApiPlatformId = (GamePlatform)p.Platform.Id
                })
            ],
            Genres = [
                .. response.Genres.Select(g => existingGenres.FirstOrDefault(eg => eg.ApiGenreId == (GameGenre)g.Id) 
                ?? new Models.Genre
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

    private static readonly Func<IGDBGameDTO, GameCardDTO> ToGameCardDTO = r => new GameCardDTO
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

    private static readonly Func<IGDBGameIdDTO, GameResponseDTO> ToGameResponseDTO = r => new GameResponseDTO
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
