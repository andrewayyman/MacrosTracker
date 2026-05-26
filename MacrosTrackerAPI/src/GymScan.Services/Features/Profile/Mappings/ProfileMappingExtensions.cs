using GymScan.Database.Entities.Auth;
using GymScan.Services.Features.Profile.Dtos.Responses;

namespace GymScan.Services.Features.Profile.Mappings;

public static class ProfileMappingExtensions
{
    public static ProfileDetailsDto ToProfileDetailsDto(this User user) =>
        new(
            user.FirstName,
            user.LastName,
            user.WeightKg,
            user.HeightCm,
            user.Age,
            user.Gender,
            user.SetupStatus.ToString());
}
