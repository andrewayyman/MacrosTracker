using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Auth;

namespace GymScan.Database.Entities.Nutrition;

public sealed class FoodScan : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string ImagePath { get; set; } = string.Empty;

    public string FoodName { get; set; } = string.Empty;

    public decimal Calories { get; set; }

    public decimal Protein { get; set; }

    public decimal Carbs { get; set; }

    public decimal Fat { get; set; }

    public decimal? ServingSizeGrams { get; set; }

    public int ResultSource { get; set; }

    public int? ConfidencePercent { get; set; }

    public string? Notes { get; set; }

    public DateTime ScannedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }

    public DateTimeOffset? DeletedAtUtc { get; set; }
}
