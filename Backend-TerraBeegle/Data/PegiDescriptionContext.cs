using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class PegiDescriptionConfiguration : IEntityTypeConfiguration<PegiDescription>
{
    public void Configure(EntityTypeBuilder<PegiDescription> entity)
    {
        // IGDB descriptions are longer than 16 ("In-Game Purchases (Includes Random Items)"): saving GTA V gave 500
        entity.Property(p => p.Description).HasMaxLength(255);
        entity.HasIndex(p => p.Description).IsUnique();
    }
}