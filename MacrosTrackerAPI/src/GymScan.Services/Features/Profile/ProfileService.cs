using GymScan.Database.Data;
using GymScan.Database.Entities.Auth;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.NutritionGoals.Mappings;
using GymScan.Services.Features.Profile.Dtos.Requests;
using GymScan.Services.Features.Profile.Dtos.Responses;
using GymScan.Services.Features.Profile.Mappings;
using GymScan.Services.Features.Profile.Validators;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.Profile;

public sealed class ProfileService : IProfileService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ProfileService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceResponse<ProfileDetailsDto>> GetProfileAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<ProfileDetailsDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<ProfileDetailsDto>.Failure("User account not found.", ["User not found."], 404);

        return ServiceResponse<ProfileDetailsDto>.Success(user.ToProfileDetailsDto(), "Profile loaded successfully.");
    }

    public async Task<ServiceResponse<ProfileDetailsDto>> UpsertProfileAsync(UpsertProfileRequestDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<ProfileDetailsDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var validation = await new UpsertProfileRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<ProfileDetailsDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<ProfileDetailsDto>.Failure("User account not found.", ["User not found."], 404);

        user.FirstName = request.FirstName.Trim();
        user.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        user.WeightKg = request.WeightKg;
        user.HeightCm = request.HeightCm;
        user.Age = request.Age;
        user.Gender = request.Gender;

        if (user.SetupStatus == SetupStatus.AccountCreated)
            user.SetupStatus = SetupStatus.ProfilePending;

        await _db.SaveChangesAsync(ct);

        return ServiceResponse<ProfileDetailsDto>.Success(user.ToProfileDetailsDto(), "Profile saved successfully.");
    }

    public async Task<ServiceResponse<SetupSummaryDto>> GetSetupSummaryAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<SetupSummaryDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<SetupSummaryDto>.Failure("User account not found.", ["User not found."], 404);

        var isProfileComplete = user.SetupStatus != SetupStatus.AccountCreated;
        var activeGoal = await _db.DailyNutritionGoals.AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId.Value && g.IsActive, ct);

        return ServiceResponse<SetupSummaryDto>.Success(new SetupSummaryDto(
            user.Id,
            user.SetupStatus.ToString(),
            isProfileComplete,
            activeGoal is not null,
            isProfileComplete ? user.ToProfileDetailsDto() : null,
            activeGoal?.ToDailyNutritionGoalDto()
        ), "Setup summary loaded successfully.");
    }
}
