using GymScan.Database.Data;
using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;

namespace GymScan.Database.Seeds;

public static class DatabaseSeedRunner
{
    public static async Task SeedAsync(AppDbContext dbContext, Func<string, string> hashPassword, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Users.AnyAsync(u => u.Email == "admin@gymscan.test", cancellationToken))
            return;

        var password = hashPassword("Test@1234");

        var fullySetup = new User
        {
            Id = Guid.Parse("d0000001-0000-0000-0000-000000000001"),
            Email = "admin@gymscan.test",
            FirstName = "Ahmed",
            LastName = "Hassan",
            PasswordHash = password,
            SetupStatus = SetupStatus.ProfileCompleted,
            WeightKg = 82,
            HeightCm = 178,
            Age = 28,
            Gender = "Male",
            IsActive = true
        };

        var profileDone = new User
        {
            Id = Guid.Parse("d0000001-0000-0000-0000-000000000002"),
            Email = "sara@gymscan.test",
            FirstName = "Sara",
            LastName = "Ali",
            PasswordHash = password,
            SetupStatus = SetupStatus.ProfileCompleted,
            WeightKg = 65,
            HeightCm = 163,
            Age = 25,
            Gender = "Female",
            IsActive = true
        };

        var newUser = new User
        {
            Id = Guid.Parse("d0000001-0000-0000-0000-000000000003"),
            Email = "new@gymscan.test",
            FirstName = "Omar",
            LastName = null,
            PasswordHash = password,
            SetupStatus = SetupStatus.AccountCreated,
            IsActive = true
        };

        var inactiveUser = new User
        {
            Id = Guid.Parse("d0000001-0000-0000-0000-000000000004"),
            Email = "disabled@gymscan.test",
            FirstName = "Nour",
            LastName = "Ibrahim",
            PasswordHash = password,
            SetupStatus = SetupStatus.ProfileCompleted,
            WeightKg = 70,
            HeightCm = 170,
            Age = 30,
            Gender = "Male",
            IsActive = false
        };

        dbContext.Users.AddRange(fullySetup, profileDone, newUser, inactiveUser);
        await dbContext.SaveChangesAsync(cancellationToken);

        var goalAhmed = new DailyNutritionGoal
        {
            Id = Guid.Parse("d0000002-0000-0000-0000-000000000001"),
            UserId = fullySetup.Id,
            CaloriesTarget = 2200,
            ProteinGramsTarget = 150,
            CarbohydratesGramsTarget = 250,
            FatGramsTarget = 70,
            GoalSource = GoalSource.Custom,
            IsActive = true
        };

        var goalSara = new DailyNutritionGoal
        {
            Id = Guid.Parse("d0000002-0000-0000-0000-000000000002"),
            UserId = profileDone.Id,
            CaloriesTarget = 1800,
            ProteinGramsTarget = 110,
            CarbohydratesGramsTarget = 200,
            FatGramsTarget = 60,
            GoalSource = GoalSource.Suggested,
            IsActive = true
        };

        dbContext.DailyNutritionGoals.AddRange(goalAhmed, goalSara);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
