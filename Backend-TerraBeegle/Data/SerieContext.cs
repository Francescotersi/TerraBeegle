using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class SerieConfiguration : IEntityTypeConfiguration<Serie>
{
    public void Configure(EntityTypeBuilder<Serie> entity)
    {
        entity.Property(s => s.Name).HasMaxLength(255);
        entity.Property(s => s.Slug).HasMaxLength(255);

        entity.HasIndex(s => s.ApiSerieId).IsUnique();
        entity.HasIndex(s => s.Slug).IsUnique();
    }
}