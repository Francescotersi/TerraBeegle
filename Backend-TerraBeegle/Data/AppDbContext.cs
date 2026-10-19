using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ChallengeItem> ChallengeItems => Set<ChallengeItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ChallengeItem>().HasData(
            new ChallengeItem
            {
                Id = 1,
                Title = "Setup Ambiente & Database",
                Description = ".NET 10 LTS + PostgreSQL + Angular LTS",
                IsCompleted = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new ChallengeItem
            {
                Id = 2,
                Title = "Terranova Challenge (42 Florence)",
                Description = "Sviluppo web application fullstack",
                IsCompleted = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
