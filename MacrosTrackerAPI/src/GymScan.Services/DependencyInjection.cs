using GymScan.Services.Features.Auth;
using GymScan.Services.Features.Diary;
using GymScan.Services.Features.FoodScan;
using GymScan.Services.Features.FoodSearch;
using GymScan.Services.Features.NutritionGoals;
using GymScan.Services.Features.Profile;
using GymScan.Services.Security;
using Microsoft.Extensions.DependencyInjection;

namespace GymScan.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasherService, PasswordHasherService>();
        services.AddScoped<ITokenService, JwtTokenService>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<INutritionGoalService, NutritionGoalService>();
        services.AddScoped<IFoodScanService, FoodScanService>();
        services.AddScoped<IFoodSearchService, FoodSearchService>();
        services.AddScoped<IDiaryService, DiaryService>();

        return services;
    }
}
