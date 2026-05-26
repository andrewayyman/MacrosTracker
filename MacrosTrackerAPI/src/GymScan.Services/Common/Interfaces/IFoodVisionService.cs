namespace GymScan.Services.Common.Interfaces;

public interface IFoodVisionService
{
    Task<FoodVisionResult> AnalyzeAsync(Stream imageStream, string mimeType);
}

public sealed record FoodVisionResult(
    string FoodName,
    decimal Calories,
    decimal Protein,
    decimal Carbs,
    decimal Fat,
    decimal? ServingSizeGrams,
    int ConfidencePercent,
    string? Notes);
