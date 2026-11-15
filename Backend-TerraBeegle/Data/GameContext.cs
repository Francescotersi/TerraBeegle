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
        entity.HasIndex(g => g.ReleaseDate);
        entity.HasIndex(g => g.Rating);
        entity.HasIndex(g => g.AggregatedRating);
        entity.HasIndex(g => g.PegiRating);
        entity.HasIndex(g => g.GameStatus);
        
        // 1-to-many relationships on Game entity
        entity.HasOne(g => g.ParentGame)
            .WithMany(g => g.GamesAsParent)
            .HasForeignKey(g => g.ParentGameId)
            .OnDelete(DeleteBehavior.Restrict);
            
        entity.HasOne(g => g.VersionParent)
            .WithMany(g => g.GamesAsVersionParent)
            .HasForeignKey(g => g.VersionParentId)
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
        
        entity.HasMany(g => g.Ports)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_ports"));
        
        entity.HasMany(g => g.SimilarGames)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_similar_games"));

        entity.HasMany(g => g.StandaloneExpansions)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_standalone_expansions"));
        
        entity.HasMany(g => g.Remakes)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_remakes"));
        
        entity.HasMany(g => g.Remasters)
            .WithMany()
            .UsingEntity(j => j.ToTable("game_remasters"));

        // Many-to-many relationships on Game entity with other game related entities
        entity.HasMany(g => g.Franchises)
            .WithMany(f => f.Games)
            .UsingEntity(j => j.ToTable("game_franchises"));

        entity.HasMany(g => g.Series)
            .WithMany(s => s.Games)
            .UsingEntity(j => j.ToTable("game_series"));

        // Many-to-many relationships on Game entity with other entities
        entity.HasMany(g => g.Platforms)
            .WithMany(p => p.Games)
            .UsingEntity(j => j.ToTable("game_platforms"));

        entity.HasMany(g => g.Genres)
            .WithMany(g => g.Games)
            .UsingEntity(j => j.ToTable("game_genres"));
        
        entity.HasMany(g => g.Themes)
            .WithMany(t => t.Games)
            .UsingEntity(j => j.ToTable("game_themes"));

        entity.HasMany(g => g.Keywords)
            .WithMany(k => k.Games)
            .UsingEntity(j => j.ToTable("game_keywords"));
        
        entity.HasMany(g => g.GameModes)
            .WithMany(g => g.Games)
            .UsingEntity(j => j.ToTable("game_game_modes"));
        
        entity.HasMany(g => g.Perspectives)
            .WithMany(p => p.Games)
            .UsingEntity(j => j.ToTable("game_perspectives"));
            
        entity.HasMany(g => g.LanguageSupports)
            .WithOne(ls => ls.Game)
            .HasForeignKey(ls => ls.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.PegiDescriptions)
            .WithMany(g => g.Games)
            .UsingEntity(j => j.ToTable("game_pegi_descriptions"));

        entity.HasMany(g => g.ReleaseDates)
            .WithOne(rd => rd.Game)
            .HasForeignKey(rd => rd.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-one and one-to-many relationships on Game entity with website entities
        entity.HasMany(g => g.Websites)
            .WithOne(w => w.Game)
            .HasForeignKey(w => w.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-one and one-to-many relationships on Game entity with media entities
        entity.HasMany(g => g.Images)
            .WithOne(i => i.Game)
            .HasForeignKey(s => s.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasMany(g => g.Videos)
            .WithOne(v => v.Game)
            .HasForeignKey(v => v.GameId)
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
            .WithOne(r => r.Game)
            .HasForeignKey(r => r.ApiGameId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}