using GymScan.Database.Data;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Features.Diary.Dtos.Responses;
using GymScan.Services.Features.Diary.Mappings;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Services.Features.Diary;

public sealed class DiaryService : IDiaryService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DiaryService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ServiceResponse<DiaryDayDto>> GetDiaryDayAsync(DateOnly date)
    {
        if (date > DateOnly.FromDateTime(DateTime.UtcNow))
            return ServiceResponse<DiaryDayDto>.Failure("Date cannot be in the future.", ["Date cannot be in the future."], 400);

        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<DiaryDayDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var userId = context.UserId.Value;

        var entries = await _db.MealLogs
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.DiaryDate == date)
            .OrderBy(m => m.LoggedAt)
            .ToListAsync();

        var goal = await _db.DailyNutritionGoals
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.UserId == userId && g.IsActive);

        var dto = DiaryMappings.BuildDiaryDayDto(date, entries, goal);

        return ServiceResponse<DiaryDayDto>.Success(dto, string.Empty);
    }

    public async Task<ServiceResponse<object>> DeleteMealLogAsync(Guid id)
    {
        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<object>.Failure("Unauthorized.", ["Authentication required."], 401);

        var userId = context.UserId.Value;

        var entry = await _db.MealLogs
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);

        if (entry is null)
            return ServiceResponse<object>.Failure("Meal log entry not found.", ["Meal log entry not found."], 404);

        entry.IsDeleted = true;
        entry.DeletedAtUtc = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();

        return ServiceResponse<object>.Success(null, string.Empty, 204);
    }
}
