using GymScan.Services.Common.Models;

namespace GymScan.Services.Common.Interfaces;

public interface ICurrentUserService
{
    CurrentRequestContext GetCurrentContext();
}
