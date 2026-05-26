using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Auth;

namespace GymScan.Database.Entities.Nutrition;

public sealed class MealLog : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public DateOnly DiaryDate { get; set; }

    public int MealType { get; set; }

    public string FoodName { get; set; } = string.Empty;

    public decimal Calories { get; set; }

    public decimal Protein { get; set; }

    public decimal Carbs { get; set; }

    public decimal Fat { get; set; }

    public decimal? ServingSizeGrams { get; set; }

    public Guid? FoodScanId { get; set; }

    public FoodScan? FoodScan { get; set; }

    public Guid? LocalFoodItemId { get; set; }

    public LocalFoodItem? LocalFoodItem { get; set; }

    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }

    public DateTimeOffset? DeletedAtUtc { get; set; }
}
