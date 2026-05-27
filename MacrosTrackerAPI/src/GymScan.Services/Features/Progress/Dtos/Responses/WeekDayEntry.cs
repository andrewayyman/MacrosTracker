namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record WeekDayEntry(
    string Date,
    string DayName,
    decimal TotalCalories,
    int CaloriesTarget,
    bool HasData,
    string Status);
