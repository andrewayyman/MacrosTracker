using GymScan.Services.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers.Base;

[ApiController]
[Route("api/[controller]/[action]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected ActionResult<ServiceResponse<T>> ToActionResult<T>(ServiceResponse<T> response)
    {
        return StatusCode(response.StatusCode, response);
    }
}
