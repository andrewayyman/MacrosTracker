using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Auth;

namespace GymScan.Database.Entities.Nutrition;

public sealed class DailyNutritionGoal : AuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int CaloriesTarget { get; set; }
    public double ProteinGramsTarget { get; set; }
    public double CarbohydratesGramsTarget { get; set; }
    public double FatGramsTarget { get; set; }
    public GoalSource GoalSource { get; set; }
    public bool IsActive { get; set; } = true;
}
