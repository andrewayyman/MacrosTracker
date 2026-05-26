using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.NutritionGoals;
using GymScan.Services.Features.NutritionGoals.Dtos.Requests;
using GymScan.Services.Features.NutritionGoals.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

public sealed class NutritionGoalsController : ApiControllerBase
{
    private readonly INutritionGoalService _nutritionGoalService;

    public NutritionGoalsController(INutritionGoalService nutritionGoalService)
    {
        _nutritionGoalService = nutritionGoalService;
    }

    [AppAuthorize]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<DailyNutritionGoalDto>>> GetDailyGoal(CancellationToken cancellationToken)
    {
        var response = await _nutritionGoalService.GetDailyGoalAsync(cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<SuggestedGoalDto>>> GetSuggestedGoal(CancellationToken cancellationToken)
    {
        var response = await _nutritionGoalService.GetSuggestedGoalAsync(cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<DailyNutritionGoalDto>>> UpsertDailyGoal([FromBody] UpsertDailyNutritionGoalRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _nutritionGoalService.UpsertDailyGoalAsync(request, cancellationToken);
        return ToActionResult(response);
    }
}
