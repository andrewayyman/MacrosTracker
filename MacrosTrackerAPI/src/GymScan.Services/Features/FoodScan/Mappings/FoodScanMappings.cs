using GymScan.Services.Features.FoodScan.Dtos.Responses;
using GymScan.Services.Features.FoodScan.Enums;

namespace GymScan.Services.Features.FoodScan.Mappings;

public static class FoodScanMappings
{
    public static FoodScanResultDto ToFoodScanResultDto(this Database.Entities.Nutrition.FoodScan entity) =>
        new(
            ScanId: entity.Id,
            FoodName: entity.FoodName,
            Calories: entity.Calories,
            Protein: entity.Protein,
            Carbs: entity.Carbs,
            Fat: entity.Fat,
            ServingSizeGrams: entity.ServingSizeGrams,
            ResultSource: ((ResultSource)entity.ResultSource).ToString(),
            ConfidencePercent: entity.ConfidencePercent,
            Notes: entity.Notes,
            LocalFoodItemId: null);

    public static MealLogDto ToMealLogDto(this Database.Entities.Nutrition.MealLog entity) =>
        new(
            Id: entity.Id,
            DiaryDate: entity.DiaryDate,
            MealType: ((MealType)entity.MealType).ToString(),
            FoodName: entity.FoodName,
            Calories: entity.Calories,
            Protein: entity.Protein,
            Carbs: entity.Carbs,
            Fat: entity.Fat,
            ServingSizeGrams: entity.ServingSizeGrams,
            LoggedAt: entity.LoggedAt);
}
