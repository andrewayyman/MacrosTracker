namespace GymScan.Services.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Secret { get; init; } = string.Empty;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public int ExpiryMinutes { get; init; } = 60;

    public int RefreshTokenExpiryDays { get; init; } = 7;
}
