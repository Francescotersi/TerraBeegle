using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class KeywordConfiguration : IEntityTypeConfiguration<Keyword>
{
    public void Configure(EntityTypeBuilder<Keyword> entity)
    {
        entity.Property(k => k.Name).HasMaxLength(100);
        entity.Property(k => k.Slug).HasMaxLength(100);
            
        entity.HasIndex(k => k.ApiKeywordId).IsUnique();
        entity.HasIndex(k => k.Slug).IsUnique();
        entity.HasIndex(k => k.Name);
    }
}