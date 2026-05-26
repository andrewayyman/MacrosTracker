using GymScan.Database.Data;

namespace GymScan.Database.Seeds;

public static class DatabaseSeedRunner
{
    public static Task SeedAsync(AppDbContext dbContext, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
