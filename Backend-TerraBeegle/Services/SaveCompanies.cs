using Backend_TerraBeegle.Enums;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB.Models;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class SaveCompanies
{
    public static async Task<List<Models.Company>> SaveCompaniesList(AppDbContext db, IdentitiesOrValues<InvolvedCompany>? involvedCompanies, bool isDeveloper)
    {
        if (involvedCompanies?.Values is null)
            return [];

        var filtered = involvedCompanies.Values
            .Where(ic => ic.Company?.Value?.Id is not null && (isDeveloper ? ic.Developer == true : ic.Publisher == true))
            .Select(ic => ic.Company!.Value!)
            .DistinctBy(c => c.Id!.Value);

        List<Models.Company> companies = [];

        foreach (var comp in filtered)
        {
            var id = comp.Id!.Value;
            var existing = db.Companies.Local.FirstOrDefault(c => c.ApiCompanyId == id)
                ?? await db.Companies.FirstOrDefaultAsync(c => c.ApiCompanyId == id);

            if (existing is null)
            {
                existing = new Models.Company
                {
                    ApiCompanyId = id,
                    Name = comp.Name ?? string.Empty,
                    Slug = comp.Slug ?? string.Empty,
                    CompanyLogo = await SaveMedia.GetOrCreateImageAsync(db, comp.Logo?.Value?.ImageId, ImageType.Logo)
                };
                db.Companies.Add(existing);
            }

            companies.Add(existing);
        }

        return companies;
    }
}