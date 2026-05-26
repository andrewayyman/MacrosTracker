using GymScan.Services.Common.Models;
using GymScan.Services.Features.FoodSearch.Dtos.Responses;

namespace GymScan.Services.Features.FoodSearch;

public interface IFoodSearchService
{
    Task<ServiceResponse<List<FoodSearchResultDto>>> SearchAsync(string query);
}
