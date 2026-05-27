using GymScan.Services.Common.Models;
using GymScan.Services.Features.Diary.Dtos.Responses;

namespace GymScan.Services.Features.Diary;

public interface IDiaryService
{
    Task<ServiceResponse<DiaryDayDto>> GetDiaryDayAsync(DateOnly date);

    Task<ServiceResponse<object>> DeleteMealLogAsync(Guid id);
}
