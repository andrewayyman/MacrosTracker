namespace GymScan.Services.Features.Profile.Dtos.Requests;

public sealed record UpsertProfileRequestDto(
    string FirstName,
    string? LastName,
    double WeightKg,
    double HeightCm,
    int Age,
    string Gender);
