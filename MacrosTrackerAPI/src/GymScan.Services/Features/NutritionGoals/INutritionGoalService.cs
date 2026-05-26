using GymScan.Services.Common.Models;
using GymScan.Services.Features.NutritionGoals.Dtos.Requests;
using GymScan.Services.Features.NutritionGoals.Dtos.Responses;

namespace GymScan.Services.Features.NutritionGoals;

public interface INutritionGoalService
{
    Task<ServiceResponse<DailyNutritionGoalDto>> GetDailyGoalAsync(CancellationToken ct = default);
    Task<ServiceResponse<SuggestedGoalDto>> GetSuggestedGoalAsync(CancellationToken ct = default);
    Task<ServiceResponse<DailyNutritionGoalDto>> UpsertDailyGoalAsync(UpsertDailyNutritionGoalRequestDto request, CancellationToken ct = default);
}
