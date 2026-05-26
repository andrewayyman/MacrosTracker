namespace GymScan.Services.Features.Profile.Dtos.Responses;

public sealed record ProfileDetailsDto(
    string FirstName,
    string? LastName,
    double? WeightKg,
    double? HeightCm,
    int? Age,
    string? Gender,
    string SetupStatus);
