using GymScan.Services.Features.UserGoalProfile.Dtos.Responses;
using Entity = GymScan.Database.Entities.Nutrition.UserGoalProfile;

namespace GymScan.Services.Features.UserGoalProfile.Mappings;

public static class GoalProfileMappingExtensions
{
    public static GoalProfileDto ToGoalProfileDto(this Entity profile) =>
        new(
            profile.BiologicalSex,
            profile.AgeYears,
            profile.WeightKg,
            profile.HeightCm,
            profile.ActivityLevel.ToString(),
            profile.GoalType.ToString(),
            profile.CalculatedBmr,
            profile.CalculatedTdee,
            profile.CalorieAdjustment,
            profile.DailyCaloriesTarget,
            profile.DailyProteinGrams,
            profile.DailyCarbsGrams,
            profile.DailyFatGrams,
            profile.IsCalorieMinimumApplied);
}
