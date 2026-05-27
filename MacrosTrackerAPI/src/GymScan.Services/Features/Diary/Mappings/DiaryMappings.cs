using GymScan.Database.Entities.Nutrition;
using GymScan.Services.Features.Diary.Dtos.Responses;
using GymScan.Services.Features.FoodScan.Enums;

namespace GymScan.Services.Features.Diary.Mappings;

public static class DiaryMappings
{
    public static MealLogEntryDto ToMealLogEntryDto(this MealLog entry) =>
        new(
            Id: entry.Id,
            FoodName: entry.FoodName,
            Calories: entry.Calories,
            Protein: entry.Protein,
            Carbs: entry.Carbs,
            Fat: entry.Fat,
            ServingSizeGrams: entry.ServingSizeGrams,
            LoggedAt: entry.LoggedAt.ToString("o"));

    public static DiaryDayDto BuildDiaryDayDto(
        DateOnly date,
        List<MealLog> entries,
        DailyNutritionGoal? goal)
    {
        var mealGroups = new[] { MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack }
            .Select(mealType =>
            {
                var groupEntries = entries
                    .Where(e => e.MealType == (int)mealType)
                    .Select(e => e.ToMealLogEntryDto())
                    .ToList();

                return (mealType, groupEntries);
            })
            .Where(g => g.groupEntries.Count > 0)
            .Select(g => new MealGroupDto(
                MealType: g.mealType.ToString(),
                Entries: g.groupEntries,
                GroupCalories: g.groupEntries.Sum(e => e.Calories)))
            .ToList();

        var summary = new DailySummaryDto(
            TotalCalories: entries.Sum(e => e.Calories),
            TotalProtein: entries.Sum(e => e.Protein),
            TotalCarbs: entries.Sum(e => e.Carbs),
            TotalFat: entries.Sum(e => e.Fat));

        var goals = goal is null
            ? null
            : new GoalSnapshotDto(
                CaloriesTarget: goal.CaloriesTarget,
                ProteinTarget: (decimal)goal.ProteinGramsTarget,
                CarbsTarget: (decimal)goal.CarbohydratesGramsTarget,
                FatTarget: (decimal)goal.FatGramsTarget);

        return new DiaryDayDto(
            Date: date.ToString("yyyy-MM-dd"),
            MealGroups: mealGroups,
            DailySummary: summary,
            Goals: goals);
    }
}
