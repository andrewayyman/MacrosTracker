using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Nutrition;

public sealed class FoodScanConfiguration : IEntityTypeConfiguration<FoodScan>
{
    public void Configure(EntityTypeBuilder<FoodScan> builder)
    {
        builder.ToTable("FoodScans");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.ImagePath).HasMaxLength(500).IsRequired();
        builder.Property(s => s.FoodName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Calories).HasPrecision(7, 2).IsRequired();
        builder.Property(s => s.Protein).HasPrecision(5, 2).IsRequired();
        builder.Property(s => s.Carbs).HasPrecision(5, 2).IsRequired();
        builder.Property(s => s.Fat).HasPrecision(5, 2).IsRequired();
        builder.Property(s => s.ServingSizeGrams).HasPrecision(6, 2);
        builder.Property(s => s.ResultSource).IsRequired();
        builder.Property(s => s.Notes).HasMaxLength(500);
        builder.Property(s => s.ScannedAt).IsRequired();
        builder.Property(s => s.IsDeleted).HasDefaultValue(false);
        builder.HasIndex(s => new { s.UserId, s.ScannedAt });
        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
