using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class WebsiteConfiguration : IEntityTypeConfiguration<Website>
{
    public void Configure(EntityTypeBuilder<Website> entity)
    {
        entity.Property(v => v.Url).HasMaxLength(500);

        entity.HasIndex(v => new { v.GameId, v.Type }).IsUnique();
        entity.HasIndex(v => v.Url).IsUnique();
    }
}