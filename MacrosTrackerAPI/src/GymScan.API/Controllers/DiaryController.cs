using GymScan.API.Attributes;
using GymScan.API.Controllers.Base;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Diary;
using GymScan.Services.Features.Diary.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GymScan.API.Controllers;

[AppAuthorize]
[Route("api/[controller]")]
public sealed class DiaryController : ApiControllerBase
{
    private readonly IDiaryService _diaryService;

    public DiaryController(IDiaryService diaryService)
    {
        _diaryService = diaryService;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceResponse<DiaryDayDto>>> GetDiary([FromQuery] string? date = null)
    {
        DateOnly parsedDate;

        if (string.IsNullOrWhiteSpace(date))
        {
            parsedDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }
        else if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out parsedDate))
        {
            return BadRequest(ServiceResponse<object>.Failure(
                "Invalid date format. Use YYYY-MM-DD.",
                ["Invalid date format. Use YYYY-MM-DD."]));
        }

        var result = await _diaryService.GetDiaryDayAsync(parsedDate);
        return ToActionResult(result);
    }

    [HttpDelete("entries/{id:guid}")]
    public async Task<ActionResult<ServiceResponse<object>>> DeleteEntry(Guid id)
    {
        var result = await _diaryService.DeleteMealLogAsync(id);
        return ToActionResult(result);
    }
}
