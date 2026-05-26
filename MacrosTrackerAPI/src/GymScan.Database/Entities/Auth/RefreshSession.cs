using GymScan.Database.Abstractions;

namespace GymScan.Database.Entities.Auth;

public sealed class RefreshSession : AuditableEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;

    public DateTimeOffset ExpiresAtUtc { get; set; }

    public DateTimeOffset? RevokedAtUtc { get; set; }

    public DateTimeOffset? LastUsedAtUtc { get; set; }

    public string? CreatedByIp { get; set; }

    public string? UserAgent { get; set; }
}
