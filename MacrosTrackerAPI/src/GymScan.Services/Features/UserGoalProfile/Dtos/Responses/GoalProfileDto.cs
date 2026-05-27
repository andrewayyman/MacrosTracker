namespace GymScan.Services.Features.UserGoalProfile.Dtos.Responses;

public sealed record GoalProfileDto(
    string BiologicalSex,
    int AgeYears,
    double WeightKg,
    double HeightCm,
    string ActivityLevel,
    string GoalType,
    double CalculatedBmr,
    double CalculatedTdee,
    int CalorieAdjustment,
    int DailyCaloriesTarget,
    double DailyProteinGrams,
    double DailyCarbsGrams,
    double DailyFatGrams,
    bool IsCalorieMinimumApplied);
