namespace GymScan.Services.Features.FoodSearch.Dtos.Responses;

public sealed record FoodSearchResultDto(
    Guid Id,
    string Name,
    decimal CaloriesPerServing,
    decimal ProteinPerServing,
    decimal CarbsPerServing,
    decimal FatPerServing,
    decimal ServingSizeGrams);
