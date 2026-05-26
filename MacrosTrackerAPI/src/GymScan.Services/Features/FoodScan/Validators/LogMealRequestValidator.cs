using FluentValidation;
using GymScan.Services.Features.FoodScan.Dtos.Requests;

namespace GymScan.Services.Features.FoodScan.Validators;

public sealed class LogMealRequestValidator : AbstractValidator<LogMealRequest>
{
    private static readonly string[] ValidMealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

    public LogMealRequestValidator()
    {
        RuleFor(r => r.FoodName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(r => r.Calories)
            .GreaterThanOrEqualTo(0);

        RuleFor(r => r.Protein)
            .GreaterThanOrEqualTo(0);

        RuleFor(r => r.Carbs)
            .GreaterThanOrEqualTo(0);

        RuleFor(r => r.Fat)
            .GreaterThanOrEqualTo(0);

        RuleFor(r => r.MealType)
            .NotEmpty()
            .Must(mt => ValidMealTypes.Contains(mt, StringComparer.OrdinalIgnoreCase))
            .WithMessage("MealType must be one of: Breakfast, Lunch, Dinner, Snack.");
    }
}
