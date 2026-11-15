using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class PegiDescriptionConfiguration : IEntityTypeConfiguration<PegiDescription>
{
    public void Configure(EntityTypeBuilder<PegiDescription> entity)
    {
        entity.Property(p => p.Description).HasMaxLength(16);
        entity.HasIndex(p => p.Description).IsUnique();
    }
}