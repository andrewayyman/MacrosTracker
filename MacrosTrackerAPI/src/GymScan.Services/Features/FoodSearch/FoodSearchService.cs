using GymScan.Database.Data;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.FoodSearch.Dtos.Responses;
using GymScan.Services.Features.FoodSearch.Mappings;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.FoodSearch;

public sealed class FoodSearchService : IFoodSearchService
{
    private readonly AppDbContext _db;

    public FoodSearchService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResponse<List<FoodSearchResultDto>>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return ServiceResponse<List<FoodSearchResultDto>>.Failure("Search query is required.", ["Query cannot be empty."]);

        var trimmed = query.Trim();

        var results = await _db.LocalFoodItems
            .AsNoTracking()
            .Where(f => f.Name.Contains(trimmed) || (f.AlternateNames != null && f.AlternateNames.Contains(trimmed)))
            .Take(20)
            .ToListAsync();

        var dtos = results.Select(f => f.ToFoodSearchResultDto()).ToList();

        return ServiceResponse<List<FoodSearchResultDto>>.Success(dtos, $"Found {dtos.Count} result(s).");
    }

    public async Task<ServiceResponse<List<RecentFoodDto>>> GetRecentFoodsAsync(Guid userId)
    {
        var cutoff = DateTime.UtcNow.AddDays(-30);

        var logs = await _db.MealLogs
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.LocalFoodItemId != null && m.LoggedAt >= cutoff)
            .Include(m => m.LocalFoodItem)
            .OrderByDescending(m => m.LoggedAt)
            .ToListAsync();

        var dtos = logs
            .GroupBy(m => m.LocalFoodItemId)
            .Select(g => g.First())
            .Take(10)
            .Where(m => m.LocalFoodItem != null)
            .Select(m => m.LocalFoodItem!.ToRecentFoodDto(m.ServingSizeGrams ?? m.LocalFoodItem!.TypicalServingSizeGrams))
            .ToList();

        return ServiceResponse<List<RecentFoodDto>>.Success(dtos, $"Found {dtos.Count} recent food(s).");
    }
}
