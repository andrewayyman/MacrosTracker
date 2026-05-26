using GymScan.Services.Common.Models;
using GymScan.Services.Features.FoodScan.Dtos.Requests;
using GymScan.Services.Features.FoodScan.Dtos.Responses;
using Microsoft.AspNetCore.Http;

namespace GymScan.Services.Features.FoodScan;

public interface IFoodScanService
{
    Task<ServiceResponse<FoodScanResultDto>> AnalyzeAsync(IFormFile image);

    Task<ServiceResponse<MealLogDto>> LogMealAsync(LogMealRequest request);
}
