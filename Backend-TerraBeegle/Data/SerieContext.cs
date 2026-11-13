using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class SerieConfiguration : IEntityTypeConfiguration<Serie>
{
    public void Configure(EntityTypeBuilder<Serie> entity)
    {
        entity.Property(s => s.Id).ValueGeneratedOnAdd();
        entity.Property(s => s.ApiSerieId).IsRequired();
        entity.Property(s => s.Name).IsRequired().HasMaxLength(255);
        entity.Property(s => s.Slug).IsRequired().HasMaxLength(255);

        entity.HasIndex(s => s.ApiSerieId).IsUnique();
        entity.HasIndex(s => s.Slug).IsUnique();

        entity.HasMany(s => s.Games)
            .WithMany(g => g.Series)
            .UsingEntity(j => j.ToTable("game_series"));
    }
}