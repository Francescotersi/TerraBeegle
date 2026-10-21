using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
                .HasMaxLength(20)
                .HasDefaultValue("light");
                
            e.Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
        });

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
                .HasColumnType("decimal(1,1)");

            e.Property(g => g.Metacritic)
                .HasColumnType("int")
                .HasDefaultValue(0);
            
            e.Property(g => g.Developer)
                .HasMaxLength(255);

            e.Property(g => g.Publisher)
                .HasMaxLength(255);

            e.Property(g => g.CreatedAt).HasDefaultValueSql("GETDATE()");
            e.Property(g => g.UpdatedAt).HasDefaultValueSql("GETDATE()");

            e.HasIndex(g => g.RawgGameId).IsUnique();
        });
    }
}
