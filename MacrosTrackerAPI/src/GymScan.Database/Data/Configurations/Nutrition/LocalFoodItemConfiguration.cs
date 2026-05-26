using GymScan.Database.Entities.Nutrition;
using GymScan.Database.Seeds;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Nutrition;

public sealed class LocalFoodItemConfiguration : IEntityTypeConfiguration<LocalFoodItem>
{
    public void Configure(EntityTypeBuilder<LocalFoodItem> builder)
    {
        builder.ToTable("LocalFoodItems");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).HasMaxLength(200).IsRequired();
        builder.HasIndex(f => f.Name);
        builder.Property(f => f.AlternateNames).HasMaxLength(500);
        builder.Property(f => f.CaloriesPer100g).HasPrecision(7, 2).IsRequired();
        builder.Property(f => f.ProteinPer100g).HasPrecision(5, 2).IsRequired();
        builder.Property(f => f.CarbsPer100g).HasPrecision(5, 2).IsRequired();
        builder.Property(f => f.FatPer100g).HasPrecision(5, 2).IsRequired();
        builder.Property(f => f.TypicalServingSizeGrams).HasPrecision(6, 2).IsRequired();
        builder.Property(f => f.CreatedAt).IsRequired();
        builder.HasData(LocalFoodItemSeed.Items);
    }
}
