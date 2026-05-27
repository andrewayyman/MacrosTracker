namespace GymScan.Services.Features.Diary.Dtos.Responses;

public sealed record DailySummaryDto(
    decimal TotalCalories,
    decimal TotalProtein,
    decimal TotalCarbs,
    decimal TotalFat);
