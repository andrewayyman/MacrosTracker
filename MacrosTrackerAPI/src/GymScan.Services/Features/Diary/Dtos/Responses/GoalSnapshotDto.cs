namespace GymScan.Services.Features.Diary.Dtos.Responses;

public sealed record GoalSnapshotDto(
    decimal CaloriesTarget,
    decimal ProteinTarget,
    decimal CarbsTarget,
    decimal FatTarget);
