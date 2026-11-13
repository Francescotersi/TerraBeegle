using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class ImageConfiguration : IEntityTypeConfiguration<Image>
{
    public void Configure(EntityTypeBuilder<Image> entity)
    {
        entity.Property(i => i.Id).ValueGeneratedOnAdd();
        entity.Property(i => i.ApiImageId).IsRequired().HasMaxLength(500);
        
        entity.HasIndex(i => i.ApiImageId).IsUnique();

        entity.HasOne(i => i.Game)
            .WithOne(g => g.Cover)
            .HasForeignKey<Game>("CoverId")
            .OnDelete(DeleteBehavior.SetNull);
        
        entity.HasOne(i => i.Company)
            .WithOne(c => c.CompanyLogo)
            .HasForeignKey<Company>("CompanyLogoId")
            .OnDelete(DeleteBehavior.SetNull);
        
        entity.HasOne(i => i.Platform)
            .WithOne(p => p.PlatformLogo)
            .HasForeignKey<Platform>("PlatformLogoId")
            .OnDelete(DeleteBehavior.SetNull);
        
        entity.HasMany(i => i.GamesAsArtwork)
            .WithMany(g => g.Artworks)
            .UsingEntity(j => j.ToTable("game_artworks"));

        entity.HasMany(i => i.GamesAsScreenshot)
            .WithMany(g => g.Screenshots)
            .UsingEntity(j => j.ToTable("game_screenshots"));
    }
}