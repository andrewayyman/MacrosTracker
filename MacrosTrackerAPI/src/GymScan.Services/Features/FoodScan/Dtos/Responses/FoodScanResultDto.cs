namespace GymScan.Services.Features.FoodScan.Dtos.Responses;

public sealed record FoodScanResultDto(
    Guid ScanId,
    string FoodName,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal? ServingSizeGrams,
    string ResultSource,
    int? ConfidencePercent,
    string? Notes,
    Guid? LocalFoodItemId);
