using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.Property(u => u.Id).ValueGeneratedOnAdd();

        entity.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(100);

        entity.Property(u => u.FamilyName)
            .IsRequired()
            .HasMaxLength(100);

        entity.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);

        entity.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);
            
        entity.Property(u => u.PendingEmail)
            .HasMaxLength(255);

        entity.Property(u => u.Theme)
            .HasConversion<string>()
            .HasMaxLength(10)
            .HasDefaultValue(UserTheme.Light);

        entity.Property(u => u.CreatedAt)
            .HasDefaultValueSql("NOW()");

        entity.Property(u => u.UpdatedAt)
            .HasDefaultValueSql("NOW()");

        entity.HasIndex(u => u.Email).IsUnique();
        entity.HasIndex(u => u.Username).IsUnique();

        entity.HasMany(u => u.Favorites)
            .WithMany(g => g.FavoritedByUsers)
            .UsingEntity(j => j.ToTable("favorite_games"));

        entity.HasMany(u => u.WishlistItems)
            .WithMany(g => g.WishlistedByUsers)
            .UsingEntity(j => j.ToTable("wishlist_games"));

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
            .WithOne(c => c.User)
            .HasForeignKey<LoginChallenge>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}