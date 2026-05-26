namespace GymScan.Services.Features.NutritionGoals.Dtos.Requests;

public sealed record UpsertDailyNutritionGoalRequestDto(
    int CaloriesTarget,
    double ProteinGramsTarget,
    double CarbohydratesGramsTarget,
    double FatGramsTarget,
    string? GoalSource);
