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

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query, string pagination)
    {
        IGDB.Models.Game[]? response;
        CountResponse totalCount;

        try
        {
            var fields = "fields id,name,slug,first_release_date,aggregated_rating,rating,cover.image_id,genres.name,genres.slug,platforms.slug,platforms.abbreviation,platforms.platform_logo.url,themes.name,themes.slug,game_type.type;";
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{fields}{(query.Length > 0 ? $"where {query};" : "")}{pagination}");
            totalCount = await igdb.CountAsync(IGDBClient.Endpoints.Games, query: $"{query}");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        if (response is not { Length: > 0 })
        {
            return new GameSearchResponseDTO { 
                Results = [],
                Count = totalCount.Count
            };
        }

        return new GameSearchResponseDTO {
            Results = response.Select(ToGameCardDTO),
            Count = totalCount.Count
        };
    }

    private async Task<GameDetailsDTO?> FetchGameAsync(long GameId)
    {
        IGDB.Models.Game[]? response;
        try
        {
            static string strFields(string str) => $"{str}.name,{str}.slug";
            static string strImageFields(string str, bool b = false) => $"{str}.image_id,{(b ? $",{str}.image_type" : "")}";
            static string strGameFields(string str) => $"{strFields(str)},{str}.rating,{strImageFields(str + ".cover", true)},{str}.first_release_date,{str}.game_type.type";
            static string strRatingFields(string str) => $"{str}rating,{str}.rating_count";

            var keyFields = "id,name,slug,storyline,summary,first_release_date,game_type.type";

            var ageRatingsFields = "age_ratings.organization,age_ratings.rating_category.rating,age_ratings.rating_content_descriptions.description,";
            var aggregatedRatingFields = strRatingFields("aggregated_");
            var artworksFields = strImageFields("artworks", true);
            var bundlesFields = strGameFields("bundles");
            var coverFields = strImageFields("cover", true);
            var dlcsFields = strGameFields("dlcs");
            var expandedGamesFields = strGameFields("expanded_games");
            var expansionsFields = strGameFields("expansions");
            var forksFields = strGameFields("forks");
            var franchisesFields = strFields("franchises") + "," + strGameFields("franchises.games");
            var gameModesFields = strFields("game_modes");
            var gameStatusFields = "game_status.status";
            var genresFields = strFields("genres");
            var companiesFields = "involved_companies.developer,involved_companies.publisher," + strFields("involved_companies.company") + "," + strImageFields("involved_companies.company.logo");
            var keywordsFields = strFields("keywords");
            var parentGameFields = strGameFields("parent_game");
            var platformsFields = strFields("platforms") + ",platforms.abbreviation," + strImageFields("platforms.platform_logo");
            var platformsFamilyFields = strFields("platforms.platform_family");
            var playerPerspectivesFields = strFields("player_perspectives");
            var portsFields = strGameFields("ports");
            var ratingsFields = strRatingFields("");
            var releaseDatesFields = "release_dates.human,release_dates.date,release_dates.platform.name,release_dates.status.name";
            var screenshotsFields = strImageFields("screenshots", false);
            var similarGamesFields = strGameFields("similar_games");
            var standaloneExpansionsFields = strGameFields("standalone_expansions");
            var themesFields = strFields("themes");
            var totalRatingFields = strRatingFields("total_");
            var videosFields = "videos.name,videos.video_id";
            var websitesFields = "websites.url,websites.type";
            var remakesFields = strGameFields("remakes");
            var remastersFields = strGameFields("remasters");
            var versionParentFields = strGameFields("version_parent");
            var languagesFields = "language_supports.language.name,language_supports.language_support_type.name";
            var collectionsFields = strFields("collections") + "," + strGameFields("collections.games");

            var fields = $"fields {keyFields},{ageRatingsFields}{aggregatedRatingFields},{artworksFields},{bundlesFields},{coverFields},{dlcsFields},{expandedGamesFields},{expansionsFields},{forksFields},{franchisesFields},{gameModesFields},{gameStatusFields},{genresFields},{companiesFields},{keywordsFields},{parentGameFields},{platformsFields},{platformsFamilyFields},{playerPerspectivesFields},{portsFields},{ratingsFields},{releaseDatesFields},{screenshotsFields},{similarGamesFields},{standaloneExpansionsFields},{themesFields},{totalRatingFields},{videosFields},{websitesFields},{remakesFields},{remastersFields},{versionParentFields},{languagesFields},{collectionsFields};";
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{fields} w id = {GameId};");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        
        return response is { Length: 1 } ? response[0].Adapt<GameDetailsDTO>() : null;
    }

    // The only place where a game is looked up for GET /api/games/{id}: first in the database, then at IGDB
    // public async Task<GameDetailsDTO?> GetGameAsync(long IGDBGameId)
    // {
    //     // ProjectToType puts the genres and the platforms in the same SELECT (an Adapt on the entity
    //     // without Include would return them empty). Placeholders are skipped, so they come from IGDB
    //     var game = await db.Games
    //         .Where(g => g.ApiGameId == IGDBGameId && !g.IsPlaceholder)
    //         .ProjectToType<GameDetailsDTO>()
    //         .FirstOrDefaultAsync();

    //     if (game is not null)
    //     {
    //         return game;
    //     }

    //     var response = await FetchGameAsync(IGDBGameId);

    //     if (response is null)
    //         return null;

    //     return ToGameDetailsDTO(response);
    // }

    // public async Task<Models.Game?> GetOrCreateGameAsync(long IGDBGameId)
    // {
    //     var game = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == IGDBGameId);
    //     if (game is not null)
    //     {
    //         return game;
    //     }
        
    //     var response = await FetchGameAsync(IGDBGameId);
    //     if (response is null)
    //     {
    //         return null;
    //     }
        
    //     // loads the genres and the platforms that already exist in the DB using their ID
    //     var genreIds = response.Genres.Select(g => (GameGenre)g.ApiGenreId).ToList();
    //     var existingGenres = await db.Genres.Where(g => genreIds.Contains(g.ApiGenreId)).ToListAsync();

    //     var platformIds = response.Platforms.Select(p => (GamePlatform)p.ApiPlatformId).ToList();
    //     var existingPlatforms = await db.Platforms.Where(p => platformIds.Contains(p.ApiPlatformId)).ToListAsync();
        
    //     game = new Models.Game
    //     {
    //         ApiGameId = response.Id,
    //         Name = response.Name,
    //         Slug = response.Slug,
    //         Summary = response.Summary,
    //         Cover = response.Cover.Adapt<Image>(),
    //         ReleaseDate = DateOnly.TryParse(response.FirstReleaseDate, CultureInfo.InvariantCulture, out var releaseDate) ?  : null,
    //         Tba = response.Tba,
    //         Website = response.Website,
    //         Rating = (decimal)response.Rating,
    //         CriticRating = response.Metacritic,
    //         Platforms = [
    //             .. response.Platforms.Select(p => existingPlatforms.FirstOrDefault(ep => ep.ApiPlatformId == (GamePlatform)p.Platform.Id) 
    //             ?? new Models.Platform
    //             {
    //                 Name = p.Platform.Name,
    //                 ApiPlatformId = (GamePlatform)p.Platform.Id
    //             })
    //         ],
    //         Genres = [
    //             .. response.Genres.Select(g => existingGenres.FirstOrDefault(eg => eg.ApiGenreId == (GameGenre)g.Id) 
    //             ?? new Models.Genre
    //             {
    //                 Name = g.Name,
    //                 ApiGenreId = (GameGenre)g.Id
    //             })
    //         ]
    //     };
        
    //     db.Games.Add(game);
    //     await db.SaveChangesAsync();
    //     return game;
    // }

    private static GameCardDTO ToGameCardDTO (IGDB.Models.Game g) => new ()
    {
        ApiGameId = g.Id ?? 0,
        Name = g.Name,
        Slug = g.Slug,
        Cover = ImageHelper.GetImageUrl(g.Cover?.Value?.ImageId, ImageSize.CoverBig, false),
        Rating = g.Rating,
        CriticRating = g.AggregatedRating is not null ? (int)Math.Round(g.AggregatedRating.Value) : null,
        ReleaseDate = g.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(g.FirstReleaseDate.Value.UtcDateTime) : null,
        GameType = g.GameType?.Value?.Type,
        Genres = g.Genres?.Values?.Select(genre => new GenreDTO
        {
            ApiGenreId = genre.Id ?? 0,
            Name = genre.Name,
            Slug = genre.Slug
        }).ToList() ?? [],
        Platforms = g.Platforms?.Values?.Select(platform => new PlatformDTO
        {
            ApiPlatformId = platform.Id ?? 0,
            Name = platform.Name,
            Slug = platform.Slug
        }).ToList() ?? [],
        Themes = g.Themes?.Values?.Select(theme => new ThemeDTO
        {
            ApiThemeId = theme.Id ?? 0,
            Name = theme.Name,
            Slug = theme.Slug
        }).ToList() ?? [],
        GameStatus = g.GameStatus.Value?.Status
    };

    // private static GameDetailsDTO ToGameDetailsDTO (IGDB.Models.Game r) => new ()
    // {
    //     ApiGameId = r.Id,
    //     r.Name,
    //     r.Slug,
    //     NameOriginal = r.NameOriginal,
    //     Description = r.Description,
    //     BackgroundImage = r.BackgroundImage,
    //     ReleaseDate = DateOnly.TryParse(r.Released, CultureInfo.InvariantCulture, out var releaseDate) ? releaseDate : null,
    //     Tba = r.Tba,
    //     Website = r.Website,
    //     Rating = r.Rating,
    //     Metacritic = r.Metacritic,
    //     Platforms = [
    //         .. r.Platforms.Select(p => new PlatformDTO
    //         {
    //             Name = p.Platform.Name,
    //             ApiPlatformId = p.Platform.Id,
    //             Slug = p.Platform.Slug,
    //             ReleasedAt = p.ReleasedAt
    //         })
    //     ],
    //     Genres = [
    //         .. r.Genres.Select(g => new GenreDTO
    //         {
    //             Name = g.Name,
    //             ApiGenreId = g.Id,
    //             Slug = g.Slug
    //         })
    //     ]
    // };
}
