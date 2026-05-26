using FluentValidation;
using GymScan.Services.Features.Auth.Dtos.Requests;

namespace GymScan.Services.Features.Auth.Validators;

public sealed class RefreshRequestValidator : AbstractValidator<RefreshRequestDto>
{
    public RefreshRequestValidator()
    {
        RuleFor(request => request.RefreshToken)
            .NotEmpty();
    }
}
