using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Game> Games => Set<Game>();
        public DbSet<Favorite> Favorites => Set<Favorite>();
        public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(e =>
            {
                e.Property(u => u.Name).HasMaxLength(100);
                e.Property(u => u.FamilyName).HasMaxLength(100);
                e.Property(u => u.Email).HasMaxLength(255);
                e.Property(u => u.Username).HasMaxLength(100);
                e.Property(u => u.PasswordHash).HasMaxLength(255);
                e.Property(u => u.Theme).HasMaxLength(20).HasDefaultValue("light");
                
            });
        }
    }
}
