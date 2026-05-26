using FluentValidation;
using GymScan.Services.Features.Auth.Dtos.Requests;

namespace GymScan.Services.Features.Auth.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(request => request.FirstName)
            .NotEmpty()
            .MaximumLength(120);

        RuleFor(request => request.LastName)
            .MaximumLength(120);

        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}
