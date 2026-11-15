using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB.Models;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class SaveGameContents
{
    public static async Task<List<PegiDescription>> SavePegiDescriptions(AppDbContext db, IEnumerable<AgeRatingContentDescriptionV2>? descriptions)
    {
        if (descriptions is null)
            return [];

        List<PegiDescription> result = [];

        foreach (var desc in descriptions.Where(d => !string.IsNullOrWhiteSpace(d.Description)).DistinctBy(d => d.Description))
        {
            var existing = db.PegiDescriptions.Local.FirstOrDefault(d => d.Description == desc.Description)
                ?? await db.PegiDescriptions.FirstOrDefaultAsync(d => d.Description == desc.Description);

            if (existing is null)
            {
                existing = new PegiDescription
                {
                    Description = desc.Description,
                };
                db.PegiDescriptions.Add(existing);
            }
            result.Add(existing);
        }

        return result;
    }

    public static async Task<List<Models.Genre>> SaveGenres(AppDbContext db, IdentitiesOrValues<IGDB.Models.Genre>? items)
    {
        if (items?.Values is null) 
            return [];

        List<Models.Genre> list = [];
        foreach (var item in items.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = item.Id!.Value;
            var entity = db.Genres.Local.FirstOrDefault(x => x.ApiGenreId == id)
                ?? await db.Genres.FirstOrDefaultAsync(x => x.ApiGenreId == id);
            if (entity is null)
            {
                entity = new Models.Genre { 
                    ApiGenreId = id,
                    Name = item.Name ?? "", 
                    Slug = item.Slug ?? "" 
                };
                db.Genres.Add(entity);
            }
            list.Add(entity);
        }
        return list;
    }

    public static async Task<List<Models.Theme>> SaveThemes(AppDbContext db, IdentitiesOrValues<IGDB.Models.Theme>? items)
    {
        if (items?.Values is null) 
            return [];

        List<Models.Theme> list = [];
        foreach (var item in items.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = item.Id!.Value;
            var entity = db.Themes.Local.FirstOrDefault(x => x.ApiThemeId == id)
                ?? await db.Themes.FirstOrDefaultAsync(x => x.ApiThemeId == id);
            if (entity is null)
            {
                entity = new Models.Theme { 
                    ApiThemeId = id,
                    Name = item.Name ?? "",
                    Slug = item.Slug ?? "" 
                };
                db.Themes.Add(entity);
            }
            list.Add(entity);
        }
        return list;
    }

    public static async Task<List<Models.Keyword>> SaveKeywords(AppDbContext db, IdentitiesOrValues<IGDB.Models.Keyword>? items)
    {
        if (items?.Values is null) 
            return [];

        List<Models.Keyword> list = [];
        foreach (var item in items.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = item.Id!.Value;
            var entity = db.Keywords.Local.FirstOrDefault(x => x.ApiKeywordId == id)
                ?? await db.Keywords.FirstOrDefaultAsync(x => x.ApiKeywordId == id);
            if (entity is null)
            {
                entity = new Models.Keyword { 
                    ApiKeywordId = id,
                    Name = item.Name ?? "",
                    Slug = item.Slug ?? "" 
                };
                db.Keywords.Add(entity);
            }
            list.Add(entity);
        }
        return list;
    }

    public static async Task<List<Models.GameMode>> SaveGameModes(AppDbContext db, IdentitiesOrValues<IGDB.Models.GameMode>? items)
    {
        if (items?.Values is null) 
            return [];

        List<Models.GameMode> list = [];
        foreach (var item in items.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = item.Id!.Value;
            var entity = db.GameModes.Local.FirstOrDefault(x => x.ApiGameModeId == id)
                ?? await db.GameModes.FirstOrDefaultAsync(x => x.ApiGameModeId == id);
            if (entity is null)
            {
                entity = new Models.GameMode { 
                    ApiGameModeId = id,
                    Name = item.Name ?? "",
                    Slug = item.Slug ?? "" 
                };
                db.GameModes.Add(entity);
            }
            list.Add(entity);
        }
        return list;
    }

    public static async Task<List<Perspective>> SavePerspectives(AppDbContext db, IdentitiesOrValues<PlayerPerspective>? items)
    {
        if (items?.Values is null) 
            return [];

        List<Perspective> list = [];
        foreach (var item in items.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = item.Id!.Value;
            var entity = db.Perspectives.Local.FirstOrDefault(x => x.ApiPerspectiveId == id)
                ?? await db.Perspectives.FirstOrDefaultAsync(x => x.ApiPerspectiveId == id);
            if (entity is null)
            {
                entity = new Perspective { 
                    ApiPerspectiveId = id,
                    Name = item.Name ?? "",
                    Slug = item.Slug ?? "" 
                };
                db.Perspectives.Add(entity);
            }
            list.Add(entity);
        }
        return list;
    }

    public static List<Models.ReleaseDate> SaveReleaseDates(IdentitiesOrValues<IGDB.Models.ReleaseDate>? releaseDates)
    {
        if (releaseDates?.Values is null)
            return [];

        // IGDB has one release date per REGION (EU, NA, JP...) for the same platform and status, but the table allows
        // one row per (game, platform, status): keep the first release, otherwise saving the game failed with 500
        return [.. releaseDates.Values
            .Where(rd => rd.Platform?.Value?.Name is not null)
            .Select(rd => new Models.ReleaseDate
            {
                Date = rd.Date.HasValue ? DateOnly.FromDateTime(rd.Date.Value.UtcDateTime) : null,
                Platform = rd.Platform.Value.Name,
                Status = rd.Status?.Value?.Name ?? "Unknown"
            })
            .GroupBy(rd => (rd.Platform, rd.Status))
            .Select(group => group.OrderBy(rd => rd.Date ?? DateOnly.MaxValue).First())];
    }

    public static List<Models.LanguageSupport> SaveLanguageSupports(IdentitiesOrValues<IGDB.Models.LanguageSupport>? supports)
    {
        if (supports?.Values is null)
            return [];

        return [.. supports.Values
            .Where(ls => !string.IsNullOrWhiteSpace(ls.Language?.Value?.Name) && !string.IsNullOrWhiteSpace(ls.LanguageSupportType?.Value?.Name))
            .DistinctBy(ls => (ls.Language!.Value.Name, ls.LanguageSupportType!.Value.Name))
            .Select(ls => new Models.LanguageSupport
            {
                Language = ls.Language!.Value.Name!,
                Type = (Enums.LanguageSupportType)ls.LanguageSupportType!.Value.Id!
            })];
    }

    public static List<Models.Website> SaveWebsites(IdentitiesOrValues<IGDB.Models.Website>? websites)
    {
        if (websites?.Values is null)
            return [];

        return [.. websites.Values
            .Where(w => !string.IsNullOrWhiteSpace(w.Url) && w.Type?.Id is not null)
            .DistinctBy(w => w.Url)
            .Select(w => new Models.Website
            {
                Url = w.Url!,
                Type = w.Type!.Id!.Value,
                IsStore = Enum.IsDefined((Storefront)w.Type!.Id!.Value)
            })];
    }
}