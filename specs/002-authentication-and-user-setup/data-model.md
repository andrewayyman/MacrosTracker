# Data Model: Authentication and User Setup

## User Account

**Purpose**: Represents a person who can sign in to GymScan and own private tracking data.

**Fields**:
- `Id`: unique user identifier
- `Email`: unique account email address used for sign-in
- `FirstName`: user-facing given name
- `LastName`: optional family name for personalization
- `PasswordHash`: stored password secret in hashed form only
- `SetupStatus`: account setup stage such as `AccountCreated` or `ProfilePending`
- `IsActive`: indicates whether the account can still authenticate
- `CreatedAtUtc`: creation timestamp
- `UpdatedAtUtc`: last update timestamp

**Validation Rules**:
- Email is required and must be unique among active accounts.
- First name is required.
- Password is required at registration and must satisfy the project password policy defined during implementation.
- Setup status must always have a valid known value.

**Relationships**:
- One user account can own many refresh sessions.
- One user account will later relate to profile, goals, scans, and meal logs in future specs.

## Refresh Session

**Purpose**: Represents a long-lived renewable authenticated session for a signed-in user.

**Fields**:
- `Id`: unique session identifier
- `UserId`: owning user account identifier
- `TokenHash`: hashed form of the renewal credential
- `ExpiresAtUtc`: final expiration timestamp
- `CreatedAtUtc`: issuance timestamp
- `RevokedAtUtc`: timestamp set when the session is invalidated
- `LastUsedAtUtc`: most recent successful renewal time
- `CreatedByIp`: optional origin IP for audit and support use
- `UserAgent`: optional client description for future device-awareness

**Validation Rules**:
- Token hash is required and never stored in raw form.
- A revoked session cannot be used for renewal.
- An expired session cannot be used for renewal.

**Relationships**:
- Many refresh sessions belong to one user account.

## Authenticated User Snapshot

**Purpose**: Lightweight response model returned to the frontend after registration, login, refresh, and current-user lookup.

**Fields**:
- `UserId`
- `Email`
- `FirstName`
- `LastName`
- `SetupStatus`
- `IsAuthenticated`

**Validation Rules**:
- Must only describe the currently authenticated user.
- Must not include password hashes or raw renewal credentials.

## Auth Token Pair

**Purpose**: Response payload that gives the client immediate authenticated access and a path to session renewal.

**Fields**:
- `AccessToken`
- `AccessTokenExpiresAtUtc`
- `RefreshToken`
- `RefreshTokenExpiresAtUtc`
- `User`: authenticated user snapshot

**Validation Rules**:
- Access token and refresh token must always be paired on successful authentication and renewal responses.
- Expiration timestamps must reflect a shorter access window and a longer renewal window.

## State Transitions

### User Account Setup

`AccountCreated` -> `ProfilePending` -> `ProfileCompleted`

Notes:
- This feature must support at least the first unresolved setup state so the app can route first-time users correctly.
- Later specs will advance the user beyond initial setup.

### Refresh Session Lifecycle

`Issued` -> `Active` -> `Revoked`

Additional terminal path:
- `Issued` -> `Expired`

Notes:
- Renewal keeps the session in an active state until expiration or explicit logout.
- Logout transitions the current active session to revoked.
