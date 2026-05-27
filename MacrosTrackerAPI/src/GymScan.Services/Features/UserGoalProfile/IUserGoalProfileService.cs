using GymScan.Services.Common.Models;
using GymScan.Services.Features.UserGoalProfile.Dtos.Requests;
using GymScan.Services.Features.UserGoalProfile.Dtos.Responses;

namespace GymScan.Services.Features.UserGoalProfile;

public interface IUserGoalProfileService
{
    Task<ServiceResponse<GoalProfileDto>> GetGoalProfileAsync(CancellationToken ct = default);
    Task<ServiceResponse<GoalProfileDto>> SaveGoalProfileAsync(SetGoalProfileRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<GoalCalculationPreviewDto>> PreviewCalculationAsync(SetGoalProfileRequestDto request, CancellationToken ct = default);
}
