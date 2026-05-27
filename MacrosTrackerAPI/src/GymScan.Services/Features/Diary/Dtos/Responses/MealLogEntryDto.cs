namespace GymScan.Services.Features.Diary.Dtos.Responses;

public sealed record MealLogEntryDto(
    Guid Id,
    string FoodName,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal? ServingSizeGrams,
    string LoggedAt);
