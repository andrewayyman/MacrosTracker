namespace GymScan.Database.Entities.Nutrition;

public sealed class LocalFoodItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string? AlternateNames { get; set; }

    public decimal CaloriesPer100g { get; set; }

    public decimal ProteinPer100g { get; set; }

    public decimal CarbsPer100g { get; set; }

    public decimal FatPer100g { get; set; }

    public decimal TypicalServingSizeGrams { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
