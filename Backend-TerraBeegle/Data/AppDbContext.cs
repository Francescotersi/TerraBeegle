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
    public DbSet<Review> Reviews => Set<Review>();

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
            
            e.Property(u => u.PendingEmail)
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
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(u => u.FriendRequestsAsUser2)
                .WithOne(f => f.User2)
                .HasForeignKey(f => f.User2Id)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(u => u.Reviews)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FRIENDSHIPS
        modelBuilder.Entity<Friendship>(e =>
        {
            e.Property(f => f.Id).ValueGeneratedOnAdd();

            e.Property(f => f.Status)
                .HasConversion<string>();
            
            e.Property(f => f.ReceiverId)
                .IsRequired();

            e.Property(f => f.CreatedAt)
                .HasDefaultValueSql("NOW()");

            e.Property(f => f.UpdatedAt)
                .HasDefaultValueSql("NOW()");

            e.HasIndex(f => new { f.User1Id, f.User2Id }).IsUnique();
            e.HasIndex(f => f.User2Id);

            e.HasOne(f => f.User1)
                .WithMany(u => u.FriendRequestsAsUser1)
                .HasForeignKey(f => f.User1Id)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(f => f.User2)
                .WithMany(u => u.FriendRequestsAsUser2)
                .HasForeignKey(f => f.User2Id)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // GAMES
        modelBuilder.Entity<Game>(e =>
        {
            e.Property(g => g.Id).ValueGeneratedOnAdd();

            e.Property(g => g.ApiGameId)
                .IsRequired();

            e.Property(g => g.Name)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Slug)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Description)
                .IsRequired()
                .HasColumnType("text");

            e.Property(g => g.BackgroundImage)
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

            e.HasIndex(g => g.ApiGameId).IsUnique();
            e.HasIndex(g => g.Slug).IsUnique();
            e.HasIndex(g => g.Name);
            
            e.OwnsMany(g => g.DLCs, o => o.ToTable("game_dlcs"));
            e.OwnsMany(g => g.ParentGames, o => o.ToTable("game_parent_games"));
            e.OwnsMany(g => g.Series, o => o.ToTable("game_series"));

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

            e.HasMany(g => g.Reviews)
                .WithOne(r => r.Game)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GENRES
        modelBuilder.Entity<Genre>(e =>
        {
            e.Property(g => g.Id).ValueGeneratedOnAdd();

            e.Property(g => g.ApiGenreId)
                .IsRequired();

            e.Property(g => g.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(g => g.ApiGenreId).IsUnique();

            e.HasIndex(g => g.Name).IsUnique();

            e.HasMany(g => g.Games)
                .WithMany(g => g.Genres)
                .UsingEntity(j => j.ToTable("game_genres"));
        });

        // PLATFORMS
        modelBuilder.Entity<Platform>(e =>
        {
            e.Property(p => p.Id).ValueGeneratedOnAdd();

            e.Property(p => p.ApiPlatformId)
                .IsRequired();

            e.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(p => p.ApiPlatformId).IsUnique();

            e.HasMany(p => p.Games)
                .WithMany(g => g.Platforms)
                .UsingEntity(j => j.ToTable("game_platforms"));
        });

        // PARENT PLATFORMS
        modelBuilder.Entity<ParentPlatform>(e =>
        {
            e.Property(pp => pp.Id).ValueGeneratedOnAdd();

            e.Property(pp => pp.ApiPlatformId)
                .IsRequired();

            e.Property(pp => pp.Name)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(pp => pp.ApiPlatformId).IsUnique();

            e.HasMany(pp => pp.Games)
                .WithMany(g => g.ParentPlatforms)
                .UsingEntity(j => j.ToTable("game_parent_platforms"));

            e.HasMany(pp => pp.Platforms)
                .WithOne(p => p.ParentPlatform)
                .HasForeignKey(p => p.ParentPlatformId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // REVIEWS
        modelBuilder.Entity<Review>(e =>
        {
            e.Property(r => r.Id).ValueGeneratedOnAdd();
            e.Property(r => r.Rating).IsRequired();

            e.Property(r => r.Content).HasColumnType("text");

            e.Property(r => r.UserId).IsRequired();
            e.Property(r => r.GameId).IsRequired();

            e.Property(r => r.CreatedAt).HasDefaultValueSql("NOW()");

            e.HasIndex(r => new { r.GameId, r.UserId }).IsUnique();
            e.HasIndex(r => r.UserId);

            e.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.Game)
                .WithMany(g => g.Reviews)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
