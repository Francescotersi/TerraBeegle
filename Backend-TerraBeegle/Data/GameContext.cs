using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> entity)
    {
        entity.Property(g => g.Id).ValueGeneratedOnAdd();

        entity.Property(g => g.ApiGameId)
            .IsRequired();

        entity.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(g => g.Slug)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(g => g.Summary)
            .IsRequired()
            .HasColumnType("text");

        entity.Property(g => g.ReleaseDate)
            .HasColumnType("date");

        entity.Property(g => g.Rating)
            .HasPrecision(4, 2);

        entity.Property(g => g.CreatedAt).HasDefaultValueSql("NOW()");
        entity.Property(g => g.UpdatedAt).HasDefaultValueSql("NOW()");

        entity.HasIndex(g => g.ApiGameId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();
        entity.HasIndex(g => g.Name);

        entity.Ignore(g => g.OfficialWebsite);
        entity.Ignore(g => g.Websites);
        entity.Ignore(g => g.Stores);

        entity.HasOne(g => g.Cover)
            .WithOne(i => i.Game)
            .HasForeignKey<Image>("CoverId")
            .OnDelete(DeleteBehavior.SetNull);

        entity.HasMany(g => g.Artworks)
            .WithMany(i => i.GamesAsArtwork)
            .UsingEntity(j => j.ToTable("game_artworks"));

        entity.HasMany(g => g.Screenshots)
            .WithMany(i => i.GamesAsScreenshot)
            .UsingEntity(j => j.ToTable("game_screenshots"));
            
        entity.HasOne(g => g.ParentGame)
            .WithMany(g => g.GamesAsParent)
            .HasForeignKey("ParentGameId")
            .OnDelete(DeleteBehavior.Restrict);
            
        entity.HasOne(g => g.VersionParent)
            .WithMany(g => g.GamesAsVersionParent)
            .HasForeignKey("VersionParentId")
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasMany(g => g.DLCs)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_dlcs"));

        entity.HasMany(g => g.ExpandedGames)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_expanded_games"));

        entity.HasMany(g => g.Expansions)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_expansions"));

        entity.HasMany(g => g.Series)
            .WithMany(s => s.Games)
            .UsingEntity(j => j.ToTable("game_series"));

        entity.HasMany(g => g.Genres)
            .WithMany(g => g.Games)
            .UsingEntity(j => j.ToTable("game_genres"));
            
        entity.HasMany(g => g.Platforms)
            .WithMany(g => g.Games)
            .UsingEntity(j => j.ToTable("game_platforms"));
            
        entity.HasMany(g => g.FavoritedByUsers)
            .WithMany(u => u.Favorites)
            .UsingEntity(j => j.ToTable("favorite_games"));
            
        entity.HasMany(g => g.WishlistedByUsers)
            .WithMany(u => u.WishlistItems)
            .UsingEntity(j => j.ToTable("wishlist_games"));

        entity.HasMany(g => g.Reviews)
            .WithOne(r => r.Game)
            .HasForeignKey(r => r.GameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}