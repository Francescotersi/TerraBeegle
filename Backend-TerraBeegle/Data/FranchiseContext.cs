using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class FranchiseConfiguration : IEntityTypeConfiguration<Franchise>
{
    public void Configure(EntityTypeBuilder<Franchise> entity)
    {
        entity.Property(f => f.Name).HasMaxLength(255);
        entity.Property(f => f.Slug).HasMaxLength(255);

        entity.HasIndex(f => f.ApiFranchiseId).IsUnique();
        entity.HasIndex(f => f.Slug).IsUnique();
    }
}