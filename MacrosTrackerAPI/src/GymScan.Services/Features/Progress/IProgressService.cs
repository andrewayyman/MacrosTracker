using GymScan.Services.Common.Models;
using GymScan.Services.Features.Progress.Dtos.Responses;

namespace GymScan.Services.Features.Progress;

public interface IProgressService
{
    Task<ServiceResponse<TrendResponseDto>> GetTrendsAsync(int rangeInDays);
    Task<ServiceResponse<StreakResponseDto>> GetStreaksAsync();
    Task<ServiceResponse<WeeklySummaryResponseDto>> GetWeeklySummaryAsync(DateOnly weekStart);
}
