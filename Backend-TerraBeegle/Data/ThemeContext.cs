using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class ThemeConfiguration : IEntityTypeConfiguration<Theme>
{
    public void Configure(EntityTypeBuilder<Theme> entity)
    {
        entity.Property(t => t.Name).HasMaxLength(100);
        entity.Property(t => t.Slug).HasMaxLength(100);

        entity.HasIndex(t => t.ApiThemeId).IsUnique();
        entity.HasIndex(t => t.Slug).IsUnique();
    }
}