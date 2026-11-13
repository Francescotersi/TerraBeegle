using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> entity)
    {
        entity.Property(c => c.Id).ValueGeneratedOnAdd();
        entity.Property(c => c.ApiCompanyId).IsRequired();
        entity.Property(c => c.Name).IsRequired().HasMaxLength(255);
        entity.Property(c => c.Slug).IsRequired().HasMaxLength(255);

        entity.HasIndex(c => c.ApiCompanyId).IsUnique();
        entity.HasIndex(c => c.Slug).IsUnique();

        entity.HasMany(c => c.DevelopedGames)
            .WithMany(g => g.Developers)
            .UsingEntity(j => j.ToTable("game_developers"));

        entity.HasMany(c => c.PublishedGames)
            .WithMany(g => g.Publishers)
            .UsingEntity(j => j.ToTable("game_publishers"));
    }
}