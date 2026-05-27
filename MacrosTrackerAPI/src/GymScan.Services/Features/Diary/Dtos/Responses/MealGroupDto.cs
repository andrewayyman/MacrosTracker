namespace GymScan.Services.Features.Diary.Dtos.Responses;

public sealed record MealGroupDto(
    string MealType,
    IReadOnlyList<MealLogEntryDto> Entries,
    decimal GroupCalories);
