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

    public static readonly string GameCardFields = "fields " + string.Join(",", [
        "id",
        "name",
        "slug",
        "first_release_date",
        "aggregated_rating",
        "rating",
        "cover.image_id",
        "genres.name",
        "genres.slug",
        "platforms.slug",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "themes.name",
        "themes.slug",
        "game_type.type"
    ]) + ";";

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query, string pagination)
    {
        IGDB.Models.Game[]? response;
        CountResponse totalCount;

        try
        {
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{GameCardFields}{(query.Length > 0 ? $"where {query};" : "")}{pagination}");
            totalCount = await igdb.CountAsync(IGDBClient.Endpoints.Games, query: $"{query}");
        }
        catch (RestEase.ApiException ex)
        {
            Console.WriteLine($"IGDB API error: {ex.StatusCode} - {ex.Content}");
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

    private static readonly string GameDetailsFields = "fields " + string.Join(",", [
        "id",
        "name",
        "age_ratings.organization",
        "age_ratings.rating_category.rating",
        "age_ratings.rating_content_descriptions.description",
        "aggregated_rating",
        "aggregated_rating_count",
        "artworks.image_id",
        "cover.image_id",
        "first_release_date",
        "franchises.name",
        "franchises.slug",
        "game_modes.name",
        "game_modes.slug",
        "game_status.status",
        "genres.name",
        "genres.slug",
        "involved_companies.company.name",
        "involved_companies.company.slug",
        "involved_companies.company.logo.image_id",
        "involved_companies.developer",
        "involved_companies.publisher",
        "keywords.name",
        "keywords.slug",
        "platforms.name",
        "platforms.slug",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "platforms.platform_family.name",
        "platforms.platform_family.slug",
        "player_perspectives.name",
        "player_perspectives.slug",
        "rating",
        "rating_count",
        "release_dates.human",
        "release_dates.date",
        "release_dates.platform.name",
        "release_dates.status.name",
        "screenshots.image_id",
        "slug",
        "storyline",
        "summary",
        "themes.name",
        "themes.slug",
        "videos.name",
        "videos.video_id",
        "websites.url",
        "websites.type",
        "language_supports.language.name",
        "language_supports.language_support_type",
        "collections.name",
        "collections.slug",
        "game_type.type",
    ]) + "," + string.Join(",", [ 
        "bundles", 
        "dlcs", 
        "expanded_games", 
        "expansions", 
        "forks", 
        "parent_game", 
        "ports", 
        "similar_games",
        "standalone_expansions",
        "remakes",
        "remasters",
        "version_parent",
        "collections.games"
    ]).Select(str => $"{str}.name,{str}.slug,{str}.aggregated_rating,{str}.rating,{str}.cover.image_id,{str}.first_release_date,{str}.game_type.type") + ";";

    private async Task<IGDB.Models.Game?> FetchGameAsync(long GameId)
    {
        IGDB.Models.Game[]? response;
        try
        {
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{GameDetailsFields} w id = {GameId};");
        }
        catch (RestEase.ApiException ex)
        {
            Console.WriteLine($"IGDB API error: {ex.StatusCode} - {ex.Content}");
            return null;
        }
        
        return response is { Length: 1 } ? response[0] : null;
    }

    // The only place where a game is looked up for GET /api/games/{id}: first in the database, then at IGDB
    public async Task<GameDetailsDTO?> GetGameAsync(long IGDBGameId)
    {
        // ProjectToType puts the genres and the platforms in the same SELECT (an Adapt on the entity
        // without Include would return them empty). Placeholders are skipped, so they come from IGDB
        var game = await db.Games
            .Where(g => g.ApiGameId == IGDBGameId && !g.IsPlaceholder)
            .ProjectToType<GameDetailsDTO>()
            .FirstOrDefaultAsync();

        if (game is not null)
        {
            return game;
        }

        var response = await FetchGameAsync(IGDBGameId);

        if (response is null)
            return null;

        return ToGameDetailsDTO(response);
    }

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

    private static List<ApiObjectDTO>? MapApiObjectList<T>(IdentitiesOrValues<T>? items) where T : class
    {
        if (items?.Values is null)
            return null;

        return items.Values?.Select(apiObject => apiObject.Adapt<ApiObjectDTO>()).ToList();
    }

    private static List<PlatformDTO>? MapPlatformList(IdentitiesOrValues<IGDB.Models.Platform>? items)
    {
        if (items?.Values is null)
            return null;

        return items.Values?.Select(platform => new PlatformDTO
        {
            ApiPlatformId = platform.Id ?? 0,
            Name = platform.Name,
            Slug = platform.Slug,
            Abbreviation = platform.Abbreviation,
            Logo = ImageHelper.GetImageUrl(platform.PlatformLogo.Value.ImageId, ImageSize.HD720, false),
            PlatformFamily = platform.PlatformFamily.Value is {} pf ? new PlatformFamilyDTO
            {
                ApiPlatformFamilyId = pf.Id ?? 0,
                Name = pf.Name,
                Slug = pf.Slug
            } : null,
        }).ToList();
    }

    private static List<CompanyDTO>? MapCompanyList(IdentitiesOrValues<InvolvedCompany>? items, bool isDev)
    {
        if (items?.Values is null)
            return null;

        bool filter(InvolvedCompany ic) => isDev ? ic.Developer == true : ic.Publisher == true;

        return items.Values?.Where(ic => ic.Company.Value is not null && filter(ic)).Select(ic => new CompanyDTO
        {
            ApiCompanyId = ic.Company.Value.Id ?? 0,
            Name = ic.Company.Value.Name ?? null!,
            Slug = ic.Company.Value.Slug ?? null!,
            Logo = ImageHelper.GetImageUrl(ic.Company?.Value?.Logo?.Value?.ImageId, ImageSize.HD720, false)
        }).ToList();
    }

    private static readonly HashSet<int> StorefrontIds = [10, 11, 12, 13, 15, 16, 17, 22, 23, 24, 25, 26];

    private static List<WebsiteDTO>? MapWebsiteList(IdentitiesOrValues<IGDB.Models.Website>? items, bool getStores)
    {
        if (items?.Values is null)
            return null;

        bool filter(IGDB.Models.Website w, int id) => getStores ? StorefrontIds.Contains(id) : !StorefrontIds.Contains(id);

        return items.Values?.Where(w => w.Url is not null && w.Type?.Id is {} id && id != 1 && filter(w, (int)id)).Select(w => new WebsiteDTO
        {
            Type = w.Type.Id ?? 0,
            Url = w.Url
        }).ToList();
    }

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
        Genres = MapApiObjectList(g.Genres),
        Platforms = MapPlatformList(g.Platforms),
        Themes = MapApiObjectList(g.Themes),
        GameStatus = g.GameStatus.Value?.Status
    };

    private static GameDetailsDTO ToGameDetailsDTO (IGDB.Models.Game g) => new ()
    {
        ApiGameId = g.Id ?? 0,
        Name = g.Name,
        PegiRating = g.AgeRatings?.Values?.FirstOrDefault(ar => ar.Organization?.Id == 2)?.RatingCategory?.Value?.Rating,
        PegiRatingDescription = g.AgeRatings?.Values?.FirstOrDefault(ar => ar.Organization?.Id == 2)?.RatingContentDescriptions?.Values?.Select(desc => desc.Description).ToList(),
        CriticRating = g.AggregatedRating is not null ? (int)Math.Round(g.AggregatedRating.Value) : null,
        CriticRatingCount = g.AggregatedRatingCount,
        Artworks = g.Artworks?.Values?.Select(a => ImageHelper.GetImageUrl(a.ImageId, ImageSize.HD720, false)).ToList() ?? [],
        Cover = ImageHelper.GetImageUrl(g.Cover?.Value?.ImageId, ImageSize.HD720, false),
        ReleaseDate = g.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(g.FirstReleaseDate.Value.UtcDateTime) : null,
        Franchises = MapApiObjectList(g.Franchises),
        GameModes = MapApiObjectList(g.GameModes),
        GameStatus = g.GameStatus?.Value?.Status,
        Genres = MapApiObjectList(g.Genres),
        Developers = MapCompanyList(g.InvolvedCompanies, true),
        Publishers = MapCompanyList(g.InvolvedCompanies, false),
        Keywords = MapApiObjectList(g.Keywords),
        Platforms = MapPlatformList(g.Platforms),
        Perspectives = MapApiObjectList(g.PlayerPerspectives),
        Rating = g.Rating,
        RatingCount = g.RatingCount,
        ReleaseDates = g.ReleaseDates?.Values?.Select(rd => new ReleaseDateDTO
        {
            Human = rd.Human,
            Date = rd.Date?.UtcDateTime,
            PlatformName = rd.Platform.Value.Name,
            Status = rd.Status.Value.Name
        }).ToList(),
        Screenshots = g.Screenshots?.Values?.Select(s => ImageHelper.GetImageUrl(s.ImageId, ImageSize.HD720, false)).ToList() ?? [],
        Slug = g.Slug,
        Summary = g.Summary,
        Storyline = g.Storyline,
        Themes = MapApiObjectList(g.Themes),
        Videos = g.Videos?.Values?.Select(v => new VideoDTO
        {
            Name = v.Name,
            VideoUrl = $"https://www.youtube.com/watch?v={v.VideoId}"
        }).ToList(),
        OfficialWebsite = g.Websites?.Values?.FirstOrDefault(w => w.Type.Id == 1)?.Url,
        Websites = MapWebsiteList(g.Websites, false),
        Stores = MapWebsiteList(g.Websites, true),
        LanguageSupports = g.LanguageSupports?.Values?.Select(ls => new LanguageSupportDTO
        {
            Language = ls.Language?.Value?.Name,
            LanguageSupportType = ls.LanguageSupportType?.Value?.Name
        }).ToList(),
        Series = g.Collections?.Values?.Select(c => new SerieDTO
        {
            ApiSerieId = c.Id ?? 0,
            Name = c.Name,
            Slug = c.Slug,
            Games = c.Games?.Values?.Select(ToGameCardDTO).ToList() ?? [],
        }).ToList(),
        GameType = g.GameType?.Value?.Type,
        Bundles = g.Bundles?.Values?.Select(ToGameCardDTO).ToList(),
        Dlcs = g.Dlcs?.Values?.Select(ToGameCardDTO).ToList(),
        ExpandedGames = g.ExpandedGames?.Values?.Select(ToGameCardDTO).ToList(),
        Expansions = g.Expansions?.Values?.Select(ToGameCardDTO).ToList(),
        Forks = g.Forks?.Values?.Select(ToGameCardDTO).ToList(),
        ParentGame = g.ParentGame?.Value is not null ? ToGameCardDTO(g.ParentGame.Value) : null,
        Ports = g.Ports?.Values?.Select(ToGameCardDTO).ToList(),
        SimilarGames = g.SimilarGames?.Values?.Select(ToGameCardDTO).ToList(),
        StandaloneExpansions = g.StandaloneExpansions?.Values?.Select(ToGameCardDTO).ToList(),
        Remakes = g.Remakes?.Values?.Select(ToGameCardDTO).ToList(),
        Remasters = g.Remasters?.Values?.Select(ToGameCardDTO).ToList(),
        VersionParent = g.VersionParent?.Value is not null ? ToGameCardDTO(g.VersionParent.Value) : null
    };
}
