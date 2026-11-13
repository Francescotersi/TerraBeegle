using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<PlatformFamily> PlatformFamilies => Set<PlatformFamily>();
    public DbSet<Theme> Themes => Set<Theme>();
    // public DbSet<Keyword> Keywords => Set<Keyword>();
    public DbSet<Image> Images => Set<Image>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<LoginChallenge> LoginChallenges => Set<LoginChallenge>();

    // Configures tables, columns, keys and relationships
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
                .HasDefaultValue(UserTheme.Light);

            e.Property(u => u.DogCompanion)
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(DogCompanion.Beagle);

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

            e.HasOne(u => u.LoginChallenge)
                .WithOne(c => c.User)
                .HasForeignKey<LoginChallenge>(c => c.UserId)
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

            e.Property(g => g.ApiGameId)
                .IsRequired();

            e.Property(g => g.Name)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Slug)
                .IsRequired()
                .HasMaxLength(255);

            e.Property(g => g.Summary)
                .IsRequired()
                .HasColumnType("text");

            e.Property(g => g.ReleaseDate)
                .HasColumnType("date");

            e.Property(g => g.Rating)
                .HasPrecision(5, 2);

            e.Property(g => g.CreatedAt).HasDefaultValueSql("NOW()");
            e.Property(g => g.UpdatedAt).HasDefaultValueSql("NOW()");

            e.HasIndex(g => g.ApiGameId).IsUnique();
            e.HasIndex(g => g.Slug).IsUnique();
            e.HasIndex(g => g.Name);

            e.Ignore(g => g.OfficialWebsite);
            e.Ignore(g => g.Websites);
            e.Ignore(g => g.Stores);
            e.Ignore(g => g.Videos);
            e.Ignore(g => g.Keywords);

            e.HasOne(g => g.Cover)
                .WithOne(i => i.Game)
                .HasForeignKey<Image>("CoverId")
                .OnDelete(DeleteBehavior.SetNull);

            e.HasMany(g => g.Artworks)
                .WithMany()
                .UsingEntity(j => j.ToTable("game_artworks"));

            e.HasMany(g => g.Screenshots)
                .WithMany()
                .UsingEntity(j => j.ToTable("game_screenshots"));
            
            e.HasOne(g => g.ParentGame)
                .WithMany()
                .HasForeignKey("ParentGameId")
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(g => g.DLCs)
                .WithMany()
                .UsingEntity(j => j.ToTable("game_dlcs"));

            e.HasMany(g => g.Series)
                .WithMany()
                .UsingEntity(j => j.ToTable("game_series"));

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
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.Game)
                .WithMany(g => g.Reviews)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Restrict);
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

            e.Property(p => p.Slug)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(p => p.Name);

            e.HasIndex(p => p.ApiPlatformId).IsUnique();
            e.HasIndex(p => p.Slug).IsUnique();

            e.Property(p => p.PlatformFamilyId)
                .HasConversion<int?>()
                .HasColumnName("PlatformFamily");

            e.HasOne(p => p.PlatformFamily)
                .WithMany(f => f.Platforms)
                .HasForeignKey(p => p.PlatformFamilyId)
                .HasPrincipalKey(f => f.ApiPlatformFamilyId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(p => p.Games)
                .WithMany(g => g.Platforms)
                .UsingEntity(j => j.ToTable("game_platforms"));
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
            e.Property(g => g.Slug)
                .IsRequired()
                .HasMaxLength(100);

            e.HasIndex(g => g.Name);

            e.HasIndex(g => g.ApiGenreId).IsUnique();
            e.HasIndex(g => g.Slug).IsUnique();

            e.HasMany(g => g.Games)
                .WithMany(g => g.Genres)
                .UsingEntity(j => j.ToTable("game_genres"));
        });


        // THEMES
        modelBuilder.Entity<Theme>(e =>
        {
            e.Property(t => t.Id).ValueGeneratedOnAdd();
            e.Property(t => t.ApiThemeId).IsRequired();
            e.Property(t => t.Name).IsRequired().HasMaxLength(100);
            e.Property(t => t.Slug).IsRequired().HasMaxLength(100);

            e.HasIndex(t => t.Name);

            e.HasIndex(t => t.ApiThemeId).IsUnique();
            e.HasIndex(t => t.Slug).IsUnique();

            e.HasMany(t => t.Games)
                .WithMany(g => g.Themes)
                .UsingEntity(j => j.ToTable("game_themes"));
        });

        modelBuilder.Entity<PlatformFamily>(e =>
        {
            e.Property(p => p.Id).ValueGeneratedOnAdd();
            e.Property(p => p.ApiPlatformFamilyId)
                .HasConversion<int>()
                .IsRequired();
            e.Property(p => p.Name).IsRequired().HasMaxLength(100);
            e.Property(p => p.Slug).IsRequired().HasMaxLength(100);

            e.HasIndex(p => p.ApiPlatformFamilyId).IsUnique();
            e.HasIndex(p => p.Slug).IsUnique();
        });

        modelBuilder.Entity<Image>(e =>
        {
            e.Property(i => i.Id).ValueGeneratedOnAdd();
            e.Property(i => i.ApiImageId).IsRequired().HasMaxLength(500);
            
            e.HasIndex(i => i.ApiImageId).IsUnique();
        });

        // COMPANIES
        modelBuilder.Entity<Company>(e =>
        {
            e.Property(c => c.Id).ValueGeneratedOnAdd();
            e.Property(c => c.ApiCompanyId).IsRequired();
            e.Property(c => c.Name).IsRequired().HasMaxLength(255);
            e.Property(c => c.Slug).IsRequired().HasMaxLength(255);

            e.HasIndex(c => c.ApiCompanyId).IsUnique();
            e.HasIndex(c => c.Slug).IsUnique();

            e.HasMany(c => c.DevelopedGames)
                .WithMany(g => g.Developers)
                .UsingEntity(j => j.ToTable("game_developers"));

            e.HasMany(c => c.PublishedGames)
                .WithMany(g => g.Publishers)
                .UsingEntity(j => j.ToTable("game_publishers"));
        });

        // LOGIN CHALLENGES (2FA)
        modelBuilder.Entity<LoginChallenge>(e =>
        {
            e.Property(c => c.Id).ValueGeneratedOnAdd();

            // SHA256 as hex = 64 characters
            e.Property(c => c.TokenHash)
                .IsRequired()
                .HasMaxLength(64);

            e.Property(c => c.CodeHash)
                .IsRequired()
                .HasMaxLength(64);

            // The challenge is looked up by the hash of the token sent to the frontend
            e.HasIndex(c => c.TokenHash).IsUnique();

            e.HasOne(c => c.User)
                .WithOne(u => u.LoginChallenge)
                .HasForeignKey<LoginChallenge>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
