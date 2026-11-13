using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> entity)
    {
        entity.Property(r => r.Id).ValueGeneratedOnAdd();
        entity.Property(r => r.Rating).IsRequired();

        entity.Property(r => r.Content).HasColumnType("text");

        entity.Property(r => r.UserId).IsRequired();
        entity.Property(r => r.GameId).IsRequired();

        entity.Property(r => r.CreatedAt).HasDefaultValueSql("NOW()");

        entity.HasIndex(r => new { r.GameId, r.UserId }).IsUnique();
        entity.HasIndex(r => r.UserId);

        entity.HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(r => r.Game)
            .WithMany(g => g.Reviews)
            .HasForeignKey(r => r.GameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}