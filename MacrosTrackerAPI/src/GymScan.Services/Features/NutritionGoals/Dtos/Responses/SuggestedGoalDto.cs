namespace GymScan.Services.Features.NutritionGoals.Dtos.Responses;

public sealed record SuggestedGoalDto(
    int CaloriesTarget,
    double ProteinGramsTarget,
    double CarbohydratesGramsTarget,
    double FatGramsTarget);
