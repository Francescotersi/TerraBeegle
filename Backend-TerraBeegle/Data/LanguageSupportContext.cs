using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class LanguageSupportConfiguration : IEntityTypeConfiguration<LanguageSupport>
{
    public void Configure(EntityTypeBuilder<LanguageSupport> entity)
    {
        entity.Property(l => l.Language).HasMaxLength(100);
        entity.Property(l => l.Type).HasMaxLength(10);
            
        entity.HasIndex(l => new { l.GameId, l.Language, l.Type }).IsUnique();
        entity.HasIndex(l => new { l.Language, l.Type });
    }
}