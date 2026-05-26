using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Auth;
using GymScan.Services.Features.Auth.Dtos.Requests;
using GymScan.Services.Features.Auth.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

public sealed class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AuthSessionDto>>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return ToActionResult(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AuthSessionDto>>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return ToActionResult(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AuthSessionDto>>> Refresh([FromBody] RefreshRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.RefreshAsync(request, cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MessageDto>>> Logout([FromBody] LogoutRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.LogoutAsync(request, cancellationToken);
        return ToActionResult(response);
    }

    [AppAuthorize]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<CurrentUserDto>>> Me(CancellationToken cancellationToken)
    {
        var response = await _authService.GetCurrentUserAsync(cancellationToken);
        return ToActionResult(response);
    }
}
