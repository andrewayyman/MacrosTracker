# Implementation Plan: User Goal Setting & Nutrition Plan Calculator

**Branch**: `008-smart-goal-setup` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-user-nutrition-goals/spec.md`

---

## Summary

Upgrade the existing goal-setup flow from a simple "enter macro targets" form into a full onboarding interview that collects physical measurements, activity level, and goal type, then runs the Mifflin-St Jeor + TDEE algorithm to calculate a personalised daily calorie and macro plan. The computed plan is stored in a new `UserGoalProfile` entity (inputs + intermediates + outputs) and synced into the existing `DailyNutritionGoal` table so all downstream diary/tracking features remain unaffected. Users can edit their goal at any time via a "My Goal" page.

---

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript-adjacent JSX / React 18 + Vite (frontend)

**Primary Dependencies**: ASP.NET Core, EF Core 9, SQL Server, FluentValidation, React Router, Axios, Zustand

**Storage**: SQL Server — new `UserGoalProfiles` table; existing `DailyNutritionGoals` table updated in sync

**Testing**: None — per constitution, no unit tests unless spec explicitly requests them

**Target Platform**: Web (ASP.NET Core API + React SPA)

**Project Type**: N-tier web application (3-project backend: API / Services / Database)

**Performance Goals**: Goal profile save and retrieval under 300 ms; calculation preview under 100 ms

**Constraints**: Safe calorie minimum floors (1200 kcal female / 1500 kcal male) must be enforced server-side

**Scale/Scope**: One active goal profile per user; no historical versioning in v1

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Notes |
|-----------|-------|-------|
| I. N-tier Modular Monolith (3 projects) | PASS | New entity in Database; new service in Services; new controller in API — no extra project |
| II. Thin Controllers, No Logic Leakage | PASS | `UserGoalProfileController` calls `IUserGoalProfileService` directly; zero calculation logic in controller |
| III. CQRS-style Service Separation (No MediatR) | PASS | Simplified arch: single `UserGoalProfileService` per architecture memory; no MediatR |
| IV. Standard Response Contract `{Data, Message, ErrorList}` | PASS | All endpoints return `ServiceResponse<T>` wrapped in the standard envelope |
| V. Simplicity — No Premature Complexity | PASS | No test harnesses; GoalType enum combines goal + pace to avoid a separate entity |

**Result**: All gates pass. No Complexity Tracking entries required.

---

## Project Structure

### Documentation (this feature)

```text
specs/008-user-nutrition-goals/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/
│   └── user-goal-profile.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks command)
```

### Source Code (repository)

```text
MacrosTrackerAPI/src/GymScan.Database/
├── Entities/Nutrition/
│   ├── ActivityLevel.cs                    [NEW]
│   ├── GoalType.cs                         [NEW]
│   └── UserGoalProfile.cs                  [NEW]
├── Configurations/Nutrition/
│   └── UserGoalProfileConfiguration.cs     [NEW]
└── Data/
    ├── AppDbContext.cs                      [MODIFY — add DbSet<UserGoalProfile>]
    └── Migrations/                         [NEW migration: AddUserGoalProfile]

MacrosTrackerAPI/src/GymScan.Services/
└── Features/
    └── UserGoalProfile/                    [NEW domain folder]
        ├── IUserGoalProfileService.cs
        ├── UserGoalProfileService.cs
        ├── Dtos/
        │   ├── Requests/
        │   │   └── SetGoalProfileRequestDto.cs
        │   └── Responses/
        │       ├── GoalProfileDto.cs
        │       └── GoalCalculationPreviewDto.cs
        ├── Validators/
        │   └── SetGoalProfileRequestValidator.cs
        └── Mappings/
            └── GoalProfileMappingExtensions.cs

MacrosTrackerAPI/src/GymScan.API/
├── Controllers/
│   └── UserGoalProfileController.cs        [NEW]
└── Program.cs                              [MODIFY — register IUserGoalProfileService]

