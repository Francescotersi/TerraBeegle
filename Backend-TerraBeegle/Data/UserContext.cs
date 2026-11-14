using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.Property(u => u.Name).HasMaxLength(100);
        entity.Property(u => u.FamilyName).HasMaxLength(100);

        entity.Property(u => u.Email).HasMaxLength(255);
        entity.Property(u => u.Username).HasMaxLength(100);

        entity.Property(u => u.PasswordHash).HasMaxLength(255);
        entity.Property(u => u.PendingEmail).HasMaxLength(255);

        entity.Property(u => u.Theme).HasMaxLength(10);

        entity.HasIndex(u => u.Email).IsUnique();
        entity.HasIndex(u => u.Username).IsUnique();

        entity.HasMany(u => u.FriendRequestsAsUser1)
            .WithOne(f => f.User1)
            .HasForeignKey(f => f.User1Id)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(u => u.FriendRequestsAsUser2)
            .WithOne(f => f.User2)
            .HasForeignKey(f => f.User2Id)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(u => u.Reviews)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasOne(u => u.LoginChallenge)
            .WithOne(lc => lc.User)
            .HasForeignKey<LoginChallenge>(lc => lc.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}