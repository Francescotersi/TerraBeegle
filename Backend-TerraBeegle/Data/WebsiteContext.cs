using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class WebsiteConfiguration : IEntityTypeConfiguration<Website>
{
    public void Configure(EntityTypeBuilder<Website> entity)
    {
        entity.Property(v => v.Id).ValueGeneratedOnAdd();
        entity.Property(v => v.Url).IsRequired().HasMaxLength(255);

        entity.HasIndex(v => v.Url).IsUnique();

        entity.HasOne(v => v.Game)
            .WithMany(g => g.Websites)
            .HasForeignKey(v => v.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}