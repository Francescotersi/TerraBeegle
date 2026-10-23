using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<ParentPlatform> ParentPlatforms => Set<ParentPlatform>();

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

            e.HasMany(u => u.FriendRequestsAsUser1)
                .WithOne(f => f.User1)
                .HasForeignKey(f => f.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(u => u.FriendRequestsAsUser2)
                .WithOne(f => f.User2)
                .HasForeignKey(f => f.User2Id)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // FRIENDSHIPS
        modelBuilder.Entity<Friendship>(e =>
        {
            e.Property(f => f.Id).ValueGeneratedOnAdd();

            e.Property(f => f.Status)
                .HasConversion<string>();
            
            //e.ToTable(t => t.HasCheckConstraint("ck_friendships_not_self", "\"UserId\" <> \"FriendId\""));
            
            e.Property(f => f.CreatedAt)
                .HasDefaultValueSql("NOW()");

            e.HasIndex(f => new { f.User1Id, f.User2Id }).IsUnique();

            e.HasOne(f => f.User1)
                .WithMany(u => u.FriendRequestsAsUser1)
                .HasForeignKey(f => f.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.User2)
                .WithMany(u => u.FriendRequestsAsUser2)
                .HasForeignKey(f => f.User2Id)
                .OnDelete(DeleteBehavior.Restrict);
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
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Description)
                .IsRequired()
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

            e.HasMany(g => g.Genres)
                .WithMany(g => g.Games)
                .UsingEntity(j => j.ToTable("game_genres"));
            
            e.HasMany(g => g.Platforms)
                .WithMany(g => g.Games)
                .UsingEntity(j => j.ToTable("game_platforms"));
            
            e.HasMany(g => g.FavoritedByUsers)
                .WithMany(u => u.Favorites)
                .UsingEntity(j => j.ToTable("favorite_games"));
            
            e.HasMany(g => g.WishlistedByUsers)
                .WithMany(u => u.WishlistItems)
                .UsingEntity(j => j.ToTable("wishlist_games"));
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
                .HasForeignKey(p => p.ParentPlatformId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