MacrosTrackerWeb/src/
├── api/
│   └── userGoalProfileClient.js            [NEW]
├── pages/
│   ├── GoalSetup.jsx                       [MODIFY — replace body with full interview form]
│   └── MyGoal.jsx                          [NEW — view current goal + calculation breakdown]
└── App.jsx                                 [MODIFY — add /my-goal route]
```

---

## Key Design Decisions

### 1. GoalType Enum Combines Goal + Pace

Six values (LoseWeightSlow, LoseWeightModerate, LoseWeightAggressive, Maintain, GainMuscleLean, GainMuscleStandard) encode both the direction and pace in one field. This avoids a nullable `GoalPace` field that is irrelevant for Maintain, and aligns with how every major nutrition app (MyFitnessPal, Cronometer) presents the choice to users as a single selection.

### 2. UserGoalProfile Replaces GoalSetup; DailyNutritionGoal Kept for Diary Compat

The existing `DailyNutritionGoal.IsActive` table is already queried by the diary/progress features. `UserGoalProfileService.SaveGoalProfileAsync` upserts the daily goal (same as `NutritionGoalService.UpsertDailyGoalAsync`) after writing the new profile record, so zero changes are needed in `DiaryService`, `ProgressService`, or the dashboard.

### 3. Single Profile Record Per User (Upsert, No Versioning)

`UserGoalProfile` has a unique constraint on `UserId`. Save = insert on first call, update on subsequent calls. No `IsActive` flag needed. Historical snapshots are deferred to v2.

### 4. Safe Calorie Floor Enforced Server-Side Only

Minimum floors (1200 / 1500 kcal) are applied in `UserGoalProfileService`. The frontend shows a warning message from the API response but does not replicate the floor logic — single source of truth.

### 5. Existing GetSuggestedGoal Endpoint Left in Place

`NutritionGoalsController.GetSuggestedGoal` uses the old hardcoded-multiplier calculation. It is not removed to avoid breaking any existing client flows. The new `POST /api/user-goal-profile/preview` is the authoritative calculation endpoint.

### 6. GoalSetup.jsx Enhanced In-Place; No New Route for Onboarding

The existing `/goal-setup` route and `GoalSetupPage` remain. Their body is replaced with the full interview form. The `setupStatus = "ProfilePending"` redirect logic in `ProtectedRoute` continues to direct first-time users to `/goal-setup` without any routing changes.

---

## Calculation Algorithm (implemented in UserGoalProfileService)

```
step 1 — BMR (Mifflin-St Jeor)
  Male:   BMR = 10 × weightKg + 6.25 × heightCm − 5 × age + 5
  Female: BMR = 10 × weightKg + 6.25 × heightCm − 5 × age − 161

step 2 — TDEE
  TDEE = BMR × activityMultiplier
  Sedentary=1.2 | LightlyActive=1.375 | ModeratelyActive=1.55 | VeryActive=1.725 | ExtraActive=1.9

step 3 — Calorie target
  LoseWeightSlow=−250 | LoseWeightModerate=−500 | LoseWeightAggressive=−750
  Maintain=0
  GainMuscleLean=+250 | GainMuscleStandard=+500
  rawCalories = TDEE + adjustment

step 4 — Safe floor
  floor = sex == "Male" ? 1500 : 1200
  if rawCalories < floor → calories = floor, set IsCalorieMinimumApplied = true
  else calories = round(rawCalories)

step 5 — Protein (ISSN guidelines)
  Maintain → 1.6 g/kg | LoseWeight* → 2.0 g/kg | GainMuscle* → 2.2 g/kg
  proteinGrams = round(weightKg × proteinMultiplier, 1)

step 6 — Fat (30% of calories, minimum 0.5 g/kg)
  fatGrams = max(round(calories × 0.30 / 9, 1), round(weightKg × 0.5, 1))

step 7 — Carbs (remainder)
  carbsCalories = calories − proteinGrams × 4 − fatGrams × 9
  carbsGrams = round(carbsCalories / 4, 1)
  if carbsGrams < 0 → carbsGrams = 0 (edge case: very high protein + fat at low calories)
```
