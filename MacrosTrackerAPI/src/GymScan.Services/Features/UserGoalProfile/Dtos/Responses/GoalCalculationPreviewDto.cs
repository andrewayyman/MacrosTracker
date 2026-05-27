namespace GymScan.Services.Features.UserGoalProfile.Dtos.Responses;

public sealed record GoalCalculationPreviewDto(
    double CalculatedBmr,
    double CalculatedTdee,
    int CalorieAdjustment,
    int DailyCaloriesTarget,
    double DailyProteinGrams,
    double DailyCarbsGrams,
    double DailyFatGrams,
    bool IsCalorieMinimumApplied);
