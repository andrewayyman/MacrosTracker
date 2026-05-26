using FluentValidation;
using GymScan.Services.Features.Profile.Dtos.Requests;

namespace GymScan.Services.Features.Profile.Validators;

public sealed class UpsertProfileRequestValidator : AbstractValidator<UpsertProfileRequestDto>
{
    public UpsertProfileRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(x => x.LastName)
            .MaximumLength(120);

        RuleFor(x => x.WeightKg)
            .InclusiveBetween(20, 400)
            .WithMessage("Weight must be between 20 and 400 kg.");

        RuleFor(x => x.HeightCm)
            .InclusiveBetween(60, 300)
            .WithMessage("Height must be between 60 and 300 cm.");

        RuleFor(x => x.Age)
            .InclusiveBetween(13, 120)
            .WithMessage("Age must be between 13 and 120.");

        RuleFor(x => x.Gender)
            .NotEmpty()
            .Must(g => g is "Male" or "Female")
            .WithMessage("Gender must be 'Male' or 'Female'.");
    }
}
