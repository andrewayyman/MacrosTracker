using FluentValidation;
using GymScan.Services.Features.Auth.Dtos.Requests;

namespace GymScan.Services.Features.Auth.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(request => request.Password)
            .NotEmpty();
    }
}
