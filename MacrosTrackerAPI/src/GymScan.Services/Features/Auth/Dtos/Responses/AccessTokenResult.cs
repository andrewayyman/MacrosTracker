namespace GymScan.Services.Features.Auth.Dtos.Responses;

public sealed record AccessTokenResult(string Token, DateTimeOffset ExpiresAtUtc);
