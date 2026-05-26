using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GymScan.API.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public CurrentRequestContext GetCurrentContext()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userIdValue = httpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = Guid.TryParse(userIdValue, out var parsedUserId) ? parsedUserId : null;

        return new CurrentRequestContext(
            userId,
            httpContext?.Connection.RemoteIpAddress?.ToString(),
            httpContext?.Request.Headers.UserAgent.ToString());
    }
}
