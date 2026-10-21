using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Game> Games => Set<Game>();
    
    public DbSet<Friendship> Friendships => Set<Friendship>();

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
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(Theme.Light);

            e.Property(u => u.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.Property(u => u.CreatedAt)
                .HasDefaultValueSql("NOW()");

            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();

            e.HasMany(u => u.Favorites)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "favorites",
                    r => r.HasOne<Game>().WithMany().HasForeignKey("GameId").OnDelete(DeleteBehavior.Cascade),
                    l => l.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("UserId", "GameId");
                        j.Property<DateTime>("AddedAt").HasDefaultValueSql("NOW()");
                    });

            e.HasMany(u => u.WishlistItems)
                .WithMany()
                .UsingEntity<Dictionary<string, object>>(
                    "wishlist_items",
                    r => r.HasOne<Game>().WithMany().HasForeignKey("GameId").OnDelete(DeleteBehavior.Cascade),
                    l => l.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade),
                    j =>
                    {
                        j.HasKey("UserId", "GameId");
                        j.Property<DateTime>("AddedAt").HasDefaultValueSql("NOW()");
                    });
        });
        
        modelBuilder.Entity<Friendship>(e =>
        {
            e.HasOne(f => f.User).WithMany(u => u.Friendships)
                .HasForeignKey(f => f.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(f => f.Friend).WithMany()
                .HasForeignKey(f => f.FriendId).OnDelete(DeleteBehavior.Restrict); // două cascade spre users = conflict
            e.HasIndex(f => new { f.UserId, f.FriendId }).IsUnique();
            e.Property(f => f.Status).HasConversion<string>();
            e.Property(f => f.CreatedAt).HasDefaultValueSql("NOW()");
            e.ToTable(t => t.HasCheckConstraint("ck_friendships_not_self", "\"UserId\" <> \"FriendId\""));
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
                .HasPrecision(4, 2);

            e.Property(g => g.Developer)
                .HasMaxLength(255);

            e.Property(g => g.Publisher)
                .HasMaxLength(255);

            e.Property(g => g.CreatedAt).HasDefaultValueSql("NOW()");
            e.Property(g => g.UpdatedAt).HasDefaultValueSql("NOW()");

            e.HasIndex(g => g.RawgGameId).IsUnique();
        });
    }
}
