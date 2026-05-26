using GymScan.Services.Features.Auth.Dtos.Requests;
using GymScan.Services.Features.Auth.Dtos.Responses;
using GymScan.Services.Common.Models;

namespace GymScan.Services.Features.Auth;

public interface IAuthService
{
    Task<ServiceResponse<AuthSessionDto>> RegisterAsync(RegisterRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<AuthSessionDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<AuthSessionDto>> RefreshAsync(RefreshRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<MessageDto>> LogoutAsync(LogoutRequestDto request, CancellationToken ct = default);
    Task<ServiceResponse<CurrentUserDto>> GetCurrentUserAsync(CancellationToken ct = default);
}
