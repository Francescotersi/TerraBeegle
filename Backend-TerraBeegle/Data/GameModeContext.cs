using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class GameModeConfiguration : IEntityTypeConfiguration<GameMode>
{
    public void Configure(EntityTypeBuilder<GameMode> entity)
    {
        entity.Property(g => g.Name).HasMaxLength(100);
        entity.Property(g => g.Slug).HasMaxLength(100);

        entity.HasIndex(g => g.ApiGameModeId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();
        entity.HasIndex(g => g.Name);
    }
}