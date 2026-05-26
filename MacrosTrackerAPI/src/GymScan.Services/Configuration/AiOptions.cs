namespace GymScan.Services.Configuration;

public sealed class AiOptions
{
    public const string SectionName = "AI";

    public string Provider { get; init; } = string.Empty;

    public string ApiKey { get; init; } = string.Empty;

    public string Model { get; init; } = string.Empty;

    public string PromptTemplate { get; init; } = string.Empty;
}
