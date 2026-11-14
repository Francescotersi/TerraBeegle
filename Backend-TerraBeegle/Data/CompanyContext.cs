using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Data;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> entity)
    {
        entity.Property(c => c.Name).HasMaxLength(255);
        entity.Property(c => c.Slug).HasMaxLength(255);

        entity.HasIndex(c => c.ApiCompanyId).IsUnique();
        entity.HasIndex(c => c.Slug).IsUnique();

        entity.HasOne(c => c.CompanyLogo)
            .WithOne()
            .HasForeignKey<Company>("CompanyLogoId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}