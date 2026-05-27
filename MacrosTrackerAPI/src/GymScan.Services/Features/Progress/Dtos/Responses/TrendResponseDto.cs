using GymScan.Services.Features.Diary.Dtos.Responses;

namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record TrendResponseDto(
    IReadOnlyList<TrendDayDto> Days,
    GoalSnapshotDto? Goals,
    int RangeInDays);
