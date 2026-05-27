namespace GymScan.Services.Features.Diary.Dtos.Responses;

public sealed record DiaryDayDto(
    string Date,
    IReadOnlyList<MealGroupDto> MealGroups,
    DailySummaryDto DailySummary,
    GoalSnapshotDto? Goals);
