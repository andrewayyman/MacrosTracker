using System.Text.Json.Serialization;

namespace GymScan.Services.Common.Models;

public sealed record ServiceResponse<T>
{
    public T? Data { get; init; }

    public string Message { get; init; } = string.Empty;

    public IReadOnlyList<string> ErrorList { get; init; } = Array.Empty<string>();

    [JsonIgnore]
    public int StatusCode { get; init; } = 200;

    [JsonIgnore]
    public bool HasErrors => ErrorList.Count > 0;

    public static ServiceResponse<T> Success(T? data, string message, int statusCode = 200) =>
        new()
        {
            Data = data,
            Message = message,
            StatusCode = statusCode
        };

    public static ServiceResponse<T> Failure(string message, IEnumerable<string>? errorList = null, int statusCode = 400) =>
        new()
        {
            Data = default,
            Message = message,
            ErrorList = errorList?.ToArray() ?? Array.Empty<string>(),
            StatusCode = statusCode
        };
}
