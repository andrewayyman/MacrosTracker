using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Nutrition;

namespace GymScan.Database.Entities.Auth;

public sealed class User : AuditableEntity
{
    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public SetupStatus SetupStatus { get; set; } = SetupStatus.AccountCreated;

    public double? WeightKg { get; set; }

    public double? HeightCm { get; set; }

    public int? Age { get; set; }

    public string? Gender { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<RefreshSession> RefreshSessions { get; set; } = new List<RefreshSession>();

    public DailyNutritionGoal? ActiveDailyNutritionGoal { get; set; }
}
