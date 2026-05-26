namespace GymScan.Services.Common.Exceptions;

public sealed class AppException : Exception
{
    public AppException(int statusCode, string message, IEnumerable<string>? errorList = null)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorList = errorList?.ToArray() ?? Array.Empty<string>();
    }

    public int StatusCode { get; }

    public IReadOnlyList<string> ErrorList { get; }
}
