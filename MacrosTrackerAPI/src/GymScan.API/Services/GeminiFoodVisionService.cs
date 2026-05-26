using System.Text;
using System.Text.Json;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Configuration;
using Microsoft.Extensions.Options;

namespace GymScan.API.Services;

public sealed class GeminiFoodVisionService : IFoodVisionService
{
    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly ILogger<GeminiFoodVisionService> _logger;

    public GeminiFoodVisionService(HttpClient httpClient, IOptions<AiOptions> options, ILogger<GeminiFoodVisionService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<FoodVisionResult> AnalyzeAsync(Stream imageStream, string mimeType)
    {
        try
        {
            using var ms = new MemoryStream();
            await imageStream.CopyToAsync(ms);
            var base64 = Convert.ToBase64String(ms.ToArray());

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { inlineData = new { mimeType, data = base64 } },
                            new { text = _options.PromptTemplate }
                        }
                    }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent?key={_options.ApiKey}";
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini API returned {StatusCode}", response.StatusCode);
                return FallbackResult();
            }

            var json = await response.Content.ReadAsStringAsync();
            return ParseResponse(json);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Gemini API call failed");
            return FallbackResult();
        }
    }

    private FoodVisionResult ParseResponse(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? string.Empty;

            var cleaned = text.Trim();
            if (cleaned.StartsWith("```"))
            {
                var firstNewline = cleaned.IndexOf('\n');
                if (firstNewline >= 0)
                    cleaned = cleaned[(firstNewline + 1)..];
                if (cleaned.EndsWith("```"))
                    cleaned = cleaned[..^3];
                cleaned = cleaned.Trim();
            }

            using var parsed = JsonDocument.Parse(cleaned);
            var root = parsed.RootElement;

            return new FoodVisionResult(
                FoodName: root.GetProperty("foodName").GetString() ?? "Unknown",
                Calories: root.GetProperty("calories").GetDecimal(),
                Protein: root.GetProperty("proteinGrams").GetDecimal(),
                Carbs: root.GetProperty("carbsGrams").GetDecimal(),
                Fat: root.GetProperty("fatGrams").GetDecimal(),
                ServingSizeGrams: root.TryGetProperty("servingSizeGrams", out var ssg) && ssg.ValueKind == JsonValueKind.Number ? ssg.GetDecimal() : null,
                ConfidencePercent: root.TryGetProperty("confidencePercent", out var cp) && cp.ValueKind == JsonValueKind.Number ? cp.GetInt32() : 50,
                Notes: root.TryGetProperty("notes", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString() : null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse Gemini response");
            return FallbackResult();
        }
    }

    private static FoodVisionResult FallbackResult() =>
        new("Unknown", 0m, 0m, 0m, 0m, null, 0, "AI service unavailable");
}
