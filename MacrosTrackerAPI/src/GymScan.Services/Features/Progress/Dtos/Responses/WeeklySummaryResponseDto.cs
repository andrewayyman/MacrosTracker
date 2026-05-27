namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record WeeklySummaryResponseDto(
    string WeekStart,
    string WeekEnd,
    IReadOnlyList<WeekDayEntry> Days,
    decimal WeeklyTotal,
    decimal WeeklyGoal,
    bool HasGoal);
