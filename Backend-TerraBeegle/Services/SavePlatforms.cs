using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB.Models;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class SavePlatforms
{
    public static async Task<List<Models.Platform>> SavePlatformsList(AppDbContext db, IdentitiesOrValues<IGDB.Models.Platform>? platforms)
    {
        if (platforms?.Values is null)
            return [];

        List<Models.Platform> result = [];

        foreach (var p in platforms.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = p.Id!.Value;
            var existing = db.Platforms.Local.FirstOrDefault(x => x.ApiPlatformId == id)
                ?? await db.Platforms.FirstOrDefaultAsync(x => x.ApiPlatformId == id);

            if (existing is null)
            {
                Models.PlatformFamily? family = null;
                if (p.PlatformFamily?.Value is {} pf)
                {
                    var pfId = pf.Id!.Value;
                    family = db.PlatformFamilies.Local.FirstOrDefault(x => x.ApiPlatformFamilyId == pfId)
                        ?? await db.PlatformFamilies.FirstOrDefaultAsync(x => x.ApiPlatformFamilyId == pfId);

                    if (family is null)
                    {
                        family = new Models.PlatformFamily
                        {
                            ApiPlatformFamilyId = pfId,
                            Name = pf.Name,
                            Slug = pf.Slug
                        };
                        db.PlatformFamilies.Add(family);
                    }
                }

                existing = new Models.Platform
                {
                    ApiPlatformId = id,
                    Name = p.Name ?? string.Empty,
                    Slug = p.Slug ?? string.Empty,
                    Abbreviation = p.Abbreviation ?? string.Empty,
                    PlatformFamily = family,
                    PlatformLogo = await SaveMedia.GetOrCreateImageAsync(db, p.PlatformLogo?.Value?.ImageId, ImageType.Logo)
                };
                db.Platforms.Add(existing);
            }

            result.Add(existing);
        }

        return result;
    }
}