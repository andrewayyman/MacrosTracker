using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace GymScan.Services.Features.FoodScan.Validators;

public sealed class AnalyzeFoodRequestValidator : AbstractValidator<IFormFile>
{
    private const long MaxFileSize = 10 * 1024 * 1024;

    private static readonly byte[][] ValidSignatures =
    [
        [0xFF, 0xD8, 0xFF],
        [0x89, 0x50, 0x4E, 0x47],
        [0x47, 0x49, 0x46, 0x38],
    ];

    private static readonly byte[] RiffHeader = [0x52, 0x49, 0x46, 0x46];
    private static readonly byte[] WebpMarker = [0x57, 0x45, 0x42, 0x50];

    public AnalyzeFoodRequestValidator()
    {
        RuleFor(file => file)
            .NotNull().WithMessage("An image file is required.");

        RuleFor(file => file.Length)
            .LessThanOrEqualTo(MaxFileSize).WithMessage("File size must not exceed 10 MB.");

        RuleFor(file => file)
            .Must(BeAValidImage).WithMessage("File type not supported. Upload a JPEG, PNG, WebP, or GIF image.");
    }

    private static bool BeAValidImage(IFormFile? file)
    {
        if (file is null || file.Length < 12)
            return false;

        Span<byte> header = stackalloc byte[12];
        using var stream = file.OpenReadStream();
        var bytesRead = stream.Read(header);
        if (bytesRead < 4)
            return false;

        foreach (var sig in ValidSignatures)
        {
            if (header[..sig.Length].SequenceEqual(sig))
                return true;
        }

        if (header[..4].SequenceEqual(RiffHeader) && bytesRead >= 12 && header[8..12].SequenceEqual(WebpMarker))
            return true;

        return false;
    }
}
