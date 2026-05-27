using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Progress;
using GymScan.Services.Features.Progress.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

[AppAuthorize]
[Route("api/[controller]")]
public sealed class ProgressController : ApiControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("trends")]
    public async Task<ActionResult<ServiceResponse<TrendResponseDto>>> GetTrends([FromQuery] int range = 7)
    {
        var result = await _progressService.GetTrendsAsync(range);
        return ToActionResult(result);
    }

    [HttpGet("streaks")]
    public async Task<ActionResult<ServiceResponse<StreakResponseDto>>> GetStreaks()
    {
        var result = await _progressService.GetStreaksAsync();
        return ToActionResult(result);
    }

    [HttpGet("weekly")]
    public async Task<ActionResult<ServiceResponse<WeeklySummaryResponseDto>>> GetWeekly([FromQuery] string? weekStart = null)
    {
        DateOnly parsedWeekStart;

        if (string.IsNullOrWhiteSpace(weekStart))
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            parsedWeekStart = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));
        }
        else if (!DateOnly.TryParseExact(weekStart, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out parsedWeekStart))
        {
            return BadRequest(ServiceResponse<object>.Failure(
                "Invalid date format. Use YYYY-MM-DD.",
                ["Invalid date format. Use YYYY-MM-DD."]));
        }

        var result = await _progressService.GetWeeklySummaryAsync(parsedWeekStart);
        return ToActionResult(result);
    }
}
