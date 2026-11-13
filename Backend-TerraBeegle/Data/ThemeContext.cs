using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class ThemeConfiguration : IEntityTypeConfiguration<Theme>
{
    public void Configure(EntityTypeBuilder<Theme> entity)
    {
        entity.Property(t => t.Id).ValueGeneratedOnAdd();
        entity.Property(t => t.ApiThemeId).IsRequired();
        entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
        entity.Property(t => t.Slug).IsRequired().HasMaxLength(100);

        entity.HasIndex(t => t.Name);

        entity.HasIndex(t => t.ApiThemeId).IsUnique();
        entity.HasIndex(t => t.Slug).IsUnique();

        entity.HasMany(t => t.Games)
            .WithMany(g => g.Themes)
            .UsingEntity(j => j.ToTable("game_themes"));
    }
}