using GymScan.Services.Features.NutritionGoals.Dtos.Responses;

namespace GymScan.Services.Features.Profile.Dtos.Responses;

public sealed record SetupSummaryDto(
    Guid UserId,
    string SetupStatus,
    bool IsProfileComplete,
    bool IsGoalComplete,
    ProfileDetailsDto? Profile,
    DailyNutritionGoalDto? DailyGoal);
