namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record DayStatusEntry(
    string Date,
    string Status,
    decimal TotalCalories);
