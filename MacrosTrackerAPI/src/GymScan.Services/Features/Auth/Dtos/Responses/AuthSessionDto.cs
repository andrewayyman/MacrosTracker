namespace GymScan.Services.Features.Auth.Dtos.Responses;

public sealed record AuthSessionDto(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc,
    CurrentUserDto User);
