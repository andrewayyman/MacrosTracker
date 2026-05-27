using FluentValidation;
using GymScan.Services.Features.UserGoalProfile.Dtos.Requests;
using DbEnums = GymScan.Database.Entities.Nutrition;

namespace GymScan.Services.Features.UserGoalProfile.Validators;

public sealed class SetGoalProfileRequestValidator : AbstractValidator<SetGoalProfileRequestDto>
{
    public SetGoalProfileRequestValidator()
    {
        RuleFor(x => x.BiologicalSex)
            .Must(s => s is "Male" or "Female")
            .WithMessage("Biological sex must be 'Male' or 'Female'.");

        RuleFor(x => x.AgeYears)
            .InclusiveBetween(15, 100)
            .WithMessage("Age must be between 15 and 100.");

        RuleFor(x => x.WeightKg)
            .InclusiveBetween(30.0, 350.0)
            .WithMessage("Weight must be between 30 and 350 kg.");

        RuleFor(x => x.HeightCm)
            .InclusiveBetween(100.0, 250.0)
            .WithMessage("Height must be between 100 and 250 cm.");

        RuleFor(x => x.ActivityLevel)
            .Must(s => Enum.TryParse<DbEnums.ActivityLevel>(s, ignoreCase: false, out _))
            .WithMessage("Activity level must be one of: Sedentary, LightlyActive, ModeratelyActive, VeryActive, ExtraActive.");

        RuleFor(x => x.GoalType)
            .Must(s => Enum.TryParse<DbEnums.GoalType>(s, ignoreCase: false, out _))
            .WithMessage("Goal type must be one of: LoseWeightSlow, LoseWeightModerate, LoseWeightAggressive, Maintain, GainMuscleLean, GainMuscleStandard.");
    }
}
