using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Profile;
using GymScan.Services.Features.Profile.Dtos.Requests;
using GymScan.Services.Features.Profile.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

public sealed class ProfileController : ApiControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [AppAuthorize]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<SetupSummaryDto>>> GetSetupSummary(CancellationToken cancellationToken)
    {
        var response = await _profileService.GetSetupSummaryAsync(cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<ProfileDetailsDto>>> GetProfile(CancellationToken cancellationToken)
    {
        var response = await _profileService.GetProfileAsync(cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ProfileDetailsDto>>> UpsertProfile([FromBody] UpsertProfileRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _profileService.UpsertProfileAsync(request, cancellationToken);
        return ToActionResult(response);
    }
}
