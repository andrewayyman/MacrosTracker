using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Auth;

namespace GymScan.Database.Entities.Nutrition;

public sealed class UserGoalProfile : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string BiologicalSex { get; set; } = string.Empty;
    public int AgeYears { get; set; }
    public double WeightKg { get; set; }
    public double HeightCm { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public GoalType GoalType { get; set; }

    public double CalculatedBmr { get; set; }
    public double CalculatedTdee { get; set; }
    public int CalorieAdjustment { get; set; }
    public int DailyCaloriesTarget { get; set; }
    public double DailyProteinGrams { get; set; }
    public double DailyCarbsGrams { get; set; }
    public double DailyFatGrams { get; set; }
    public bool IsCalorieMinimumApplied { get; set; }
}
