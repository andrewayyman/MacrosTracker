using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Nutrition;

public sealed class MealLogConfiguration : IEntityTypeConfiguration<MealLog>
{
    public void Configure(EntityTypeBuilder<MealLog> builder)
    {
        builder.ToTable("MealLogs");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.DiaryDate).IsRequired();
        builder.Property(m => m.MealType).IsRequired();
        builder.Property(m => m.FoodName).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Calories).HasPrecision(7, 2).IsRequired();
        builder.Property(m => m.Protein).HasPrecision(5, 2).IsRequired();
        builder.Property(m => m.Carbs).HasPrecision(5, 2).IsRequired();
        builder.Property(m => m.Fat).HasPrecision(5, 2).IsRequired();
        builder.Property(m => m.ServingSizeGrams).HasPrecision(6, 2);
        builder.Property(m => m.LoggedAt).IsRequired();
        builder.Property(m => m.IsDeleted).HasDefaultValue(false);
        builder.HasIndex(m => new { m.UserId, m.DiaryDate });
        builder.HasIndex(m => new { m.UserId, m.LoggedAt });
        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(m => m.FoodScan)
            .WithMany()
            .HasForeignKey(m => m.FoodScanId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(m => m.LocalFoodItem)
            .WithMany()
            .HasForeignKey(m => m.LocalFoodItemId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
