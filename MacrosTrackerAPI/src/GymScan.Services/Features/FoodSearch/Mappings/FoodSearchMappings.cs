using GymScan.Database.Entities.Nutrition;
using GymScan.Services.Features.FoodSearch.Dtos.Responses;

namespace GymScan.Services.Features.FoodSearch.Mappings;

public static class FoodSearchMappings
{
    public static FoodSearchResultDto ToFoodSearchResultDto(this LocalFoodItem item)
    {
        var multiplier = item.TypicalServingSizeGrams / 100m;
        return new FoodSearchResultDto(
            Id: item.Id,
            Name: item.Name,
            CaloriesPerServing: Math.Round(item.CaloriesPer100g * multiplier, 1),
            ProteinPerServing: Math.Round(item.ProteinPer100g * multiplier, 1),
            CarbsPerServing: Math.Round(item.CarbsPer100g * multiplier, 1),
            FatPerServing: Math.Round(item.FatPer100g * multiplier, 1),
            ServingSizeGrams: item.TypicalServingSizeGrams);
    }
}
