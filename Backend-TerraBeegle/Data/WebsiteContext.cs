using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class WebsiteConfiguration : IEntityTypeConfiguration<Website>
{
    public void Configure(EntityTypeBuilder<Website> entity)
    {
        entity.Property(v => v.Url).HasMaxLength(500);

        // A link is unique per game, not in the whole table: different games share links (the studio's Twitter,
        // the franchise site...) and one game can have several links of the same type. The old unique indexes on
        // Url and on (GameId, Type) made saving those games fail with 500
        entity.HasIndex(v => new { v.GameId, v.Url }).IsUnique();
        entity.HasIndex(v => new { v.GameId, v.Type });
    }
}