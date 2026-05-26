using GymScan.Services.Common.Exceptions;
using GymScan.Services.Common.Models;

namespace GymScan.API.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException exception)
        {
            _logger.LogWarning(exception, "Handled application exception for request {Path}", context.Request.Path);

            context.Response.StatusCode = exception.StatusCode;
            context.Response.ContentType = "application/json";

            var response = ServiceResponse<object>.Failure(exception.Message, exception.ErrorList, exception.StatusCode);
            await context.Response.WriteAsJsonAsync(response);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled exception for request {Path}", context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

            var response = ServiceResponse<object>.Failure(
                "An unexpected error occurred.",
                ["INTERNAL_SERVER_ERROR"],
                StatusCodes.Status500InternalServerError);

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
