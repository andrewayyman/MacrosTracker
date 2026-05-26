using GymScan.Database.Data;
using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.NutritionGoals.Dtos.Requests;
using GymScan.Services.Features.NutritionGoals.Dtos.Responses;
using GymScan.Services.Features.NutritionGoals.Mappings;
using GymScan.Services.Features.NutritionGoals.Validators;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.NutritionGoals;

public sealed class NutritionGoalService : INutritionGoalService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public NutritionGoalService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceResponse<DailyNutritionGoalDto>> GetDailyGoalAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var goal = await _db.DailyNutritionGoals.AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId.Value && g.IsActive, ct);

        if (goal is null)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("No active daily goal found.", ["Goal not found."], 404);

        return ServiceResponse<DailyNutritionGoalDto>.Success(goal.ToDailyNutritionGoalDto(), "Daily goal loaded successfully.");
    }

    public async Task<ServiceResponse<SuggestedGoalDto>> GetSuggestedGoalAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<SuggestedGoalDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<SuggestedGoalDto>.Failure("User account not found.", ["User not found."], 404);

        if (user.SetupStatus == SetupStatus.AccountCreated)
            return ServiceResponse<SuggestedGoalDto>.Failure("Profile must be completed before calculating a suggested goal.", ["Complete your profile first."], 400);

        return ServiceResponse<SuggestedGoalDto>.Success(CalculateSuggestedGoal(user), "Suggested goal calculated successfully.");
    }

    public async Task<ServiceResponse<DailyNutritionGoalDto>> UpsertDailyGoalAsync(UpsertDailyNutritionGoalRequestDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var validation = await new UpsertDailyNutritionGoalRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("User account not found.", ["User not found."], 404);

        if (user.SetupStatus == SetupStatus.AccountCreated)
            return ServiceResponse<DailyNutritionGoalDto>.Failure("Profile must be completed before setting nutrition goals.", ["Complete your profile first."], 400);

        var existingGoals = await _db.DailyNutritionGoals
            .Where(g => g.UserId == userId.Value && g.IsActive)
            .ToListAsync(ct);
        foreach (var g in existingGoals)
            g.IsActive = false;

        var goalSource = request.GoalSource is "Custom" ? GoalSource.Custom : GoalSource.Suggested;
        var goal = new DailyNutritionGoal
        {
            UserId = userId.Value,
            CaloriesTarget = request.CaloriesTarget,
            ProteinGramsTarget = request.ProteinGramsTarget,
            CarbohydratesGramsTarget = request.CarbohydratesGramsTarget,
            FatGramsTarget = request.FatGramsTarget,
            GoalSource = goalSource,
            IsActive = true
        };
        _db.DailyNutritionGoals.Add(goal);

        if (user.SetupStatus == SetupStatus.ProfilePending)
            user.SetupStatus = SetupStatus.ProfileCompleted;

        await _db.SaveChangesAsync(ct);

        return ServiceResponse<DailyNutritionGoalDto>.Success(goal.ToDailyNutritionGoalDto(), "Daily goal saved successfully.");
    }

    private static SuggestedGoalDto CalculateSuggestedGoal(User user)
    {
        var weightKg = user.WeightKg ?? 70;
        var bmr = user.Gender == "Female"
            ? 10 * weightKg + 6.25 * (user.HeightCm ?? 170) - 5 * (user.Age ?? 25) - 161
            : 10 * weightKg + 6.25 * (user.HeightCm ?? 170) - 5 * (user.Age ?? 25) + 5;

        var calories = (int)Math.Round(bmr * 1.55);
        var protein = Math.Round(weightKg * 2.0, 1);
        var fat = Math.Round(calories * 0.25 / 9, 1);
        var carbs = Math.Round((calories - protein * 4 - fat * 9) / 4, 1);

        return new SuggestedGoalDto(calories, protein, carbs, fat);
    }
}
