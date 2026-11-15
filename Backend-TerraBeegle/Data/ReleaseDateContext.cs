using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class ReleaseDateConfiguration : IEntityTypeConfiguration<ReleaseDate>
{
    public void Configure(EntityTypeBuilder<ReleaseDate> entity)
    {
        entity.HasIndex(p => new { p.GameId, p.Platform, p.Status }).IsUnique();
    }
}