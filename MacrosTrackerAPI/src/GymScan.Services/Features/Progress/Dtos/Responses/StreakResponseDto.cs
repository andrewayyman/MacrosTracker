namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record StreakResponseDto(
    int CurrentStreak,
    decimal GoalHitRate,
    IReadOnlyList<DayStatusEntry> HeatmapDays,
    bool HasGoal);
