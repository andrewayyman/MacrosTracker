using GymScan.Database.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GymScan.Database;

public static class DependencyInjection
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default");

        services.AddDbContext<AppDbContext>(options =>
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=GymScanMonolithDb;Trusted_Connection=True;TrustServerCertificate=True");
                return;
            }

            options.UseSqlServer(connectionString);
        });

        return services;
    }
}
