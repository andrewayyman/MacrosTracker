namespace GymScan.Services.Features.Auth.Dtos.Requests;

public sealed record RegisterRequestDto(string FirstName, string? LastName, string Email, string Password);
