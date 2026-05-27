using GymScan.Database.Abstractions;
using GymScan.Database.Entities.Auth;
using GymScan.Database.Entities.Nutrition;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;

namespace GymScan.Database.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    public DbSet<DailyNutritionGoal> DailyNutritionGoals => Set<DailyNutritionGoal>();

    public DbSet<LocalFoodItem> LocalFoodItems => Set<LocalFoodItem>();

    public DbSet<FoodScan> FoodScans => Set<FoodScan>();

    public DbSet<MealLog> MealLogs => Set<MealLog>();

    public DbSet<UserGoalProfile> UserGoalProfiles => Set<UserGoalProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("dbo");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        ApplySoftDeleteQueryFilters(modelBuilder);
    }

    private static void ApplySoftDeleteQueryFilters(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (!typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                continue;
            }

            var parameter = Expression.Parameter(entityType.ClrType, "entity");
            var propertyMethod = typeof(EF).GetMethod(nameof(EF.Property), BindingFlags.Public | BindingFlags.Static)!
                .MakeGenericMethod(typeof(bool));
            var isDeletedProperty = Expression.Call(propertyMethod, parameter, Expression.Constant(nameof(ISoftDeletable.IsDeleted)));
            var compareExpression = Expression.Equal(isDeletedProperty, Expression.Constant(false));

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(compareExpression, parameter));
        }
    }
}
