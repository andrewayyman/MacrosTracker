using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Nutrition;

public sealed class DailyNutritionGoalConfiguration : IEntityTypeConfiguration<DailyNutritionGoal>
{
    public void Configure(EntityTypeBuilder<DailyNutritionGoal> builder)
    {
        builder.ToTable("DailyNutritionGoals");
        builder.HasKey(goal => goal.Id);
        builder.Property(goal => goal.CaloriesTarget).IsRequired();
        builder.Property(goal => goal.ProteinGramsTarget).HasPrecision(7, 1).IsRequired();
        builder.Property(goal => goal.CarbohydratesGramsTarget).HasPrecision(7, 1).IsRequired();
        builder.Property(goal => goal.FatGramsTarget).HasPrecision(7, 1).IsRequired();
        builder.Property(goal => goal.GoalSource).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(goal => goal.IsActive).HasDefaultValue(true);
        builder.Property(goal => goal.IsDeleted).HasDefaultValue(false);
        builder.HasIndex(goal => new { goal.UserId, goal.IsActive }).IsUnique();
        builder.HasOne(goal => goal.User)
            .WithOne(user => user.ActiveDailyNutritionGoal)
            .HasForeignKey<DailyNutritionGoal>(goal => goal.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
