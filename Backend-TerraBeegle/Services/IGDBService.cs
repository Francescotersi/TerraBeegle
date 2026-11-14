using Backend_TerraBeegle.DTOS;
using System.Globalization;
using System.Linq.Expressions;
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
        "platforms.name",
        "platforms.slug",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "themes.name",
        "themes.slug",
        "game_type.type",
        "game_status.status"
    ]) + ";";

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query, string pagination)
    {
        IGDB.Models.Game[]? response;
        CountResponse totalCount;

        try
        {
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{GameCardFields}{(query.Length > 0 ? $"where {query};" : "")}{pagination}");
            totalCount = await igdb.CountAsync(IGDBClient.Endpoints.Games, query: query.Length > 0 ? $"where {query};" : "");
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
        "game_status.status",
        "involved_companies.developer",
        "involved_companies.publisher",
        "involved_companies.company.logo.image_id",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "rating",
        "rating_count",
        "release_dates.date",
        "release_dates.platform.abbreviation",
        "release_dates.status.name",
        "screenshots.image_id",
        "slug",
        "storyline",
        "summary",
        "videos.name",
        "videos.video_id",
        "websites.url",
        "websites.type",
        "language_supports.language.name",
        "language_supports.language_support_type.name",
        "game_type.type",
    ]) + "," + string.Join(",", new [] {
        "franchises",
        "game_modes",
        "genres",
        "involved_companies.company",
        "keywords",
        "platforms",
        "platforms.platform_family",
        "player_perspectives",
        "themes",
        "collections"
    }.Select(str => $"{str}.name,{str}.slug")) + "," + string.Join(",", new [] {
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
    }.Select(str => $"{str}.name,{str}.slug,{str}.aggregated_rating,{str}.rating,{str}.cover.image_id,{str}.first_release_date,{str}.game_type.type")) + ";";

    private async Task<IGDB.Models.Game?> FetchGameAsync(string GameField, string field)
    {
        IGDB.Models.Game[]? response;
        try
        {
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games, query: $"{GameDetailsFields} w {field} = {GameField}; limit 1;");
        }
        catch (RestEase.ApiException ex)
        {
            Console.WriteLine($"IGDB API error: {ex.StatusCode} - {ex.Content}");
            return null;
        }
        
        return response is { Length: 1 } ? response[0] : null;
    }

    // The only place where a game is looked up for GET /api/games/{id}
    public async Task<GameDetailsDTO?> GetGameAsync(string GameField, string field)
    {
        Expression<Func<Models.Game, bool>>? filter = field switch
        {
            "id" => g => g.ApiGameId == long.Parse(GameField, CultureInfo.InvariantCulture) && !g.IsPlaceholder,
            "slug" => g => g.Slug == GameField && !g.IsPlaceholder,
            _ => null
        };

        if (filter is null)
            return null;

        var existing = await db.Games.FirstOrDefaultAsync(filter);
        // if (existing is not null)
        //     return convertToGameDetailsDTO(existing);

        var response = await FetchGameAsync(GameField, field);
        if (response is null)
            return null;

        return ToGameDetailsDTO(response);
    }

    // Import only the fields needed by saved collections. Shared taxonomy rows are reused.
    public async Task<Models.Game?> GetOrCreateGameAsync(long igdbGameId)
    {
        var existing = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == igdbGameId && !g.IsPlaceholder);
        if (existing is not null)
            return existing;

        IGDB.Models.Game[] response;
        try
        {
            response = await igdb.QueryAsync<IGDB.Models.Game>(IGDBClient.Endpoints.Games,
                query: $"{GameCardFields.TrimEnd(';')},summary; where id = {igdbGameId}; limit 1;");
        }
        catch (RestEase.ApiException ex)
        {
            throw new HttpRequestException("IGDB is unavailable.", ex);
        }

        if (response.Length == 0)
            return null;

        // Serialize imports so concurrent saves can reuse games, genres, platforms and images safely.
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74219031)");
        var game = await db.Games.Include(g => g.Genres).Include(g => g.Platforms)
            .Include(g => g.Themes).Include(g => g.Cover)
            .FirstOrDefaultAsync(g => g.ApiGameId == igdbGameId);
        if (game is { IsPlaceholder: false })
        {
            await transaction.CommitAsync();
            return game;
        }

        var source = response[0];
        game ??= new Models.Game { ApiGameId = igdbGameId };
        game.Name = source.Name;
        game.Slug = source.Slug;
        game.Summary = source.Summary ?? "";
        game.ReleaseDate = source.FirstReleaseDate.HasValue
            ? DateOnly.FromDateTime(source.FirstReleaseDate.Value.UtcDateTime) : null;
        game.Rating = source.Rating.HasValue ? (decimal)source.Rating.Value : null;
        game.AggregatedRating = source.AggregatedRating.HasValue ? (int)Math.Round(source.AggregatedRating.Value) : null;
        game.GameType = source.GameType?.Id is {} type ? (Enums.GameType)type : null;
        game.GameStatus = source.GameStatus?.Id is {} status ? (int)status : null;
        game.IsPlaceholder = false;
        game.UpdatedAt = DateTime.UtcNow;
        game.Genres ??= [];
        game.Platforms ??= [];
        game.Themes ??= [];
        game.Genres.Clear();
        game.Platforms.Clear();
        game.Themes.Clear();

        foreach (var genre in source.Genres?.Values ?? [])
        {
            var id = genre.Id!.Value;
            game.Genres.Add(await db.Genres.FirstOrDefaultAsync(g => g.ApiGenreId == id)
                ?? new Models.Genre { ApiGenreId = id, Name = genre.Name, Slug = genre.Slug });
        }
        foreach (var platform in source.Platforms?.Values ?? [])
        {
            var id = platform.Id!.Value;
            game.Platforms.Add(await db.Platforms.FirstOrDefaultAsync(p => p.ApiPlatformId == id)
                ?? new Models.Platform { ApiPlatformId = id, Name = platform.Name,
                    Slug = platform.Slug, Abbreviation = platform.Abbreviation ?? "" });
        }
        foreach (var theme in source.Themes?.Values ?? [])
        {
            var id = theme.Id!.Value;
            game.Themes.Add(await db.Themes.FirstOrDefaultAsync(t => t.ApiThemeId == id)
                ?? new Models.Theme { ApiThemeId = id, Name = theme.Name, Slug = theme.Slug });
        }
        if (source.Cover?.Value?.ImageId is {} imageId)
            game.Cover = await db.Images.FirstOrDefaultAsync(i => i.ApiImageId == imageId)
                ?? new Image { ApiImageId = imageId };

        if (game.Id == 0)
            db.Games.Add(game);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return game;
    }

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
            Logo = ImageUrl(platform.PlatformLogo?.Value?.ImageId, ImageSize.LogoMed),
            PlatformFamily = platform.PlatformFamily?.Value is { } pf ? new PlatformFamilyDTO
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

        return items.Values?.Where(ic => ic.Company?.Value is not null && filter(ic)).Select(ic => new CompanyDTO
        {
            ApiCompanyId = ic.Company.Value.Id ?? 0,
            Name = ic.Company.Value.Name ?? null!,
            Slug = ic.Company.Value.Slug ?? null!,
            Logo = ImageUrl(ic.Company.Value?.Logo?.Value?.ImageId, ImageSize.LogoMed)
        }).ToList();
    }

    private static List<string>? MapImageList<T>(IdentitiesOrValues<T>? items, ImageSize size) where T : class
    {
        if (items?.Values is null)
            return null;

       return [.. items.Values
            .Select((dynamic img) => ImageUrl((string?)img.ImageId, size))
            .OfType<string>()];
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

    // Full https URL of an IGDB image, or null when the game has no such image
    private static string? ImageUrl(string? imageId, ImageSize size) => string.IsNullOrWhiteSpace(imageId) ? null : "https:" + ImageHelper.GetImageUrl(imageId, size, false);

    private static GameCardDTO ToGameCardDTO (IGDB.Models.Game g) => new ()
    {
        ApiGameId = g.Id ?? 0,
        Name = g.Name,
        Slug = g.Slug,
        Cover = ImageUrl(g.Cover?.Value?.ImageId, ImageSize.CoverBig),
        Rating = g.Rating,
        CriticRating = g.AggregatedRating is not null ? (int)Math.Round(g.AggregatedRating.Value) : null,
        ReleaseDate = g.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(g.FirstReleaseDate.Value.UtcDateTime) : null,
        GameType = g.GameType?.Value?.Type,
        Genres = MapApiObjectList(g.Genres),
        Platforms = MapPlatformList(g.Platforms),
        Themes = MapApiObjectList(g.Themes),
        GameStatus = g.GameStatus?.Value?.Status
    };

    private static GameDetailsDTO ToGameDetailsDTO (IGDB.Models.Game g) => new ()
    {
        ApiGameId = g.Id ?? 0,
        Name = g.Name,
        PegiRating = g.AgeRatings?.Values?.FirstOrDefault(ar => ar.Organization?.Id == 2)?.RatingCategory?.Value?.Rating,
        PegiRatingDescription = g.AgeRatings?.Values?.FirstOrDefault(ar => ar.Organization?.Id == 2)?.RatingContentDescriptions?.Values?.Select(desc => desc.Description).ToList(),
        CriticRating = g.AggregatedRating is not null ? (int)Math.Round(g.AggregatedRating.Value) : null,
        CriticRatingCount = g.AggregatedRatingCount,
        Artworks = MapImageList(g.Artworks, ImageSize.HD720),
        Cover = ImageUrl(g.Cover?.Value?.ImageId, ImageSize.HD720),
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
            Date = rd.Date?.UtcDateTime,
            PlatformAbbreviation = rd.Platform?.Value?.Abbreviation,
            Status = rd.Status?.Value?.Name
        }).ToList(),
        Screenshots = MapImageList(g.Screenshots, ImageSize.HD720),
        Slug = g.Slug,
        Summary = g.Summary,
        Storyline = g.Storyline,
        Themes = MapApiObjectList(g.Themes),
        Videos = g.Videos?.Values?.Select(v => new VideoDTO
        {
            Name = v.Name,
            VideoUrl = $"https://www.youtube.com/watch?v={v.VideoId}"
        }).ToList(),
        OfficialWebsite = g.Websites?.Values?.FirstOrDefault(w => w.Type?.Id == 1)?.Url,
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
