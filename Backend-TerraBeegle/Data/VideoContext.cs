using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> entity)
    {
        entity.Property(v => v.Name).HasMaxLength(255);

        entity.HasIndex(v => v.ApiVideoId).IsUnique();
    }
}