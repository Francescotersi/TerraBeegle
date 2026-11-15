using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Enums;
using Backend_TerraBeegle.Models;
using Mapster;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class DBToGameDTO
{
   
    // Adapt<ApiObjectDTO>() copied our DB Id into ApiObjectDTO.Id; the frontend needs the IGDB id (same as the IGDB path),
    // so every type says which property holds its IGDB id
    private static List<ApiObjectDTO>? MapApiObjectList<T>(IEnumerable<T>? items, Func<T, long> apiId, Func<T, string> name, Func<T, string> slug)
    {
        if (items is null)
            return null;

        return [.. items.Select(item => new ApiObjectDTO { Id = apiId(item), Name = name(item), Slug = slug(item) })];
    }

    private static List<ApiObjectDTO>? MapGenres(IEnumerable<Genre>? items) => MapApiObjectList(items, x => x.ApiGenreId, x => x.Name, x => x.Slug);
    private static List<ApiObjectDTO>? MapThemes(IEnumerable<Theme>? items) => MapApiObjectList(items, x => x.ApiThemeId, x => x.Name, x => x.Slug);
    private static List<ApiObjectDTO>? MapKeywords(IEnumerable<Keyword>? items) => MapApiObjectList(items, x => x.ApiKeywordId, x => x.Name, x => x.Slug);
    private static List<ApiObjectDTO>? MapGameModes(IEnumerable<GameMode>? items) => MapApiObjectList(items, x => x.ApiGameModeId, x => x.Name, x => x.Slug);
    private static List<ApiObjectDTO>? MapPerspectives(IEnumerable<Perspective>? items) => MapApiObjectList(items, x => x.ApiPerspectiveId, x => x.Name, x => x.Slug);
    private static List<ApiObjectDTO>? MapFranchises(IEnumerable<Franchise>? items) => MapApiObjectList(items, x => x.ApiFranchiseId, x => x.Name, x => x.Slug);

    // The DB stores the user rating out of 10 (so user reviews 1-10 can be averaged in); the API answers out of 100 like IGDB
    private static decimal? RatingOutOf100(decimal? rating) => rating * 10;

    private static List<PlatformDTO>? MapPlatformList(IEnumerable<Platform>? items)
    {
        if (items is null)
            return null;

        return [.. items.Select(p => new PlatformDTO
        {
            ApiPlatformId = p.ApiPlatformId,
            Name = p.Name,
            Slug = p.Slug,
            Abbreviation = p.Abbreviation,
            Logo = IGDBToGameDTO.ImageUrl(p.PlatformLogo?.ApiImageId, ImageSize.LogoMed),
            PlatformFamily = p.PlatformFamily is not null ? new PlatformFamilyDTO
            {
                ApiPlatformFamilyId = p.PlatformFamily.ApiPlatformFamilyId,
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
            Name = ic.Name,
            Slug = ic.Slug,
            Logo = IGDBToGameDTO.ImageUrl(ic?.CompanyLogo?.ApiImageId, ImageSize.LogoMed)
        })];
    }

    private static List<string>? MapImageList(IEnumerable<Image>? images, ImageType type, ImageSize? size = null)
    {
        if (images is null)
            return null;

        return [.. images.Where(i => i.Type == type).Select(i => IGDBToGameDTO.ImageUrl(i.ApiImageId, size ?? ImageSize.HD720)).OfType<string>()];
    }

    public static GameCardDTO DBToGameCardDTO(Game g) => new ()
    {
        ApiGameId = g.ApiGameId,
        Name = g.Name,
        Slug = g.Slug,
        Cover = MapImageList(g.Images, ImageType.Cover, ImageSize.CoverBig)?.FirstOrDefault(),
        Rating = RatingOutOf100(g.Rating),
        CriticRating = g.AggregatedRating,
        ReleaseDate = g.ReleaseDate,
        GameType = g.GameType,
        Genres = MapGenres(g.Genres),
        Platforms = MapPlatformList(g.Platforms),
        Themes = MapThemes(g.Themes),
        GameStatus = g.GameStatus,
        Trailer = IGDBToGameDTO.PickTrailer(g.Videos?.Select(v => (v.ApiVideoId, v.Name))),
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
        Franchises = MapFranchises(g.Franchises),
        GameModes = MapGameModes(g.GameModes),
        GameStatus = g.GameStatus,
        Genres = MapGenres(g.Genres),
        Developers = MapCompanyList(g.Developers),
        Publishers = MapCompanyList(g.Publishers),
        Keywords = MapKeywords(g.Keywords),
        Platforms = MapPlatformList(g.Platforms),
        Perspectives = MapPerspectives(g.Perspectives),
        Rating = RatingOutOf100(g.Rating),
        RatingCount = g.RatingCount,
        ReleaseDates = g.ReleaseDates?.Select(rd => new ReleaseDateDTO
        {
            Date = rd.Date?.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc),
            PlatformName = rd.Platform,
            Status = rd.Status
        }).ToList(),
        Screenshots = MapImageList(g.Images, ImageType.Screenshot),
        Slug = g.Slug,
        Summary = g.Summary,
        Storyline = g.Storyline,
        Themes = MapThemes(g.Themes),
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
            ApiSerieId = s.ApiSerieId,
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
