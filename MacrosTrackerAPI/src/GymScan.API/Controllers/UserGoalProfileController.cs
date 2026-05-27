using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.UserGoalProfile;
using GymScan.Services.Features.UserGoalProfile.Dtos.Requests;
using GymScan.Services.Features.UserGoalProfile.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

[AppAuthorize]
[Route("api/user-goal-profile")]
public sealed class UserGoalProfileController : ApiControllerBase
{
    private readonly IUserGoalProfileService _service;

    public UserGoalProfileController(IUserGoalProfileService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<GoalProfileDto>>> GetGoalProfile(CancellationToken cancellationToken)
    {
        var response = await _service.GetGoalProfileAsync(cancellationToken);
        return ToActionResult(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<GoalProfileDto>>> SaveGoalProfile(
        [FromBody] SetGoalProfileRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await _service.SaveGoalProfileAsync(request, cancellationToken);
        return ToActionResult(response);
    }

    [HttpPost("preview")]
    public async Task<ActionResult<ServiceResponse<GoalCalculationPreviewDto>>> PreviewCalculation(
        [FromBody] SetGoalProfileRequestDto request,
        CancellationToken cancellationToken)
    {
        var response = await _service.PreviewCalculationAsync(request, cancellationToken);
        return ToActionResult(response);
    }
}
