using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> entity)
    {
        entity.Property(v => v.Id).ValueGeneratedOnAdd();
        entity.Property(v => v.ApiVideoId).IsRequired().HasMaxLength(500);
        entity.Property(v => v.Name).IsRequired().HasMaxLength(255);

        entity.HasIndex(v => v.ApiVideoId).IsUnique();
        entity.HasOne(v => v.Game)
            .WithMany(g => g.Videos)
            .HasForeignKey(v => v.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}