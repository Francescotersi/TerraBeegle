using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class PlatformConfiguration : IEntityTypeConfiguration<Platform>
{
    public void Configure(EntityTypeBuilder<Platform> entity)
    {
        entity.Property(p => p.Id).ValueGeneratedOnAdd();

        entity.Property(p => p.ApiPlatformId).IsRequired();
        entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
        entity.Property(p => p.Slug).IsRequired().HasMaxLength(100);

        entity.HasIndex(p => p.Name);
        entity.HasIndex(p => p.ApiPlatformId).IsUnique();
        entity.HasIndex(p => p.Slug).IsUnique();

        entity.Property(p => p.PlatformFamilyId)
            .HasConversion<int?>()
            .HasColumnName("PlatformFamily");

        entity.HasOne(p => p.PlatformFamily)
            .WithMany(f => f.Platforms)
            .HasForeignKey(p => p.PlatformFamilyId)
            .HasPrincipalKey(f => f.ApiPlatformFamilyId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasMany(p => p.Games)
            .WithMany(g => g.Platforms)
            .UsingEntity(j => j.ToTable("game_platforms"));
    }
}