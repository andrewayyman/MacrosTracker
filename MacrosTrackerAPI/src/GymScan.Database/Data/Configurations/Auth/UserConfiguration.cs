using GymScan.Database.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Auth;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(user => user.Email).IsUnique();
        builder.Property(user => user.FirstName).HasMaxLength(120).IsRequired();
        builder.Property(user => user.LastName).HasMaxLength(120);
        builder.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
        builder.Property(user => user.SetupStatus).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(user => user.WeightKg).HasPrecision(5, 1);
        builder.Property(user => user.HeightCm).HasPrecision(5, 1);
        builder.Property(user => user.Gender).HasMaxLength(16);
        builder.Property(user => user.IsActive).HasDefaultValue(true);
        builder.Property(user => user.IsDeleted).HasDefaultValue(false);
    }
}
