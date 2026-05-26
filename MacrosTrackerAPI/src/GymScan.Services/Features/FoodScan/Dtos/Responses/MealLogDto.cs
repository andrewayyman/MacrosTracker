namespace GymScan.Services.Features.FoodScan.Dtos.Responses;

public sealed record MealLogDto(
    Guid Id,
    DateOnly DiaryDate,
    string MealType,
    string FoodName,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal? ServingSizeGrams,
    DateTime LoggedAt);
