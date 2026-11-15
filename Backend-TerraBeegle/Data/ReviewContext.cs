using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> entity)
    {
        entity.Property(r => r.Content).HasColumnType("text");

        entity.HasIndex(r => new { r.ApiGameId, r.UserId }).IsUnique();
        entity.HasIndex(r => r.UserId);
    }
}