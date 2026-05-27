using GymScan.Database.Data;
using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.UserGoalProfile.Dtos.Requests;
using GymScan.Services.Features.UserGoalProfile.Dtos.Responses;
using GymScan.Services.Features.UserGoalProfile.Mappings;
using GymScan.Services.Features.UserGoalProfile.Validators;
using Microsoft.EntityFrameworkCore;
using ProfileEntity = GymScan.Database.Entities.Nutrition.UserGoalProfile;

namespace GymScan.Services.Features.UserGoalProfile;

public sealed class UserGoalProfileService : IUserGoalProfileService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UserGoalProfileService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceResponse<GoalProfileDto>> GetGoalProfileAsync(CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<GoalProfileDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var profile = await _db.UserGoalProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId.Value, ct);

        if (profile is null)
            return ServiceResponse<GoalProfileDto>.Failure("No goal profile found.", ["Goal profile not found."], 404);

        return ServiceResponse<GoalProfileDto>.Success(profile.ToGoalProfileDto(), "Goal profile loaded successfully.");
    }

    public async Task<ServiceResponse<GoalProfileDto>> SaveGoalProfileAsync(SetGoalProfileRequestDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<GoalProfileDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var validation = await new SetGoalProfileRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<GoalProfileDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value, ct);
        if (user is null)
            return ServiceResponse<GoalProfileDto>.Failure("User account not found.", ["User not found."], 404);

        var activityLevel = Enum.Parse<ActivityLevel>(request.ActivityLevel);
        var goalType = Enum.Parse<GoalType>(request.GoalType);
        var calculation = Calculate(request.BiologicalSex, request.AgeYears, request.WeightKg, request.HeightCm, activityLevel, goalType);

        var existingProfile = await _db.UserGoalProfiles.FirstOrDefaultAsync(p => p.UserId == userId.Value, ct);
        if (existingProfile is null)
        {
            existingProfile = new ProfileEntity
            {
                UserId = userId.Value
            };
            _db.UserGoalProfiles.Add(existingProfile);
        }

        existingProfile.BiologicalSex = request.BiologicalSex;
        existingProfile.AgeYears = request.AgeYears;
        existingProfile.WeightKg = request.WeightKg;
        existingProfile.HeightCm = request.HeightCm;
        existingProfile.ActivityLevel = activityLevel;
        existingProfile.GoalType = goalType;
        existingProfile.CalculatedBmr = calculation.CalculatedBmr;
        existingProfile.CalculatedTdee = calculation.CalculatedTdee;
        existingProfile.CalorieAdjustment = calculation.CalorieAdjustment;
        existingProfile.DailyCaloriesTarget = calculation.DailyCaloriesTarget;
        existingProfile.DailyProteinGrams = calculation.DailyProteinGrams;
        existingProfile.DailyCarbsGrams = calculation.DailyCarbsGrams;
        existingProfile.DailyFatGrams = calculation.DailyFatGrams;
        existingProfile.IsCalorieMinimumApplied = calculation.IsCalorieMinimumApplied;
        existingProfile.UpdatedAtUtc = DateTimeOffset.UtcNow;

        var existingDailyGoals = await _db.DailyNutritionGoals
            .Where(g => g.UserId == userId.Value && g.IsActive)
            .ToListAsync(ct);
        foreach (var g in existingDailyGoals)
            g.IsActive = false;

        _db.DailyNutritionGoals.Add(new DailyNutritionGoal
        {
            UserId = userId.Value,
            CaloriesTarget = calculation.DailyCaloriesTarget,
            ProteinGramsTarget = calculation.DailyProteinGrams,
            CarbohydratesGramsTarget = calculation.DailyCarbsGrams,
            FatGramsTarget = calculation.DailyFatGrams,
            GoalSource = GoalSource.Suggested,
            IsActive = true
        });

        if (user.SetupStatus == SetupStatus.ProfilePending)
            user.SetupStatus = SetupStatus.ProfileCompleted;

        await _db.SaveChangesAsync(ct);

        var message = calculation.IsCalorieMinimumApplied
            ? $"Goal profile saved. Your calorie target has been raised to the safe minimum of {calculation.DailyCaloriesTarget} kcal/day."
            : "Goal profile saved successfully.";

        return ServiceResponse<GoalProfileDto>.Success(existingProfile.ToGoalProfileDto(), message);
    }

    public async Task<ServiceResponse<GoalCalculationPreviewDto>> PreviewCalculationAsync(SetGoalProfileRequestDto request, CancellationToken ct = default)
    {
        var userId = _currentUser.GetCurrentContext().UserId;
        if (userId is null)
            return ServiceResponse<GoalCalculationPreviewDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var validation = await new SetGoalProfileRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<GoalCalculationPreviewDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var activityLevel = Enum.Parse<ActivityLevel>(request.ActivityLevel);
        var goalType = Enum.Parse<GoalType>(request.GoalType);
        var calculation = Calculate(request.BiologicalSex, request.AgeYears, request.WeightKg, request.HeightCm, activityLevel, goalType);

        return ServiceResponse<GoalCalculationPreviewDto>.Success(calculation, "Calculation preview ready.");
    }

    private static GoalCalculationPreviewDto Calculate(
        string sex,
        int ageYears,
        double weightKg,
        double heightCm,
        ActivityLevel activity,
        GoalType goal)
    {
        // Step 1 — BMR (Mifflin-St Jeor)
        var bmr = sex == "Female"
            ? 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161
            : 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
        bmr = Math.Round(bmr, 2);

        // Step 2 — TDEE
        var multiplier = activity switch
        {
            ActivityLevel.Sedentary => 1.2,
            ActivityLevel.LightlyActive => 1.375,
            ActivityLevel.ModeratelyActive => 1.55,
            ActivityLevel.VeryActive => 1.725,
            ActivityLevel.ExtraActive => 1.9,
            _ => 1.2
        };
        var tdee = Math.Round(bmr * multiplier, 2);

        // Step 3 — Calorie adjustment by goal
        var adjustment = goal switch
        {
            GoalType.LoseWeightSlow => -250,
            GoalType.LoseWeightModerate => -500,
            GoalType.LoseWeightAggressive => -750,
            GoalType.Maintain => 0,
            GoalType.GainMuscleLean => 250,
            GoalType.GainMuscleStandard => 500,
            _ => 0
        };
        var rawCalories = tdee + adjustment;

        // Step 4 — Safe floor
        var floor = sex == "Male" ? 1500 : 1200;
        int dailyCalories;
        bool minimumApplied;
        if (rawCalories < floor)
        {
            dailyCalories = floor;
            minimumApplied = true;
        }
        else
        {
            dailyCalories = (int)Math.Round(rawCalories);
            minimumApplied = false;
        }

        // Step 5 — Protein
        var proteinMultiplier = goal switch
        {
            GoalType.Maintain => 1.6,
            GoalType.LoseWeightSlow or GoalType.LoseWeightModerate or GoalType.LoseWeightAggressive => 2.0,
            GoalType.GainMuscleLean or GoalType.GainMuscleStandard => 2.2,
            _ => 1.6
        };
        var proteinGrams = Math.Round(weightKg * proteinMultiplier, 1);

        // Step 6 — Fat (30% calories, min 0.5 g/kg)
        var fatFromCalories = Math.Round(dailyCalories * 0.30 / 9, 1);
        var fatFromBodyweight = Math.Round(weightKg * 0.5, 1);
        var fatGrams = Math.Max(fatFromCalories, fatFromBodyweight);

        // Step 7 — Carbs (remainder, clamped >= 0)
        var carbsCalories = dailyCalories - proteinGrams * 4 - fatGrams * 9;
        var carbsGrams = Math.Round(carbsCalories / 4, 1);
        if (carbsGrams < 0) carbsGrams = 0;

        return new GoalCalculationPreviewDto(
            bmr,
            tdee,
            adjustment,
            dailyCalories,
            proteinGrams,
            carbsGrams,
            fatGrams,
            minimumApplied);
    }
}
