using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;
using Mapster;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class DBToGameDTO
{
   
    private static List<ApiObjectDTO>? MapApiObjectList<T>(IEnumerable<T>? items) where T : class
    {
        if (items is null)
            return null;

        return [.. items.Select(apiObject => apiObject.Adapt<ApiObjectDTO>())];
    }

    private static List<PlatformDTO>? MapPlatformList(IEnumerable<Platform>? items)
    {
        if (items is null)
            return null;

        return [.. items.Select(p => new PlatformDTO
        {
            ApiPlatformId = p.Id,
            Name = p.Name,
            Slug = p.Slug,
            Abbreviation = p.Abbreviation,
            Logo = IGDBToGameDTO.ImageUrl(p.PlatformLogo?.ApiImageId, ImageSize.LogoMed),
            PlatformFamily = p.PlatformFamily is not null ? new PlatformFamilyDTO
            {
                ApiPlatformFamilyId = p.PlatformFamily.Id,
                Name = p.PlatformFamily.Name,
                Slug = p.PlatformFamily.Slug
            } : null
        })];
    }

    private static List<CompanyDTO>? MapCompanyList(IEnumerable<Company>? items)
    {
        if (items is null)
            return null;

        return [.. items.Select(ic => new CompanyDTO
        {
            ApiCompanyId = ic.ApiCompanyId,
            Name = ic.Name ?? null!,
            Slug = ic.Slug ?? null!,
            Logo = IGDBToGameDTO.ImageUrl(ic?.CompanyLogo?.ApiImageId, ImageSize.LogoMed)
        })];
    }

    private static List<string>? MapImageList(IEnumerable<Image>? images, ImageType type)
    {
        if (images is null)
            return null;

        return [.. images.Where(i => i.Type == type).Select(i => IGDBToGameDTO.ImageUrl(i.ApiImageId, ImageSize.HD720)).OfType<string>()];
    }

    public static GameCardDTO DBToGameCardDTO(Game g) => new ()
    {
        ApiGameId = g.ApiGameId,
        Name = g.Name,
        Slug = g.Slug,
        Cover = MapImageList(g.Images, ImageType.Cover)?.FirstOrDefault(),
        Rating = g.Rating,
        CriticRating = g.AggregatedRating,
        ReleaseDate = g.ReleaseDate,
        GameType = g.GameType,
        Genres = MapApiObjectList(g.Genres),
        Platforms = MapPlatformList(g.Platforms),
        Themes = MapApiObjectList(g.Themes),
        GameStatus = g.GameStatus,
    };

    public static GameCardDTO? DBToParentGameCardDTO(Game? g) => g is null ? null : DBToGameCardDTO(g);

    public static List<GameCardDTO>? DBToGameCardDTOList(IEnumerable<Game>? games) => games is null ? null : [.. games.Select(DBToGameCardDTO)];

    public static GameDetailsDTO DBToGameDetailsDTO(Game g) => new ()
    {
        ApiGameId = g.ApiGameId,
        Name = g.Name,
        PegiRating = g.PegiRating,
        PegiRatingDescription = g.PegiDescriptions?.Select(pd => pd.Description).ToList(),
        CriticRating = g.AggregatedRating,
        CriticRatingCount = g.AggregatedRatingCount,
        Artworks = MapImageList(g.Images, ImageType.Artwork),
        Cover = MapImageList(g.Images, ImageType.Cover)?.FirstOrDefault(),
        ReleaseDate = g.ReleaseDate,
        Franchises = MapApiObjectList(g.Franchises),
        GameModes = MapApiObjectList(g.GameModes),
        GameStatus = g.GameStatus,
        Genres = MapApiObjectList(g.Genres),
        Developers = MapCompanyList(g.Developers),
        Publishers = MapCompanyList(g.Publishers),
        Keywords = MapApiObjectList(g.Keywords),
        Platforms = MapPlatformList(g.Platforms),
        Perspectives = MapApiObjectList(g.Perspectives),
        Rating = g.Rating,
        RatingCount = g.RatingCount,
        ReleaseDates = g.ReleaseDates?.Select(rd => new ReleaseDateDTO
        {
            Date = rd.Date.Adapt<DateTime?>(),
            PlatformName = rd.Platform,
            Status = rd.Status
        }).ToList(),
        Screenshots = MapImageList(g.Images, ImageType.Screenshot),
        Slug = g.Slug,
        Summary = g.Summary,
        Storyline = g.Storyline,
        Themes = MapApiObjectList(g.Themes),
        Videos = g.Videos?.Select(v => new VideoDTO
        {
            Name = v.Name,
            VideoUrl = $"https://www.youtube.com/watch?v={v.ApiVideoId}"
        }).ToList(),
        OfficialWebsite = g.Websites?.FirstOrDefault(w => w.Type == 1)?.Url,
        Websites = g.Websites?.Where(w => w.Type != 1 && !w.IsStore).Select(w => new WebsiteDTO { Type = w.Type, Url = w.Url }).ToList(),
        Stores = g.Websites?.Where(w => w.IsStore).Select(w => new WebsiteDTO { Type = w.Type, Url = w.Url }).ToList(),
        LanguageSupports = g.LanguageSupports?.Select(ls => new LanguageSupportDTO
        {
            Language = ls.Language,
            LanguageSupportType = ls.Type.ToString()
        }).ToList(),
        Series = g.Series?.Select(s => new SerieDTO
        {
            ApiSerieId = s.Id,
            Name = s.Name,
            Slug = s.Slug,
            Games = DBToGameCardDTOList(s.Games) ?? [],
        }).ToList(),
        GameType = g.GameType,
        Bundles = DBToGameCardDTOList(g.Bundles),
        Dlcs = DBToGameCardDTOList(g.DLCs),
        ExpandedGames = DBToGameCardDTOList(g.ExpandedGames),
        Expansions = DBToGameCardDTOList(g.Expansions),
        Forks = DBToGameCardDTOList(g.Forks),
        ParentGame = DBToParentGameCardDTO(g.ParentGame),
        Ports = DBToGameCardDTOList(g.Ports),
        SimilarGames = DBToGameCardDTOList(g.SimilarGames),
        StandaloneExpansions = DBToGameCardDTOList(g.StandaloneExpansions),
        Remakes = DBToGameCardDTOList(g.Remakes),
        Remasters = DBToGameCardDTOList(g.Remasters),
        VersionParent = DBToParentGameCardDTO(g.VersionParent)
    };
}
