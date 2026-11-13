using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class PegiDescriptionConfiguration : IEntityTypeConfiguration<PegiDescription>
{
    public void Configure(EntityTypeBuilder<PegiDescription> entity)
    {
        entity.Property(p => p.Id).ValueGeneratedOnAdd();
        entity.Property(p => p.Name).IsRequired();

        entity.HasIndex(p => p.Name).IsUnique();

        entity.HasMany(p => p.Games)
            .WithMany(g => g.PegiDescriptions)
            .UsingEntity(j => j.ToTable("game_pegi_descriptions"));
    }
}