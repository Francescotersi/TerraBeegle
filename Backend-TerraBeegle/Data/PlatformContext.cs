using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class PlatformConfiguration : IEntityTypeConfiguration<Platform>
{
    public void Configure(EntityTypeBuilder<Platform> entity)
    {
        entity.Property(p => p.Name).HasMaxLength(100);
        entity.Property(p => p.Slug).HasMaxLength(100);
        entity.Property(p => p.Abbreviation).HasMaxLength(50);

        entity.HasIndex(p => p.ApiPlatformId).IsUnique();
        entity.HasIndex(p => p.Slug).IsUnique();

        entity.HasOne(p => p.PlatformFamily)
            .WithMany()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Restrict);
        
        entity.HasOne(p => p.PlatformLogo)
            .WithOne()
            .HasForeignKey<Platform>("PlatformLogoId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}