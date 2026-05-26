namespace GymScan.Services.Common.Models;

public sealed record CurrentRequestContext(Guid? UserId, string? IpAddress, string? UserAgent);
