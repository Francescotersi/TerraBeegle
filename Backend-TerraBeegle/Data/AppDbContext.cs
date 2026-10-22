using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();

    public DbSet<Friendship> Friendships => Set<Friendship>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // USERS
        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Id).ValueGeneratedOnAdd();

            e.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.Property(u => u.FamilyName)
                .IsRequired()
                .HasMaxLength(100);

            e.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);

            e.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(u => u.Theme)
                .HasConversion<string>()
                .HasMaxLength(10)
                .HasDefaultValue(Theme.Light);

            e.Property(u => u.CreatedAt)
                .HasDefaultValueSql("NOW()");

            e.Property(u => u.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();

            e.HasMany(u => u.Favorites)
                .WithMany(g => g.FavoritedByUsers)
                .UsingEntity(j => j.ToTable("favorite_games"));

            e.HasMany(u => u.WishlistItems)
                .WithMany(g => g.WishlistedByUsers)
                .UsingEntity(j => j.ToTable("wishlist_games"));

            e.HasMany(u => u.Friendships)
                .WithOne(f => f.User)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FRIENDSHIPS
        modelBuilder.Entity<Friendship>(e =>
        {
            e.Property(f => f.Status).HasConversion<string>();
            e.ToTable(t => t.HasCheckConstraint("ck_friendships_not_self", "\"UserId\" <> \"FriendId\""));
            e.Property(f => f.CreatedAt).HasDefaultValueSql("NOW()");

            e.HasIndex(f => new { f.UserId, f.FriendId }).IsUnique();

            e.HasOne(f => f.User)
                .WithMany(u => u.Friendships)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(f => f.Friend)
                .WithMany(u => u.Friendships)
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict); // cascade towards users = conflict
        });

        // GAMES
        modelBuilder.Entity<Game>(e =>
        {
            e.Property(g => g.Id).ValueGeneratedOnAdd();

            e.Property(g => g.RawgGameId)
                .IsRequired();

            e.Property(g => g.Title)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Slug)
                .HasMaxLength(255);

            e.Property(g => g.Description)
                .HasColumnType("text");

            e.Property(g => g.CoverImageUrl)
                .HasMaxLength(500);

            e.Property(g => g.ReleaseDate)
                .HasColumnType("date");

            e.Property(g => g.Rating)
                .HasPrecision(4, 2);

            e.Property(g => g.Developer)
                .HasMaxLength(255);

            e.Property(g => g.Publisher)
                .HasMaxLength(255);

            e.Property(g => g.CreatedAt).HasDefaultValueSql("NOW()");
            e.Property(g => g.UpdatedAt).HasDefaultValueSql("NOW()");

            e.HasIndex(g => g.RawgGameId).IsUnique();
        });

        // GENRES
        modelBuilder.Entity<Genre>(e =>
        {
            e.Property(g => g.Id).ValueGeneratedOnAdd();

            e.Property(g => g.RawgGenreId)
                .IsRequired();

            e.Property(g => g.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(g => g.RawgGenreId).IsUnique();

            e.HasMany(g => g.Games)
                .WithMany(g => g.Genres)
                .UsingEntity(j => j.ToTable("game_genres"));
        });

        // PLATFORMS
        modelBuilder.Entity<Platform>(e =>
        {
            e.Property(p => p.Id).ValueGeneratedOnAdd();

            e.Property(p => p.RawgPlatformId)
                .IsRequired();

            e.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(p => p.RawgPlatformId).IsUnique();

            e.HasMany(p => p.Games)
                .WithMany(g => g.Platforms)
                .UsingEntity(j => j.ToTable("game_platforms"));
        });

        // PARENT PLATFORMS
        modelBuilder.Entity<ParentPlatform>(e =>
        {
            e.Property(pp => pp.Id).ValueGeneratedOnAdd();

            e.Property(pp => pp.RawgPlatformId)
                .IsRequired();

            e.Property(pp => pp.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(pp => pp.RawgPlatformId).IsUnique();

            e.HasMany(pp => pp.Platforms)
                .WithOne(p => p.ParentPlatform)
                .HasForeignKey(p => p.ParentPlatform)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
