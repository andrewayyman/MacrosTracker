namespace GymScan.Services.Features.Auth.Dtos.Responses;

public sealed record CurrentUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string? LastName,
    string SetupStatus,
    bool IsAuthenticated);
