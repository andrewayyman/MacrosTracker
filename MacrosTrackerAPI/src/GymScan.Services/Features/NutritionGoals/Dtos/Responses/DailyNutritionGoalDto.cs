namespace GymScan.Services.Features.NutritionGoals.Dtos.Responses;

public sealed record DailyNutritionGoalDto(
    int CaloriesTarget,
    double ProteinGramsTarget,
    double CarbohydratesGramsTarget,
    double FatGramsTarget,
    string GoalSource);
