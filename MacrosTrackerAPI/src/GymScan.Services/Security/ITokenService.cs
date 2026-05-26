using GymScan.Database.Entities.Auth;
using GymScan.Services.Features.Auth.Dtos.Responses;

namespace GymScan.Services.Security;

public interface ITokenService
{
    AccessTokenResult CreateAccessToken(User user);
}
