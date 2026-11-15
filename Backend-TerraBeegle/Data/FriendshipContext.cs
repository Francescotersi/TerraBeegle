using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class FriendshipConfiguration : IEntityTypeConfiguration<Friendship>
{
    public void Configure(EntityTypeBuilder<Friendship> entity)
    {
        entity.HasIndex(f => new { f.User1Id, f.User2Id }).IsUnique();
        entity.HasIndex(f => f.User2Id);
    }
}