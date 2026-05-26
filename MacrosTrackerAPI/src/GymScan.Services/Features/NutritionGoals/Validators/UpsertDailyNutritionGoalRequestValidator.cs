using FluentValidation;
using GymScan.Services.Features.NutritionGoals.Dtos.Requests;

namespace GymScan.Services.Features.NutritionGoals.Validators;

public sealed class UpsertDailyNutritionGoalRequestValidator : AbstractValidator<UpsertDailyNutritionGoalRequestDto>
{
    public UpsertDailyNutritionGoalRequestValidator()
    {
        RuleFor(x => x.CaloriesTarget)
            .InclusiveBetween(500, 10000)
            .WithMessage("Calories target must be between 500 and 10,000.");

        RuleFor(x => x.ProteinGramsTarget)
            .InclusiveBetween(1, 600)
            .WithMessage("Protein target must be between 1 and 600 grams.");

        RuleFor(x => x.CarbohydratesGramsTarget)
            .InclusiveBetween(1, 1000)
            .WithMessage("Carbohydrates target must be between 1 and 1,000 grams.");

        RuleFor(x => x.FatGramsTarget)
            .InclusiveBetween(1, 500)
            .WithMessage("Fat target must be between 1 and 500 grams.");

        RuleFor(x => x.GoalSource)
            .Must(g => g is null or "Suggested" or "Custom")
            .WithMessage("Goal source must be 'Suggested' or 'Custom'.");
    }
}
