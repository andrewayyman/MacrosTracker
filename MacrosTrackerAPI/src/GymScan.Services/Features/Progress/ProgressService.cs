using GymScan.Database.Data;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Diary.Dtos.Responses;
using GymScan.Services.Features.Progress.Dtos.Responses;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.Progress;

public sealed class ProgressService : IProgressService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ProgressService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceResponse<TrendResponseDto>> GetTrendsAsync(int rangeInDays)
    {
        if (rangeInDays is not (7 or 30 or 90))
            return ServiceResponse<TrendResponseDto>.Failure(
                "Invalid range. Use 7, 30, or 90.",
                ["Invalid range. Use 7, 30, or 90."],
                400);

        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<TrendResponseDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var userId = context.UserId.Value;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-(rangeInDays - 1));

        var logs = await _db.MealLogs
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.DiaryDate >= startDate && m.DiaryDate <= today)
            .ToListAsync();

        var goal = await _db.DailyNutritionGoals
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId && g.IsActive);

        var byDay = logs
            .GroupBy(m => m.DiaryDate)
            .ToDictionary(
                g => g.Key,
                g => (
                    Calories: g.Sum(m => m.Calories),
                    Protein: g.Sum(m => m.Protein),
                    Carbs: g.Sum(m => m.Carbs),
                    Fat: g.Sum(m => m.Fat)
                ));

        var days = new List<TrendDayDto>(rangeInDays);
        for (var d = startDate; d <= today; d = d.AddDays(1))
        {
            if (byDay.TryGetValue(d, out var totals))
                days.Add(new TrendDayDto(d.ToString("yyyy-MM-dd"), totals.Calories, totals.Protein, totals.Carbs, totals.Fat, true));
            else
                days.Add(new TrendDayDto(d.ToString("yyyy-MM-dd"), 0, 0, 0, 0, false));
        }

        GoalSnapshotDto? goalSnapshot = goal is null ? null : new GoalSnapshotDto(
            goal.CaloriesTarget,
            (decimal)goal.ProteinGramsTarget,
            (decimal)goal.CarbohydratesGramsTarget,
            (decimal)goal.FatGramsTarget);

        return ServiceResponse<TrendResponseDto>.Success(
            new TrendResponseDto(days, goalSnapshot, rangeInDays),
            string.Empty);
    }

    public async Task<ServiceResponse<StreakResponseDto>> GetStreaksAsync()
    {
        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<StreakResponseDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var userId = context.UserId.Value;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(-29);

        var logs = await _db.MealLogs
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.DiaryDate >= startDate && m.DiaryDate <= today)
            .ToListAsync();

        var goal = await _db.DailyNutritionGoals
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId && g.IsActive);

        var byDay = logs
            .GroupBy(m => m.DiaryDate)
            .ToDictionary(g => g.Key, g => g.Sum(m => m.Calories));

        var heatmapDays = new List<DayStatusEntry>(30);
        for (var d = startDate; d <= today; d = d.AddDays(1))
        {
            var status = ClassifyDay(byDay.TryGetValue(d, out var cal) ? cal : (decimal?)null, goal?.CaloriesTarget);
            heatmapDays.Add(new DayStatusEntry(d.ToString("yyyy-MM-dd"), status, byDay.GetValueOrDefault(d, 0)));
        }

        var currentStreak = 0;
        for (var i = heatmapDays.Count - 1; i >= 0; i--)
        {
            var status = heatmapDays[i].Status;
            if (status == "OnGoal")
                currentStreak++;
            else if (status == "NoData")
                continue;
            else
                break;
        }

        var daysWithData = heatmapDays.Count(e => e.Status != "NoData");
        var onGoalCount = heatmapDays.Count(e => e.Status == "OnGoal");
        var goalHitRate = daysWithData == 0 ? 0m : Math.Round((decimal)onGoalCount / daysWithData * 100, 1);

        return ServiceResponse<StreakResponseDto>.Success(
            new StreakResponseDto(currentStreak, goalHitRate, heatmapDays, goal is not null),
            string.Empty);
    }

    public async Task<ServiceResponse<WeeklySummaryResponseDto>> GetWeeklySummaryAsync(DateOnly weekStart)
    {
        if (weekStart.DayOfWeek != DayOfWeek.Monday)
            return ServiceResponse<WeeklySummaryResponseDto>.Failure(
                "weekStart must be a Monday.",
                ["weekStart must be a Monday."],
                400);

        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<WeeklySummaryResponseDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var userId = context.UserId.Value;
        var weekEnd = weekStart.AddDays(6);

        var logs = await _db.MealLogs
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.DiaryDate >= weekStart && m.DiaryDate <= weekEnd)
            .ToListAsync();

        var goal = await _db.DailyNutritionGoals
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId && g.IsActive);

        var byDay = logs
            .GroupBy(m => m.DiaryDate)
            .ToDictionary(g => g.Key, g => g.Sum(m => m.Calories));

        var dayEntries = new List<WeekDayEntry>(7);
        for (var i = 0; i < 7; i++)
        {
            var d = weekStart.AddDays(i);
            var hasData = byDay.ContainsKey(d);
            var totalCalories = byDay.GetValueOrDefault(d, 0);
            var caloriesTarget = goal?.CaloriesTarget ?? 0;
            var status = hasData
                ? ClassifyDay(totalCalories, caloriesTarget == 0 ? (int?)null : caloriesTarget)
                : "NoData";
            dayEntries.Add(new WeekDayEntry(
                d.ToString("yyyy-MM-dd"),
                d.DayOfWeek.ToString(),
                totalCalories,
                caloriesTarget,
                hasData,
                status));
        }

        var weeklyTotal = dayEntries.Where(e => e.HasData).Sum(e => e.TotalCalories);
        var hasDataCount = dayEntries.Count(e => e.HasData);
        var weeklyGoal = goal is null ? 0m : goal.CaloriesTarget * hasDataCount;

        return ServiceResponse<WeeklySummaryResponseDto>.Success(
            new WeeklySummaryResponseDto(
                weekStart.ToString("yyyy-MM-dd"),
                weekEnd.ToString("yyyy-MM-dd"),
                dayEntries,
                weeklyTotal,
                weeklyGoal,
                goal is not null),
            string.Empty);
    }

    private static string ClassifyDay(decimal? totalCalories, int? caloriesTarget)
    {
        if (totalCalories is null)
            return "NoData";

        if (caloriesTarget is null or 0)
            return "NoData";

        var target = (decimal)caloriesTarget.Value;
        if (totalCalories > target)
            return "OverGoal";
        if (totalCalories >= target * 0.75m)
            return "OnGoal";
        return "UnderGoal";
    }
}
