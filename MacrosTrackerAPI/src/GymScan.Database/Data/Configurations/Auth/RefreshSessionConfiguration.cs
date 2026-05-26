using GymScan.Database.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GymScan.Database.Data.Configurations.Auth;

public sealed class RefreshSessionConfiguration : IEntityTypeConfiguration<RefreshSession>
{
    public void Configure(EntityTypeBuilder<RefreshSession> builder)
    {
        builder.ToTable("RefreshSessions");
        builder.HasKey(session => session.Id);
        builder.Property(session => session.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(session => session.CreatedByIp).HasMaxLength(128);
        builder.Property(session => session.UserAgent).HasMaxLength(512);
        builder.Property(session => session.IsDeleted).HasDefaultValue(false);
        builder.HasIndex(session => session.TokenHash).IsUnique();
        builder.HasOne(session => session.User)
            .WithMany(user => user.RefreshSessions)
            .HasForeignKey(session => session.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
