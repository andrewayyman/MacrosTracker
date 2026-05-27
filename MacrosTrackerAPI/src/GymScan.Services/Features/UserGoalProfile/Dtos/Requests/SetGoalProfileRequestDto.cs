namespace GymScan.Services.Features.UserGoalProfile.Dtos.Requests;

public sealed record SetGoalProfileRequestDto(
    string BiologicalSex,
    int AgeYears,
    double WeightKg,
    double HeightCm,
    string ActivityLevel,
    string GoalType);
