using GymScan.Database.Data;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.FoodScan.Dtos.Requests;
using GymScan.Services.Features.FoodScan.Dtos.Responses;
using GymScan.Services.Features.FoodScan.Enums;
using GymScan.Services.Features.FoodScan.Mappings;
using GymScan.Services.Features.FoodScan.Validators;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.FoodScan;

public sealed class FoodScanService : IFoodScanService
{
    private readonly AppDbContext _db;
    private readonly IFoodVisionService _visionService;
    private readonly ICurrentUserService _currentUser;
    private readonly IWebHostEnvironment _env;

    public FoodScanService(AppDbContext db, IFoodVisionService visionService, ICurrentUserService currentUser, IWebHostEnvironment env)
    {
        _db = db;
        _visionService = visionService;
        _currentUser = currentUser;
        _env = env;
    }

    public async Task<ServiceResponse<FoodScanResultDto>> AnalyzeAsync(IFormFile image)
    {
        var validation = await new AnalyzeFoodRequestValidator().ValidateAsync(image);
        if (!validation.IsValid)
            return ServiceResponse<FoodScanResultDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<FoodScanResultDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var ext = Path.GetExtension(image.FileName)?.ToLowerInvariant() ?? ".jpg";
        if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";
        var fileName = $"{Guid.NewGuid()}{ext}";
        var relativePath = Path.Combine("uploads", "scans", fileName);
        var absolutePath = Path.Combine(_env.WebRootPath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);
        await using (var stream = new FileStream(absolutePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        FoodVisionResult aiResult;
        try
        {
            using var imageStream = image.OpenReadStream();
            aiResult = await _visionService.AnalyzeAsync(imageStream, image.ContentType ?? "image/jpeg");
        }
        catch
        {
            return ServiceResponse<FoodScanResultDto>.Failure("AI service is temporarily unavailable. Try searching manually instead.", statusCode: 503);
        }

        if (aiResult.ConfidencePercent == 0 && aiResult.Notes == "AI service unavailable")
            return ServiceResponse<FoodScanResultDto>.Failure("AI service is temporarily unavailable. Try searching manually instead.", statusCode: 503);

        var resultSource = ResultSource.AiEstimate;
        Guid? localFoodItemId = null;
        var calories = aiResult.Calories;
        var protein = aiResult.Protein;
        var carbs = aiResult.Carbs;
        var fat = aiResult.Fat;
        var servingSize = aiResult.ServingSizeGrams;
        var notes = aiResult.Notes;

        var localMatch = await _db.LocalFoodItems
            .AsNoTracking()
            .FirstOrDefaultAsync(f =>
                f.Name.Contains(aiResult.FoodName) ||
                (f.AlternateNames != null && f.AlternateNames.Contains(aiResult.FoodName)));

        if (localMatch is not null)
        {
            resultSource = ResultSource.Verified;
            localFoodItemId = localMatch.Id;
            var servingMultiplier = localMatch.TypicalServingSizeGrams / 100m;
            calories = localMatch.CaloriesPer100g * servingMultiplier;
            protein = localMatch.ProteinPer100g * servingMultiplier;
            carbs = localMatch.CarbsPer100g * servingMultiplier;
            fat = localMatch.FatPer100g * servingMultiplier;
            servingSize = localMatch.TypicalServingSizeGrams;
        }

        if (aiResult.ConfidencePercent < 40 && resultSource == ResultSource.AiEstimate)
            notes = "Low confidence — consider searching manually for more accurate results.";

        var scan = new Database.Entities.Nutrition.FoodScan
        {
            UserId = context.UserId.Value,
            ImagePath = relativePath.Replace('\\', '/'),
            FoodName = localMatch?.Name ?? aiResult.FoodName,
            Calories = calories,
            Protein = protein,
            Carbs = carbs,
            Fat = fat,
            ServingSizeGrams = servingSize,
            ResultSource = (int)resultSource,
            ConfidencePercent = resultSource == ResultSource.Verified ? null : aiResult.ConfidencePercent,
            Notes = notes,
            ScannedAt = DateTime.UtcNow
        };

        _db.FoodScans.Add(scan);
        await _db.SaveChangesAsync();

        var dto = new FoodScanResultDto(
            ScanId: scan.Id,
            FoodName: scan.FoodName,
            Calories: scan.Calories,
            Protein: scan.Protein,
            Carbs: scan.Carbs,
            Fat: scan.Fat,
            ServingSizeGrams: scan.ServingSizeGrams,
            ResultSource: resultSource.ToString(),
            ConfidencePercent: scan.ConfidencePercent,
            Notes: scan.Notes,
            LocalFoodItemId: localFoodItemId);

        return ServiceResponse<FoodScanResultDto>.Success(dto, "Food analyzed successfully.");
    }

    public async Task<ServiceResponse<MealLogDto>> LogMealAsync(LogMealRequest request)
    {
        var validation = await new LogMealRequestValidator().ValidateAsync(request);
        if (!validation.IsValid)
            return ServiceResponse<MealLogDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<MealLogDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        if (!Enum.TryParse<MealType>(request.MealType, true, out var mealType))
            return ServiceResponse<MealLogDto>.Failure("Invalid meal type.", [$"'{request.MealType}' is not a valid meal type."]);

        var mealLog = new Database.Entities.Nutrition.MealLog
        {
            UserId = context.UserId.Value,
            DiaryDate = DateOnly.FromDateTime(DateTime.UtcNow),
            MealType = (int)mealType,
            FoodName = request.FoodName,
            Calories = request.Calories,
            Protein = request.Protein,
            Carbs = request.Carbs,
            Fat = request.Fat,
            ServingSizeGrams = request.ServingSizeGrams,
            FoodScanId = request.FoodScanId,
            LocalFoodItemId = request.LocalFoodItemId,
            LoggedAt = DateTime.UtcNow
        };

        _db.MealLogs.Add(mealLog);
        await _db.SaveChangesAsync();

        return ServiceResponse<MealLogDto>.Success(mealLog.ToMealLogDto(), "Meal logged successfully.", 201);
    }
}
