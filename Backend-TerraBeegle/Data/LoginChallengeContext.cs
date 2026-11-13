using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class LoginChallengeConfiguration : IEntityTypeConfiguration<LoginChallenge>
{
    public void Configure(EntityTypeBuilder<LoginChallenge> entity)
    {
        entity.Property(c => c.Id).ValueGeneratedOnAdd();

        // SHA256 as hex = 64 characters
        entity.Property(c => c.TokenHash)
            .IsRequired()
            .HasMaxLength(64);

        entity.Property(c => c.CodeHash)
            .IsRequired()
            .HasMaxLength(64);

        // The challenge is looked up by the hash of the token sent to the frontend
        entity.HasIndex(c => c.TokenHash).IsUnique();

        entity.HasOne(c => c.User)
            .WithOne(u => u.LoginChallenge)
            .HasForeignKey<LoginChallenge>(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}