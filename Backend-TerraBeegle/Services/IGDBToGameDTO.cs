using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Enums;
using Mapster;
using IGDB;
using IGDB.Models;

namespace Backend_TerraBeegle.Services;

public static class IGDBToGameDTO
{
    private static List<ApiObjectDTO>? MapApiObjectList<T>(IdentitiesOrValues<T>? items) where T : class
    {
        if (items?.Values is null)
            return null;

        return items.Values?.Select(apiObject => apiObject.Adapt<ApiObjectDTO>()).ToList();
    }

    private static List<PlatformDTO>? MapPlatformList(IdentitiesOrValues<Platform>? items)
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

    private static List<WebsiteDTO>? MapWebsiteList(IdentitiesOrValues<Website>? items, bool getStores)
    {
        if (items?.Values is null)
            return null;

        bool filter(int id) => getStores ? Enum.IsDefined((Storefront)id) : !Enum.IsDefined((Storefront)id) && id != 1;

        return items.Values?.Where(w => w.Url is not null && w.Type?.Id is {} id && filter((int)id)).Select(w => new WebsiteDTO
        {
            Type = w.Type.Id ?? 0,
            Url = w.Url
        }).ToList();
    }

    // The video for the card hover: the first one called "...trailer...", otherwise the first video
    public static string? PickTrailer(IEnumerable<(string Id, string Name)>? videos)
    {
        var list = videos?.Where(v => !string.IsNullOrWhiteSpace(v.Id)).ToList();
        if (list is not { Count: > 0 })
            return null;

        return (list.FirstOrDefault(v => v.Name?.Contains("trailer", StringComparison.OrdinalIgnoreCase) == true) is { Id: not null } trailer
            ? trailer : list[0]).Id ?? null;
    }

    // Full https URL of an IGDB image, or null when the game has no such image
    public static string? ImageUrl(string? imageId, ImageSize size) => string.IsNullOrWhiteSpace(imageId) ? null : "https:" + ImageHelper.GetImageUrl(imageId, size, false);

    public static GameCardDTO ToGameCardDTO (Game g) => new ()
    {
        ApiGameId = g.Id ?? 0,
        Name = g.Name,
        Slug = g.Slug,
        Cover = ImageUrl(g.Cover?.Value?.ImageId, ImageSize.CoverBig),
        Rating = (decimal?)g.Rating,
        CriticRating = g.AggregatedRating is not null ? (int)Math.Round(g.AggregatedRating.Value) : null,
        ReleaseDate = g.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(g.FirstReleaseDate.Value.UtcDateTime) : null,
        GameType = g.GameType?.Value?.Type,
        Genres = MapApiObjectList(g.Genres),
        Platforms = MapPlatformList(g.Platforms),
        Themes = MapApiObjectList(g.Themes),
        GameStatus = g.GameStatus?.Value?.Status,
        Trailer = PickTrailer(g.Videos?.Values?.Select(v => (v.VideoId, v.Name)))
    };

    private static GameCardDTO? ToParentGameCardDTO(IdentityOrValue<Game>? g) => g?.Value is null ? null : ToGameCardDTO(g.Value);

    public static List<GameCardDTO>? ToGameCardDTOList(IdentitiesOrValues<Game> games)
    {
        if (games?.Values is null)
            return null;

        return [.. games.Values.Select(ToGameCardDTO)];
    }

    public static GameDetailsDTO ToGameDetailsDTO (Game g) => new ()
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
        Rating = (decimal?)g.Rating,
        RatingCount = g.RatingCount,
        ReleaseDates = g.ReleaseDates?.Values?.Select(rd => new ReleaseDateDTO
        {
            Date = rd.Date?.UtcDateTime,
            PlatformName = rd.Platform?.Value?.Name,
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
            Games = ToGameCardDTOList(c.Games) ?? [],
        }).ToList(),
        GameType = g.GameType?.Value?.Type,
        Bundles = ToGameCardDTOList(g.Bundles),
        Dlcs = ToGameCardDTOList(g.Dlcs),
        ExpandedGames = ToGameCardDTOList(g.ExpandedGames),
        Expansions = ToGameCardDTOList(g.Expansions),
        Forks = ToGameCardDTOList(g.Forks),
        ParentGame = ToParentGameCardDTO(g.ParentGame),
        Ports = ToGameCardDTOList(g.Ports),
        SimilarGames = ToGameCardDTOList(g.SimilarGames),
        StandaloneExpansions = ToGameCardDTOList(g.StandaloneExpansions),
        Remakes = ToGameCardDTOList(g.Remakes),
        Remasters = ToGameCardDTOList(g.Remasters),
        VersionParent = ToParentGameCardDTO(g.VersionParent)
    };
}