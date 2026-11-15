using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class GenreConfiguration : IEntityTypeConfiguration<Genre>
{
    public void Configure(EntityTypeBuilder<Genre> entity)
    {
        entity.Property(g => g.Name).HasMaxLength(100);
        entity.Property(g => g.Slug).HasMaxLength(100);

        entity.HasIndex(g => g.ApiGenreId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();
        entity.HasIndex(g => g.Name);
    }
}