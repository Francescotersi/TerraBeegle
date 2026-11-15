using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class PlatformFamilyConfiguration : IEntityTypeConfiguration<PlatformFamily>
{
    public void Configure(EntityTypeBuilder<PlatformFamily> entity)
    {
        entity.Property(p => p.Name).HasMaxLength(100);
        entity.Property(p => p.Slug).HasMaxLength(100);

        entity.HasIndex(p => p.ApiPlatformFamilyId).IsUnique();
        entity.HasIndex(p => p.Slug).IsUnique();

        entity.HasMany(p => p.Platforms)
            .WithOne(pf => pf.PlatformFamily)
            .HasForeignKey(p => p.PlatformFamilyId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}