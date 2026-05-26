using System.Security.Cryptography;
using System.Text;
using GymScan.Database.Data;
using GymScan.Database.Entities.Auth;
using GymScan.Services.Features.Auth.Dtos.Requests;
using GymScan.Services.Features.Auth.Dtos.Responses;
using GymScan.Services.Features.Auth.Mappings;
using GymScan.Services.Features.Auth.Validators;
using GymScan.Services.Common.Interfaces;
using GymScan.Services.Common.Models;
using GymScan.Services.Configuration;
using GymScan.Services.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GymScan.Services.Features.Auth;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUserService _currentUser;
    private readonly JwtOptions _jwt;

    public AuthService(AppDbContext db, IPasswordHasherService passwordHasher, ITokenService tokenService, ICurrentUserService currentUser, IOptions<JwtOptions> jwt)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _currentUser = currentUser;
        _jwt = jwt.Value;
    }

    public async Task<ServiceResponse<AuthSessionDto>> RegisterAsync(RegisterRequestDto request, CancellationToken ct = default)
    {
        var validation = await new RegisterRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<AuthSessionDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            return ServiceResponse<AuthSessionDto>.Failure("An account already exists for this email address.", ["Email is already registered."], 409);

        var context = _currentUser.GetCurrentContext();
        var user = new User
        {
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            SetupStatus = SetupStatus.AccountCreated,
            IsActive = true
        };
        _db.Users.Add(user);

        var (plainToken, session) = BuildRefreshSession(user.Id, context.IpAddress, context.UserAgent);
        _db.RefreshSessions.Add(session);

        await _db.SaveChangesAsync(ct);

        var accessToken = _tokenService.CreateAccessToken(user);
        return ServiceResponse<AuthSessionDto>.Success(
            user.ToAuthSessionDto(accessToken, new IssuedRefreshSessionDto(plainToken, session.ExpiresAtUtc)),
            "Account created successfully.",
            201);
    }

    public async Task<ServiceResponse<AuthSessionDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var validation = await new LoginRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<AuthSessionDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive, ct);

        if (user is null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return ServiceResponse<AuthSessionDto>.Failure("Invalid email or password.", ["Email or password is incorrect."], 401);

        var context = _currentUser.GetCurrentContext();
        var (plainToken, session) = BuildRefreshSession(user.Id, context.IpAddress, context.UserAgent);
        _db.RefreshSessions.Add(session);

        await _db.SaveChangesAsync(ct);

        var accessToken = _tokenService.CreateAccessToken(user);
        return ServiceResponse<AuthSessionDto>.Success(
            user.ToAuthSessionDto(accessToken, new IssuedRefreshSessionDto(plainToken, session.ExpiresAtUtc)),
            "Signed in successfully.");
    }

    public async Task<ServiceResponse<AuthSessionDto>> RefreshAsync(RefreshRequestDto request, CancellationToken ct = default)
    {
        var validation = await new RefreshRequestValidator().ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ServiceResponse<AuthSessionDto>.Failure("Validation failed.", validation.Errors.Select(e => e.ErrorMessage));

        var tokenHash = HashToken(request.RefreshToken);
        var session = await _db.RefreshSessions
            .Include(s => s.User)
            .FirstOrDefaultAsync(s =>
                s.TokenHash == tokenHash &&
                s.RevokedAtUtc == null &&
                s.ExpiresAtUtc > DateTimeOffset.UtcNow &&
                s.User.IsActive, ct);

        if (session is null)
            return ServiceResponse<AuthSessionDto>.Failure("Your session has expired. Please sign in again.", ["Refresh token is invalid or expired."], 401);

        session.RevokedAtUtc = DateTimeOffset.UtcNow;
        session.LastUsedAtUtc = DateTimeOffset.UtcNow;

        var context = _currentUser.GetCurrentContext();
        var (plainToken, newSession) = BuildRefreshSession(session.UserId, context.IpAddress, context.UserAgent);
        _db.RefreshSessions.Add(newSession);

        await _db.SaveChangesAsync(ct);

        var accessToken = _tokenService.CreateAccessToken(session.User);
        return ServiceResponse<AuthSessionDto>.Success(
            session.User.ToAuthSessionDto(accessToken, new IssuedRefreshSessionDto(plainToken, newSession.ExpiresAtUtc)),
            "Session refreshed successfully.");
    }

    public async Task<ServiceResponse<MessageDto>> LogoutAsync(LogoutRequestDto request, CancellationToken ct = default)
    {
        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<MessageDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var targetHash = string.IsNullOrWhiteSpace(request.RefreshToken) ? null : HashToken(request.RefreshToken);

        var sessions = await _db.RefreshSessions
            .Where(s => s.UserId == context.UserId.Value && s.RevokedAtUtc == null)
            .ToListAsync(ct);

        var now = DateTimeOffset.UtcNow;
        foreach (var s in sessions)
        {
            if (targetHash is not null && s.TokenHash != targetHash)
                continue;
            s.RevokedAtUtc = now;
            s.LastUsedAtUtc = now;
        }

        await _db.SaveChangesAsync(ct);
        return ServiceResponse<MessageDto>.Success(new MessageDto("You have been signed out."), "Signed out successfully.");
    }

    public async Task<ServiceResponse<CurrentUserDto>> GetCurrentUserAsync(CancellationToken ct = default)
    {
        var context = _currentUser.GetCurrentContext();
        if (context.UserId is null)
            return ServiceResponse<CurrentUserDto>.Failure("Unauthorized.", ["Authentication required."], 401);

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == context.UserId.Value, ct);
        if (user is null)
            return ServiceResponse<CurrentUserDto>.Failure("User account not found.", ["User not found."], 404);

        return ServiceResponse<CurrentUserDto>.Success(user.ToCurrentUserDto(), "User retrieved successfully.");
    }

    private (string plainToken, RefreshSession session) BuildRefreshSession(Guid userId, string? ipAddress, string? userAgent)
    {
        var plainToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var session = new RefreshSession
        {
            UserId = userId,
            TokenHash = HashToken(plainToken),
            ExpiresAtUtc = DateTimeOffset.UtcNow.AddDays(_jwt.RefreshTokenExpiryDays),
            CreatedByIp = ipAddress,
            UserAgent = userAgent,
            LastUsedAtUtc = DateTimeOffset.UtcNow
        };
        return (plainToken, session);
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
