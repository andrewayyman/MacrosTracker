# Research: Profile and Nutrition Goals

## Decision 1: Extend the existing user account with body-metric profile fields instead of creating a separate profile table

**Rationale**: The current auth slice already persists the signed-in user in `GymScan.Database.Entities.Auth.User`, and the business context explicitly lists weight, height, age, and gender as user-owned account data. Extending the existing user record keeps onboarding state simple, avoids an unnecessary join for every current-user lookup, and fits the current `SetupStatus` model naturally.

**Alternatives considered**:
- Separate `UserProfile` table: rejected because it adds a new persistence boundary without clear business value at this stage.
- JSON blob for profile values: rejected because it weakens validation, indexing, and future query flexibility.

## Decision 2: Store one active daily nutrition-goal record per user as a dedicated entity

**Rationale**: Daily macro targets are conceptually different from identity and body metrics. A dedicated goal entity keeps profile data and goal data independently updateable, supports future goal history if needed, and matches the business-context expectation that goals will later drive dashboards and diary comparisons.

**Alternatives considered**:
- Put calorie and macro targets directly on the user record: rejected because it couples two separate change patterns too tightly.
- Create a historical goal-log table immediately: rejected because the current feature only needs one active goal, not full version history.

## Decision 3: Use `SetupStatus` as the onboarding state machine, with profile completion and goal completion represented explicitly

**Rationale**: The auth feature already introduced `AccountCreated`, `ProfilePending`, and `ProfileCompleted`. Reusing that state progression keeps onboarding routing consistent across login, current-user bootstrap, and future protected-page redirects. Saving body metrics advances the account to `ProfilePending`, and saving an active goal completes the state as `ProfileCompleted`.

**Alternatives considered**:
- Infer readiness from null profile or goal fields only: rejected because it pushes onboarding rules into scattered read logic.
- Add many granular onboarding states now: rejected because the current feature only needs enough state to guide users through profile and goal setup.

## Decision 4: Provide suggested starter goals derived from saved body metrics, while allowing full user override before save

**Rationale**: The business context says users should be prompted to set nutrition goals or use defaults, and it also collects body metrics for goal calculation. A simple starter-goal suggestion based on stored metrics gives users a practical starting point without introducing advanced coaching logic. Users remain in control because they can edit every value before the goal is persisted.

**Alternatives considered**:
- Static defaults for all users: rejected because they ignore body size and reduce perceived usefulness.
- Full coaching or body-composition recommendation logic: rejected because that is beyond the scope of this feature and would add premature complexity.

## Decision 5: Expose a compact authenticated API surface with setup-summary, profile, and daily-goal endpoints

**Rationale**: The frontend needs three core capabilities for this slice: bootstrap the current setup state, save profile details, and create or update daily goals. A small contract around setup summary plus profile and goal resources keeps controllers focused and gives the onboarding UI enough data to resume incomplete setup cleanly.

**Alternatives considered**:
- One giant onboarding endpoint for every profile and goal action: rejected because it makes later maintenance and partial updates harder.
- Only reuse the auth `me` endpoint for setup bootstrap: rejected because the onboarding screens need more than the compact auth snapshot should carry long term.

## Decision 6: Keep verification aligned with the repository standard by using builds and manual smoke checks instead of adding test projects

**Rationale**: The current repo guidance explicitly excludes backend unit-test projects and frontend test tooling unless requested later. For this feature, build verification plus live profile-and-goal smoke checks keeps the workflow consistent with the current project standard while still validating the most important onboarding paths.

**Alternatives considered**:
- Adding xUnit and frontend test tooling now: rejected because it conflicts with the agreed repository standard.
- Relying only on static code inspection: rejected because onboarding state and persisted goals still require runtime verification.
