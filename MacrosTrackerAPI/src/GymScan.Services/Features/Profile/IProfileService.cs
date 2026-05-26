using GymScan.Services.Common.Models;
using GymScan.Services.Features.Profile.Dtos.Requests;
using GymScan.Services.Features.Profile.Dtos.Responses;

namespace GymScan.Services.Features.Profile;

public interface IProfileService
{
    Task<ServiceResponse<ProfileDetailsDto>> GetProfileAsync(CancellationToken ct = default);
    Task<ServiceResponse<ProfileDetailsDto>> UpsertProfileAsync(UpsertProfileRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<SetupSummaryDto>> GetSetupSummaryAsync(CancellationToken ct = default);
}
