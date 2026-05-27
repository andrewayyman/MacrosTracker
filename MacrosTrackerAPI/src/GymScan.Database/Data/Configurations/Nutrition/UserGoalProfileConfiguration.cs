using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Nutrition;

public sealed class UserGoalProfileConfiguration : IEntityTypeConfiguration<UserGoalProfile>
{
    public void Configure(EntityTypeBuilder<UserGoalProfile> builder)
    {
        builder.ToTable("UserGoalProfiles");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.BiologicalSex).HasMaxLength(16).IsRequired();
        builder.Property(p => p.AgeYears).IsRequired();
        builder.Property(p => p.WeightKg).HasPrecision(6, 2).IsRequired();
        builder.Property(p => p.HeightCm).HasPrecision(6, 2).IsRequired();
        builder.Property(p => p.ActivityLevel).HasConversion<int>().IsRequired();
        builder.Property(p => p.GoalType).HasConversion<int>().IsRequired();

        builder.Property(p => p.CalculatedBmr).HasPrecision(8, 2).IsRequired();
        builder.Property(p => p.CalculatedTdee).HasPrecision(8, 2).IsRequired();
        builder.Property(p => p.CalorieAdjustment).IsRequired();
        builder.Property(p => p.DailyCaloriesTarget).IsRequired();
        builder.Property(p => p.DailyProteinGrams).HasPrecision(7, 1).IsRequired();
        builder.Property(p => p.DailyCarbsGrams).HasPrecision(7, 1).IsRequired();
        builder.Property(p => p.DailyFatGrams).HasPrecision(7, 1).IsRequired();
        builder.Property(p => p.IsCalorieMinimumApplied).IsRequired();
        builder.Property(p => p.IsDeleted).HasDefaultValue(false);

        builder.HasIndex(p => p.UserId).IsUnique();

        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<UserGoalProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
