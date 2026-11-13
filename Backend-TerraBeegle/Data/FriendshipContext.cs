using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class FriendshipConfiguration : IEntityTypeConfiguration<Friendship>
{
    public void Configure(EntityTypeBuilder<Friendship> entity)
    {
        entity.Property(f => f.Id).ValueGeneratedOnAdd();

        entity.Property(f => f.Status)
            .HasConversion<string>();
            
        entity.Property(f => f.ReceiverId)
            .IsRequired();

        entity.Property(f => f.CreatedAt)
            .HasDefaultValueSql("NOW()");

        entity.Property(f => f.UpdatedAt)
            .HasDefaultValueSql("NOW()");

        entity.HasIndex(f => new { f.User1Id, f.User2Id }).IsUnique();
        entity.HasIndex(f => f.User2Id);

        entity.HasOne(f => f.User1)
            .WithMany(u => u.FriendRequestsAsUser1)
            .HasForeignKey(f => f.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(f => f.User2)
            .WithMany(u => u.FriendRequestsAsUser2)
            .HasForeignKey(f => f.User2Id)
            .OnDelete(DeleteBehavior.Restrict);
    }
}