using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class GenreConfiguration : IEntityTypeConfiguration<Genre>
{
    public void Configure(EntityTypeBuilder<Genre> entity)
    {
        entity.Property(g => g.Id).ValueGeneratedOnAdd();
        entity.Property(g => g.ApiGenreId).IsRequired();
        entity.Property(g => g.Name).IsRequired().HasMaxLength(100);
        entity.Property(g => g.Slug).IsRequired().HasMaxLength(100);

        entity.HasIndex(g => g.Name);
        entity.HasIndex(g => g.ApiGenreId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();

        entity.HasMany(g => g.Games)
            .WithMany(g => g.Genres)
            .UsingEntity(j => j.ToTable("game_genres"));
    }
}