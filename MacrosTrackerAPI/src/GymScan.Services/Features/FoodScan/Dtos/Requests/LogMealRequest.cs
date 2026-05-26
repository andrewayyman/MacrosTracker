namespace GymScan.Services.Features.FoodScan.Dtos.Requests;

public sealed record LogMealRequest(
    string FoodName,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal? ServingSizeGrams,
    string MealType,
    Guid? FoodScanId,
    Guid? LocalFoodItemId);
