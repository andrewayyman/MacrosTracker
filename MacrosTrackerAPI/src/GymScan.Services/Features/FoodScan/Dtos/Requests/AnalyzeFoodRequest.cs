using Microsoft.AspNetCore.Http;

namespace GymScan.Services.Features.FoodScan.Dtos.Requests;

public sealed record AnalyzeFoodRequest(IFormFile Image);
