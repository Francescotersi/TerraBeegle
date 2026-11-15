using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class PerspectiveConfiguration : IEntityTypeConfiguration<Perspective>
{
    public void Configure(EntityTypeBuilder<Perspective> entity)
    {
        entity.Property(g => g.Name).HasMaxLength(100);
        entity.Property(g => g.Slug).HasMaxLength(100);

        entity.HasIndex(g => g.ApiPerspectiveId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();
    }
}