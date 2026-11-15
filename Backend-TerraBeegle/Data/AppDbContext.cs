using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Franchise> Franchises => Set<Franchise>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<GameMode> GameModes => Set<GameMode>();

    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Image> Images => Set<Image>();
    public DbSet<Keyword> Keywords => Set<Keyword>();
    public DbSet<LanguageSupport> LanguageSupports => Set<LanguageSupport>();
    public DbSet<LoginChallenge> LoginChallenges => Set<LoginChallenge>();

    public DbSet<PegiDescription> PegiDescriptions => Set<PegiDescription>();
    public DbSet<Perspective> Perspectives => Set<Perspective>();
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<PlatformFamily> PlatformFamilies => Set<PlatformFamily>();
    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<Serie> Series => Set<Serie>();
    public DbSet<Theme> Themes => Set<Theme>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Website> Websites => Set<Website>();

    // Convert all enums to strings and set a max length of 30 for all enum columns
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<Enum>()
            .HaveConversion<string>()
            .HaveMaxLength(30);
    }

    // Configures tables, columns, keys and relationships
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var created = entityType.FindProperty("CreatedAt");
            if (created != null && created.ClrType == typeof(DateTime))
                created.SetDefaultValueSql("NOW()");

            var updated = entityType.FindProperty("UpdatedAt");
            if (updated != null && updated.ClrType == typeof(DateTime))
                updated.SetDefaultValueSql("NOW()");
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries().Where(e => e.State == EntityState.Modified))
        {
            if (entry.Metadata.FindProperty("UpdatedAt") is not null)
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}

