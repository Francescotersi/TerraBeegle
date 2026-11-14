using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;

namespace Backend_TerraBeegle.Data;

public class LoginChallengeConfiguration : IEntityTypeConfiguration<LoginChallenge>
{
    public void Configure(EntityTypeBuilder<LoginChallenge> entity)
    {

        // SHA256 as hex = 64 characters
        entity.Property(c => c.TokenHash).HasMaxLength(64);
        entity.Property(c => c.CodeHash).HasMaxLength(64);

        // The challenge is looked up by the hash of the token sent to the frontend
        entity.HasIndex(c => c.TokenHash).IsUnique();
    }
}