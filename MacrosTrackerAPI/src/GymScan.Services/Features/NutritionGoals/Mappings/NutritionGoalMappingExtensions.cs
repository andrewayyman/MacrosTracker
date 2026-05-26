using GymScan.Database.Entities.Nutrition;
using GymScan.Services.Features.NutritionGoals.Dtos.Responses;

namespace GymScan.Services.Features.NutritionGoals.Mappings;

public static class NutritionGoalMappingExtensions
{
    public static DailyNutritionGoalDto ToDailyNutritionGoalDto(this DailyNutritionGoal goal) =>
        new(
            goal.CaloriesTarget,
            goal.ProteinGramsTarget,
            goal.CarbohydratesGramsTarget,
            goal.FatGramsTarget,
            goal.GoalSource.ToString());
}
