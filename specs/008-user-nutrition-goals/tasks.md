# Tasks: User Goal Setting & Nutrition Plan Calculator

**Input**: Design documents from `specs/008-user-nutrition-goals/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/user-goal-profile.md ✅

**Tests**: None — no unit tests requested in specification (per constitution Principle V).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (N/A — existing project)

No project initialisation required. All infrastructure (solution, projects, build pipeline, EF configuration) already exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New enums, entity, EF migration, and service that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `ActivityLevel` enum in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/ActivityLevel.cs` with values Sedentary=1, LightlyActive=2, ModeratelyActive=3, VeryActive=4, ExtraActive=5
- [X] T002 [P] Create `GoalType` enum in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/GoalType.cs` with values LoseWeightSlow=1, LoseWeightModerate=2, LoseWeightAggressive=3, Maintain=4, GainMuscleLean=5, GainMuscleStandard=6
- [X] T003 Create `UserGoalProfile` entity in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/UserGoalProfile.cs` — fields: Id, UserId, BiologicalSex (string), AgeYears (int), WeightKg (double), HeightCm (double), ActivityLevel, GoalType, CalculatedBmr (double), CalculatedTdee (double), CalorieAdjustment (int), DailyCaloriesTarget (int), DailyProteinGrams (double), DailyCarbsGrams (double), DailyFatGrams (double), IsCalorieMinimumApplied (bool); inherits AuditableEntity; nav prop User
- [X] T004 Create `UserGoalProfileConfiguration` in `MacrosTrackerAPI/src/GymScan.Database/Configurations/Nutrition/UserGoalProfileConfiguration.cs` — unique index on UserId, FK → Users with cascade delete, ActivityLevel and GoalType stored as int
- [X] T005 Add `DbSet<UserGoalProfile> UserGoalProfiles` to `MacrosTrackerAPI/src/GymScan.Database/Data/AppDbContext.cs` and apply the configuration in `OnModelCreating`
- [X] T006 Add DTOs — create `SetGoalProfileRequestDto.cs` (record with BiologicalSex string, AgeYears int, WeightKg double, HeightCm double, ActivityLevel string, GoalType string) in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/Dtos/Requests/SetGoalProfileRequestDto.cs`
- [X] T007 [P] Add DTOs — create `GoalProfileDto.cs` (record: all UserGoalProfile fields plus activityLevel and goalType as strings for JSON) in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/Dtos/Responses/GoalProfileDto.cs`
- [X] T008 [P] Add DTOs — create `GoalCalculationPreviewDto.cs` (record: CalculatedBmr, CalculatedTdee, CalorieAdjustment, DailyCaloriesTarget, DailyProteinGrams, DailyCarbsGrams, DailyFatGrams, IsCalorieMinimumApplied) in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/Dtos/Responses/GoalCalculationPreviewDto.cs`
- [X] T009 Create `SetGoalProfileRequestValidator.cs` with FluentValidation rules in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/Validators/SetGoalProfileRequestValidator.cs` — BiologicalSex in {Male, Female}, AgeYears 15–100, WeightKg 30–350, HeightCm 100–250, ActivityLevel and GoalType must be valid parseable enum strings
- [X] T010 Create `GoalProfileMappingExtensions.cs` mapping `UserGoalProfile` entity → `GoalProfileDto` (converting enum ints to string names) in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/Mappings/GoalProfileMappingExtensions.cs`
- [X] T011 Define `IUserGoalProfileService` interface with three methods — `GetGoalProfileAsync`, `SaveGoalProfileAsync(SetGoalProfileRequestDto)`, `PreviewCalculationAsync(SetGoalProfileRequestDto)` — in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/IUserGoalProfileService.cs`
- [X] T012 Implement `UserGoalProfileService` in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/UserGoalProfileService.cs` with the full Mifflin-St Jeor + TDEE calculation: (1) parse enums from request strings, (2) compute BMR by sex, (3) apply activity multiplier for TDEE, (4) apply calorie delta by GoalType, (5) enforce safe floor (1200 female / 1500 male, set IsCalorieMinimumApplied), (6) compute protein by GoalType (1.6 / 2.0 / 2.2 g/kg), (7) compute fat at 30% calories min 0.5 g/kg, (8) compute carbs as remainder clamped ≥ 0; SaveGoalProfileAsync also deactivates old DailyNutritionGoal rows and inserts a new active one, and advances User.SetupStatus to ProfileCompleted if ProfilePending
- [X] T013 Register `IUserGoalProfileService` / `UserGoalProfileService` in `MacrosTrackerAPI/src/GymScan.API/Program.cs` (scoped lifetime, same pattern as existing service registrations)
- [X] T014 Run EF Core migration from the GymScan.Database project directory: `dotnet ef migrations add AddUserGoalProfile --project MacrosTrackerAPI/src/GymScan.Database --startup-project MacrosTrackerAPI/src/GymScan.API` and apply with `dotnet ef database update`

**Checkpoint**: Migration applied, service compiles, DI registered — user story implementation can begin.

---

## Phase 3: User Story 1 — First-Time Onboarding Interview (Priority: P1) 🎯 MVP

**Goal**: A new user who logs in without a goal profile can complete a 6-field interview, submit, and see their calculated nutrition plan.

**Independent Test**: Create a new account, complete profile-setup (existing step 1), arrive at `/goal-setup`, fill in sex/age/height/weight/activity/goal, submit — confirm redirect to `/dashboard` and that `DailyNutritionGoal` is saved.

### Implementation for User Story 1

- [X] T015 Create `UserGoalProfileController.cs` in `MacrosTrackerAPI/src/GymScan.API/Controllers/UserGoalProfileController.cs` with `[AppAuthorize]` and constructor injecting `IUserGoalProfileService`; add POST `SaveGoalProfile` endpoint mapped to `POST /api/user-goal-profile` that calls `SaveGoalProfileAsync` and returns the result via `ApiResult`
- [X] T016 Add `PreviewCalculation` endpoint to `UserGoalProfileController.cs` mapped to `POST /api/user-goal-profile/preview` calling `PreviewCalculationAsync`
- [X] T017 [P] Create `MacrosTrackerWeb/src/api/userGoalProfileClient.js` with functions `saveGoalProfile(payload)` → `POST /api/user-goal-profile` and `previewGoalCalculation(payload)` → `POST /api/user-goal-profile/preview`, using the existing Axios client instance
- [X] T018 Replace the body of `MacrosTrackerWeb/src/pages/GoalSetup.jsx` with a 6-field interview form: BiologicalSex (select: Male/Female), AgeYears (number input), WeightKg (number input), HeightCm (number input), ActivityLevel (select with 5 options), GoalType (select with 6 options) — pre-populate BiologicalSex/Age/Weight/Height from existing User store values; keep the existing `PageShell` wrapper and form error handling pattern
- [X] T019 Add live preview panel to `MacrosTrackerWeb/src/pages/GoalSetup.jsx`: debounced `previewGoalCalculation` call on form field change (when all 6 fields are filled); display returned BMR, TDEE, calories, protein, carbs, fat values in a read-only summary block below the form inputs
- [X] T020 Wire `GoalSetup.jsx` submit handler to call `saveGoalProfile`, update `authStore` `setupStatus` to `"ProfileCompleted"` on success, navigate to `/dashboard`

**Checkpoint**: New user onboarding flow end-to-end works. GoalSetup collects 6 fields, shows live preview, saves on submit.

---

## Phase 4: User Story 2 — View Calculated Nutrition Plan (Priority: P1)

**Goal**: After completing onboarding, a user can navigate to "My Goal" and see all four macro targets, their stated goal, and a brief explanation.

**Independent Test**: Complete onboarding (US1), navigate to `/my-goal` — confirm kcal, protein, carbs, fat are shown with the goal label and a rationale sentence.

### Implementation for User Story 2

- [X] T021 Add `GetGoalProfile` endpoint to `MacrosTrackerAPI/src/GymScan.API/Controllers/UserGoalProfileController.cs` mapped to `GET /api/user-goal-profile` calling `GetGoalProfileAsync`
- [X] T022 Add `getGoalProfile()` function to `MacrosTrackerWeb/src/api/userGoalProfileClient.js` → `GET /api/user-goal-profile`
- [X] T023 Create `MacrosTrackerWeb/src/pages/MyGoal.jsx` with: loading state on mount calling `getGoalProfile()`; four macro target cards (kcal, protein g, carbs g, fat g); goal label (human-readable GoalType string, e.g. "Lose weight — moderate pace"); brief one-line rationale; "Edit Goal" button navigating to `/goal-setup`; error state if no profile found
- [X] T024 Add `/my-goal` protected route to `MacrosTrackerWeb/src/App.jsx` and import `MyGoalPage`
- [X] T025 Add "My Goal" navigation link to the app shell/nav (wherever existing nav links live, e.g. `MacrosTrackerWeb/src/components/PageShell.jsx` or equivalent nav component)

**Checkpoint**: Authenticated user can reach `/my-goal` and see their complete nutrition targets.

---

## Phase 5: User Story 3 — Edit Goal & Recalculate Plan (Priority: P2)

**Goal**: A returning user can open "My Goal", tap "Edit Goal", change any field, save, and see updated targets immediately.

**Independent Test**: From `/my-goal`, click "Edit Goal", change weight and goalType, save — confirm `/my-goal` reflects new targets without page reload.

### Implementation for User Story 3

- [X] T026 Update `MacrosTrackerWeb/src/pages/GoalSetup.jsx` to call `getGoalProfile()` on mount (in addition to existing User store pre-population); if a profile exists, pre-populate all 6 fields from the returned `GoalProfileDto` (overriding the User store values for the form only)
- [X] T027 Update cancel/back behaviour in `MacrosTrackerWeb/src/pages/GoalSetup.jsx`: if the user navigated from `/my-goal` (existing profile present), navigating back returns to `/my-goal`; if first-time setup (no profile), cancel returns to previous step or dashboard
- [X] T028 After successful save in `GoalSetup.jsx`, navigate to `/my-goal` instead of `/dashboard` when the user already had a profile (i.e., was editing rather than onboarding for the first time)

**Checkpoint**: Edit flow is seamless — form is pre-populated, save recalculates, redirect lands on updated "My Goal" page.

---

## Phase 6: User Story 4 — Algorithm Transparency (Priority: P3)

**Goal**: Users can expand a "How was this calculated?" section on "My Goal" and see the step-by-step BMR → TDEE → adjusted calories breakdown.

**Independent Test**: On `/my-goal`, click "How was this calculated?" accordion — confirm BMR value, TDEE value, calorie adjustment, and final target are all labelled and numerically consistent.

### Implementation for User Story 4

- [X] T029 Add expandable "How was this calculated?" section to `MacrosTrackerWeb/src/pages/MyGoal.jsx` using a toggle state variable; when expanded, show: "Your BMR (base metabolic rate): X kcal", "With activity level [label]: X kcal (TDEE)", "Goal adjustment ([GoalType label]): ±X kcal", "Daily target: X kcal"; include calorie minimum note if `isCalorieMinimumApplied` is true
- [X] T030 Add `isCalorieMinimumApplied` warning banner to `MacrosTrackerWeb/src/pages/MyGoal.jsx` — display "Your calorie target has been raised to the safe minimum of X kcal/day" when the flag is true

**Checkpoint**: Calculation breakdown is visible and accurately reflects the intermediate values from the API response.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T031 [P] Add safe minimum warning to `MacrosTrackerWeb/src/pages/GoalSetup.jsx` submit flow — if the API response has `isCalorieMinimumApplied: true`, show an inline notice "Your calorie target was raised to the safe minimum" alongside the calculated preview
- [X] T032 [P] Add input validation feedback to `GoalSetup.jsx` for out-of-range values (age/weight/height outside allowed ranges) using `fieldErrors` pattern already present in the existing form
- [X] T033 Verify `UserGoalProfileService.SaveGoalProfileAsync` correctly handles concurrent saves (two rapid submits) — ensure only one active `DailyNutritionGoal` exists after the operation by confirming the deactivation loop runs before the insert in `MacrosTrackerAPI/src/GymScan.Services/Features/UserGoalProfile/UserGoalProfileService.cs`
- [X] T034 [P] Confirm all `activityLevel` and `goalType` select options in `GoalSetup.jsx` use the exact enum string values expected by the API (match `contracts/user-goal-profile.md` enum strings)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No external dependencies — start immediately. Blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational complete.
- **US2 (Phase 4)**: Depends on Foundational complete. Can start in parallel with US1 after Foundational.
- **US3 (Phase 5)**: Depends on US1 + US2 complete (edits the form from US1 and navigates back to the page from US2).
- **US4 (Phase 6)**: Depends on US2 complete (adds to the MyGoal page).
- **Polish (Phase 7)**: Depends on all user stories complete.

### User Story Dependencies

- **US1**: After Foundational — no other story dependency.
- **US2**: After Foundational — no other story dependency.
- **US3**: After US1 and US2 — adds pre-population to US1's form and "Edit" to US2's page.
- **US4**: After US2 — adds transparency section to US2's MyGoal page.

### Within Each Phase (parallel opportunities)

- T001 and T002 can run in parallel (different files).
- T006, T007, T008 can run in parallel (different DTO files).
- T017 (frontend API client) can run in parallel with T015–T016 (backend controller).
- T021 (backend GET endpoint) can run in parallel with T022–T025 (frontend MyGoal page).

---

## Parallel Execution Examples

### Foundational Phase
```
Parallel batch 1:  T001 (ActivityLevel.cs) + T002 (GoalType.cs)
Sequential:        T003 (UserGoalProfile.cs) → T004 (Config) + T005 (DbContext)
Sequential:        T006 → T007 + T008 (DTOs in parallel)
Sequential:        T009 (Validator) + T010 (Mappings) → T011 (Interface) → T012 (Service) → T013 (DI) → T014 (Migration)
```

### US1 Phase
```
Parallel batch:    T015 (Controller save endpoint) + T016 (preview endpoint) + T017 (frontend client)
Sequential:        T018 (form fields) → T019 (live preview) → T020 (submit handler)
```

### US2 Phase
```
Parallel batch:    T021 (GET endpoint) + T022 (frontend GET client)
Sequential:        T023 (MyGoal.jsx) → T024 (route) → T025 (nav link)
```

---

## Implementation Strategy

### MVP First (US1 + US2 only — full onboarding + view)

1. Complete Phase 2: Foundational
2. Complete Phase 3: US1 (onboarding interview, save, redirect)
3. Complete Phase 4: US2 (view MyGoal page)
4. **Stop and validate**: new user can complete interview and view their plan.
5. Ship or demo.

### Incremental Delivery

1. Foundational → Migration applied, service tested via Swagger/Postman.
2. US1 → First-time onboarding works end-to-end.
3. US2 → Returning users can view their goal.
4. US3 → Users can edit goals and see updated values.
5. US4 → Transparency section added for power users.
6. Polish → Edge cases, warnings, UI validation.

---

## Notes

- `[P]` tasks touch different files with no shared state — safe to implement concurrently.
- `[US#]` label maps each task to its user story for traceability.
- The existing `NutritionGoalsController` is untouched — no breaking changes to diary/tracking.
- Enum string values in frontend dropdowns must exactly match `contracts/user-goal-profile.md` (e.g. `"ModeratelyActive"`, `"LoseWeightModerate"`).
- EF migration (T014) must run **after** T004 and T005; verify the migration file generates a `UserGoalProfiles` table with a unique index on `UserId`.
