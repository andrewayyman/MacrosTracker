using GymScan.Database.Entities.Auth;
using GymScan.Services.Features.Auth.Dtos.Responses;

namespace GymScan.Services.Features.Auth.Mappings;

public static class AuthMappingExtensions
{
    public static CurrentUserDto ToCurrentUserDto(this User user) =>
        new(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.SetupStatus.ToString(),
            true);

    public static AuthSessionDto ToAuthSessionDto(this User user, AccessTokenResult accessToken, IssuedRefreshSessionDto refreshSession) =>
        new(
            accessToken.Token,
            accessToken.ExpiresAtUtc,
            refreshSession.RefreshToken,
            refreshSession.ExpiresAtUtc,
            user.ToCurrentUserDto());
}
