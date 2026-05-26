using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.FoodScan;
using GymScan.Services.Features.FoodScan.Dtos.Requests;
using GymScan.Services.Features.FoodScan.Dtos.Responses;
using GymScan.Services.Features.FoodSearch;
using GymScan.Services.Features.FoodSearch.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

[AppAuthorize]
public sealed class FoodScanController : ApiControllerBase
{
    private readonly IFoodScanService _foodScanService;
    private readonly IFoodSearchService _foodSearchService;

    public FoodScanController(IFoodScanService foodScanService, IFoodSearchService foodSearchService)
    {
        _foodScanService = foodScanService;
        _foodSearchService = foodSearchService;
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FoodScanResultDto>>> Analyze([FromForm] IFormFile image)
    {
        var response = await _foodScanService.AnalyzeAsync(image);
        return ToActionResult(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MealLogDto>>> Log([FromBody] LogMealRequest request)
    {
        var response = await _foodScanService.LogMealAsync(request);
        return ToActionResult(response);
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<FoodSearchResultDto>>>> Search([FromQuery] string q)
    {
        var response = await _foodSearchService.SearchAsync(q);
        return ToActionResult(response);
    }
}
