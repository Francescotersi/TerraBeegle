using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> entity)
    {
        entity.Property(g => g.Name).HasMaxLength(255);
        entity.Property(g => g.Slug).HasMaxLength(255);

        entity.Property(g => g.Summary).HasColumnType("text");
        entity.Property(g => g.ReleaseDate).HasColumnType("date");
        entity.Property(g => g.Rating).HasPrecision(5, 2);

        entity.HasIndex(g => g.ApiGameId).IsUnique();
        entity.HasIndex(g => g.Slug).IsUnique();
        entity.HasIndex(g => g.Name);
        
        // 1-to-many relationships on Game entity
        entity.HasOne(g => g.ParentGame)
            .WithMany(g => g.GamesAsParent)
            .HasForeignKey("ParentGameId")
            .OnDelete(DeleteBehavior.Restrict);
            
        entity.HasOne(g => g.VersionParent)
            .WithMany(g => g.GamesAsVersionParent)
            .HasForeignKey("VersionParentId")
            .OnDelete(DeleteBehavior.Restrict);

        // Many-to-many relationships on Game entity
        entity.HasMany(g => g.Bundles)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_bundles"));

        entity.HasMany(g => g.DLCs)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_dlcs"));

        entity.HasMany(g => g.ExpandedGames)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_expanded_games"));

        entity.HasMany(g => g.Expansions)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_expansions"));
        
        entity.HasMany(g => g.Forks)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_forks"));
        
        entity.HasMany(g => g.Remakes)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_remakes"));
        
        entity.HasMany(g => g.Remasters)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_remasters"));

        // Many-to-many relationships on Game entity with other game related entities
        entity.HasMany(g => g.Franchises)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_franchises"));

        entity.HasMany(g => g.Series)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_series"));

        // Many-to-many relationships on Game entity with other entities
        entity.HasMany(g => g.Platforms)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_platforms"));

        entity.HasMany(g => g.Genres)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_genres"));
        
        entity.HasMany(g => g.Themes)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_themes"));

        entity.HasMany(g => g.Keywords)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_keywords"));
        
        entity.HasMany(g => g.GameModes)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_game_modes"));
        
        entity.HasMany(g => g.Perspectives)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_perspectives"));
            
        entity.HasMany(g => g.LanguageSupports)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.PegiDescriptions)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_pegi_descriptions"));

        entity.HasMany(g => g.ReleaseDates)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-one and one-to-many relationships on Game entity with website entities
        entity.HasOne(g => g.OfficialWebsite)
            .WithOne()
            .HasForeignKey<Website>()
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Stores)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Websites)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-one and one-to-many relationships on Game entity with media entities
        entity.HasOne(g => g.Cover)
            .WithOne()
            .HasForeignKey<Game>("CoverId")
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Screenshots)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Artworks)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Videos)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);

        // Many-to-many relationships on Game entity with Company entity
        entity.HasMany(g => g.Developers)
            .WithMany(c => c.DevelopedGames)
            .UsingEntity(j => j.ToTable("game_developers"));
        
        entity.HasMany(g => g.Publishers)
            .WithMany(c => c.PublishedGames)
            .UsingEntity(j => j.ToTable("game_publishers"));

        // Many-to-many relationships on Game entity with User entity
        entity.HasMany(g => g.FavoritedByUsers)
            .WithMany(u => u.Favorites)
            .UsingEntity(j => j.ToTable("favorite_games"));
            
        entity.HasMany(g => g.WishlistedByUsers)
            .WithMany(u => u.WishlistItems)
            .UsingEntity(j => j.ToTable("wishlist_games"));
        
        entity.HasMany(g => g.Reviews)
            .WithOne()
            .HasForeignKey()
            .OnDelete(DeleteBehavior.Cascade);
    }
}