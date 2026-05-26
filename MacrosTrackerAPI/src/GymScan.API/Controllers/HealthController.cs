using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

[Route("api/[controller]")]
public sealed class HealthController : ApiControllerBase
{
    [HttpGet]
    public ActionResult<ServiceResponse<object>> Get()
    {
        var response = ServiceResponse<object>.Success(
            new { status = "ok", timestamp = DateTimeOffset.UtcNow },
            "API is healthy.");

        return ToActionResult(response);
    }
}
