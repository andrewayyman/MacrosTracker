namespace GymScan.Services.Features.Auth.Dtos.Responses;

public sealed record IssuedRefreshSessionDto(string RefreshToken, DateTimeOffset ExpiresAtUtc);
