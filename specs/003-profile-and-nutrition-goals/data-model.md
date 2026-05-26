# Data Model: Profile and Nutrition Goals

## User Account

**Purpose**: Represents the authenticated person using GymScan, including identity, onboarding state, and body metrics required for nutrition setup.

**Fields**:
- `Id`: unique user identifier
- `Email`: unique account email address used for sign-in
- `FirstName`: required user-facing given name
- `LastName`: optional family name
- `PasswordHash`: stored password secret in hashed form only
- `SetupStatus`: onboarding state such as `AccountCreated`, `ProfilePending`, or `ProfileCompleted`
- `WeightKg`: nullable current body weight until profile setup is completed
- `HeightCm`: nullable current height until profile setup is completed
- `Age`: nullable age until profile setup is completed
- `Gender`: nullable biological sex marker used for starter-goal calculation until profile setup is completed
- `IsActive`: indicates whether the account can still authenticate
- `CreatedAtUtc`: creation timestamp
- `UpdatedAtUtc`: last update timestamp

**Validation Rules**:
- Email remains unique among active accounts.
- First name is required.
- `WeightKg` must be within a realistic supported range for adult users.
- `HeightCm` must be within a realistic supported range for adult users.
- `Age` must be within the supported application age range.
- `Gender` must be one of the allowed values when body metrics are saved.
- `SetupStatus` must stay aligned with the actual completion state of profile details and active goals.

**Relationships**:
- One user account can own many refresh sessions.
- One user account owns zero or one active daily nutrition goal in this feature.

## Daily Nutrition Goal

**Purpose**: Represents the user's active daily calorie and macro targets used by later dashboard and diary features.

**Fields**:
- `Id`: unique goal identifier
- `UserId`: owning user account identifier
- `CaloriesTarget`: daily calorie target
- `ProteinGramsTarget`: daily protein target in grams
- `CarbohydratesGramsTarget`: daily carbohydrate target in grams
- `FatGramsTarget`: daily fat target in grams
- `GoalSource`: indicates whether the saved goal came from a suggested baseline or a custom user override
- `IsActive`: indicates whether this row is the current target set for the user
- `CreatedAtUtc`: creation timestamp
- `UpdatedAtUtc`: last update timestamp

**Validation Rules**:
- All macro and calorie target values are required when a goal is saved.
- Target values must be positive and fall within realistic daily nutrition ranges.
- Only one active daily goal may exist per user at a time.
- A user can save or update a goal only while authenticated as the goal owner.

**Relationships**:
- Many goal records can belong to one user over time if later goal history is introduced.
- This feature treats exactly one goal per user as active.

## Setup Summary

**Purpose**: Lightweight response model used by the frontend to decide whether to continue onboarding, show saved values, or route the user into the rest of the app.

**Fields**:
- `UserId`
- `SetupStatus`
- `IsProfileComplete`
- `IsGoalComplete`
- `Profile`: current body-metric and personal profile snapshot
- `DailyGoal`: current active goal snapshot when present

**Validation Rules**:
- Must only describe the currently authenticated user.
- Must reflect persisted profile and goal state accurately.
- Must not expose password hashes, refresh-session secrets, or internal authorization data.

## State Transitions

### Account Setup Progression

`AccountCreated` -> `ProfilePending` -> `ProfileCompleted`

Notes:
- A newly registered account starts at `AccountCreated`.
- Saving valid body metrics and profile details advances the account to `ProfilePending` if no goal exists yet.
- Saving a valid active daily goal advances the account to `ProfileCompleted`.
- Editing profile or goal values after completion keeps the account in `ProfileCompleted` unless a future feature introduces more detailed setup states.

### Goal Lifecycle

`Missing` -> `Active` -> `Replaced`

Notes:
- A user begins with no active goal.
- The first successful goal save creates the active goal.
- A later goal update replaces the active target while keeping exactly one active goal for the user in the current feature design.
