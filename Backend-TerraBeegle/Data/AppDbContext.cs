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
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Image> Images => Set<Image>();

    public DbSet<Keyword> Keywords => Set<Keyword>();
    public DbSet<LoginChallenge> LoginChallenges => Set<LoginChallenge>();
    public DbSet<PegiDescription> PegiDescriptions => Set<PegiDescription>();

    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<PlatformFamily> PlatformFamilies => Set<PlatformFamily>();
    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<Serie> Series => Set<Serie>();
    public DbSet<Theme> Themes => Set<Theme>();
    public DbSet<User> Users => Set<User>();

    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Website> Websites => Set<Website>();

    // Configures tables, columns, keys and relationships
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
