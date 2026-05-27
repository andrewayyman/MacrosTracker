namespace GymScan.Services.Features.Progress.Dtos.Responses;

public sealed record TrendDayDto(
    string Date,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    bool HasData);
