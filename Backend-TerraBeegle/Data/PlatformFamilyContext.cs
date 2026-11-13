using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class PlatformFamilyConfiguration : IEntityTypeConfiguration<PlatformFamily>
{
    public void Configure(EntityTypeBuilder<PlatformFamily> entity)
    {
        entity.Property(p => p.Id).ValueGeneratedOnAdd();
        entity.Property(p => p.ApiPlatformFamilyId)
            .HasConversion<int>()
            .IsRequired();

        entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
        entity.Property(p => p.Slug).IsRequired().HasMaxLength(100);

        entity.HasIndex(p => p.ApiPlatformFamilyId).IsUnique();
        entity.HasIndex(p => p.Slug).IsUnique();

        entity.HasMany(p => p.Platforms)
            .WithOne(p => p.PlatformFamily)
            .HasForeignKey(p => p.PlatformFamilyId)
            .HasPrincipalKey(pf => pf.ApiPlatformFamilyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}