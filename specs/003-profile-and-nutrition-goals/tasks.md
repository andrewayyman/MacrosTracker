# Tasks: Profile and Nutrition Goals

**Input**: Design documents from `/specs/003-profile-and-nutrition-goals/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Validation**: This repository currently validates the onboarding slice with `dotnet build` plus manual smoke checks. No backend unit-test project or frontend test harness is part of the current standard.

**Organization**: Tasks are grouped by user story to preserve independent delivery and traceability.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `MacrosTrackerAPI/src/`
- **Frontend**: `MacrosTrackerWeb/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the profile and nutrition-goal slice structure across the current modular monolith and frontend app shell.

- [X] T001 Create profile and nutrition-goal folders for DTOs, validators, and mappings in `MacrosTrackerAPI/src/GymScan.Services/Profile/` and `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/`
- [X] T002 [P] Create service-type-first folders in `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Profile/`, `BusinessServices/NutritionGoals/`, `CommandServices/Profile/`, `CommandServices/NutritionGoals/`, `QueryServices/Profile/`, `QueryServices/NutritionGoals/`, `RepoServices/Profile/`, and `RepoServices/NutritionGoals/`
- [X] T003 [P] Create controller folders in `MacrosTrackerAPI/src/GymScan.API/Controllers/Profile/` and `MacrosTrackerAPI/src/GymScan.API/Controllers/NutritionGoals/`
- [X] T004 [P] Create frontend onboarding flow files in `MacrosTrackerWeb/src/pages/ProfileSetup.jsx`, `MacrosTrackerWeb/src/pages/GoalSetup.jsx`, `MacrosTrackerWeb/src/api/profileClient.js`, `MacrosTrackerWeb/src/api/nutritionGoalsClient.js`, and `MacrosTrackerWeb/src/utils/setupStatus.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared persistence, service contracts, and routing foundation required before any onboarding story can ship.

- [X] T005 Extend the user entity with profile fields in `MacrosTrackerAPI/src/GymScan.Database/Entities/Auth/User.cs`
- [X] T006 [P] Add supporting nutrition-goal domain types in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/DailyNutritionGoal.cs` and `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/GoalSource.cs`
- [X] T007 [P] Add EF Core configurations for profile fields and daily goals in `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Auth/UserConfiguration.cs` and `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Nutrition/DailyNutritionGoalConfiguration.cs`
- [X] T008 Update the database context for profile and goal persistence in `MacrosTrackerAPI/src/GymScan.Database/Data/AppDbContext.cs`
- [X] T009 [P] Add the profile-and-goals migration in `MacrosTrackerAPI/src/GymScan.Database/Migrations/`
- [X] T010 [P] Create shared profile and setup DTOs in `MacrosTrackerAPI/src/GymScan.Services/Profile/Dtos/Responses/ProfileDetailsDto.cs`, `SetupSummaryDto.cs`, and `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/Dtos/Responses/DailyNutritionGoalDto.cs`
- [X] T011 [P] Create shared profile and goal repo-service contracts in `MacrosTrackerAPI/src/GymScan.Services/RepoServices/Profile/IProfileRepoService.cs` and `MacrosTrackerAPI/src/GymScan.Services/RepoServices/NutritionGoals/INutritionGoalRepoService.cs`
- [X] T012 Register profile and nutrition-goal dependency injection in `MacrosTrackerAPI/src/GymScan.Services/DependencyInjection.cs`, `MacrosTrackerAPI/src/GymScan.Database/DependencyInjection.cs`, and `MacrosTrackerAPI/src/GymScan.API/Program.cs`
- [X] T013 [P] Add frontend route and guard scaffolding for onboarding in `MacrosTrackerWeb/src/App.jsx`, `MacrosTrackerWeb/src/components/ProtectedRoute.jsx`, and `MacrosTrackerWeb/src/store/authStore.js`

**Checkpoint**: Foundation ready for user-story implementation.

---

## Phase 3: User Story 1 - Complete Personal Setup After First Login (Priority: P1)

**Goal**: Let a newly authenticated user complete profile and body-metric setup, and persist the account as profile-complete but still goal-pending.

**Independent Test**: Sign in with an account at `AccountCreated`, open the app, save valid body metrics, and confirm the saved profile is returned while the account remains incomplete until goals are added.

- [X] T014 [P] [US1] Add profile request DTO and validator in `MacrosTrackerAPI/src/GymScan.Services/Profile/Dtos/Requests/UpsertProfileRequestDto.cs` and `MacrosTrackerAPI/src/GymScan.Services/Profile/Validators/UpsertProfileRequestValidator.cs`
- [X] T015 [P] [US1] Add profile mapping helpers in `MacrosTrackerAPI/src/GymScan.Services/Profile/Mappings/ProfileMappingExtensions.cs`
- [X] T016 [P] [US1] Implement profile repository access in `MacrosTrackerAPI/src/GymScan.Services/RepoServices/Profile/ProfileRepoService.cs`
- [X] T017 [US1] Implement profile save orchestration and setup-status progression in `MacrosTrackerAPI/src/GymScan.Services/CommandServices/Profile/ProfileCommandService.cs` and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Profile/ProfileBusinessService.cs`
- [X] T018 [US1] Expose authenticated profile get and update endpoints in `MacrosTrackerAPI/src/GymScan.API/Controllers/Profile/ProfileController.cs`
- [X] T019 [P] [US1] Implement frontend profile client and setup-status helpers in `MacrosTrackerWeb/src/api/profileClient.js` and `MacrosTrackerWeb/src/utils/setupStatus.js`
- [X] T020 [US1] Build the first-time profile setup page in `MacrosTrackerWeb/src/pages/ProfileSetup.jsx`
- [X] T021 [US1] Route incomplete users into profile setup in `MacrosTrackerWeb/src/store/authStore.js`, `MacrosTrackerWeb/src/components/ProtectedRoute.jsx`, and `MacrosTrackerWeb/src/App.jsx`

**Checkpoint**: Newly registered users can complete personal setup and resume from the correct onboarding step.

---

## Phase 4: User Story 2 - Define Daily Macro Targets (Priority: P2)

**Goal**: Let a user with completed profile data create their active daily calorie and macro goals from suggested or custom values.

**Independent Test**: Start from a user at `ProfilePending`, open the goal step, accept or edit the suggested targets, save them, and confirm the active daily goal is persisted and the account advances to `ProfileCompleted`.

- [X] T022 [P] [US2] Add daily-goal request DTO and validator in `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/Dtos/Requests/UpsertDailyNutritionGoalRequestDto.cs` and `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/Validators/UpsertDailyNutritionGoalRequestValidator.cs`
- [X] T023 [P] [US2] Add daily-goal mapping helpers in `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/Mappings/NutritionGoalMappingExtensions.cs`
- [X] T024 [P] [US2] Implement nutrition-goal repository access in `MacrosTrackerAPI/src/GymScan.Services/RepoServices/NutritionGoals/NutritionGoalRepoService.cs`
- [X] T025 [US2] Implement goal suggestion and save orchestration in `MacrosTrackerAPI/src/GymScan.Services/QueryServices/NutritionGoals/NutritionGoalQueryService.cs`, `MacrosTrackerAPI/src/GymScan.Services/CommandServices/NutritionGoals/NutritionGoalCommandService.cs`, and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/NutritionGoals/NutritionGoalBusinessService.cs`
- [X] T026 [US2] Expose authenticated daily-goal get and update endpoints in `MacrosTrackerAPI/src/GymScan.API/Controllers/NutritionGoals/NutritionGoalsController.cs`
- [X] T027 [P] [US2] Implement frontend goal API wiring in `MacrosTrackerWeb/src/api/nutritionGoalsClient.js` and `MacrosTrackerWeb/src/utils/setupStatus.js`
- [X] T028 [US2] Build the daily-goal onboarding page with suggested and editable values in `MacrosTrackerWeb/src/pages/GoalSetup.jsx`
- [X] T029 [US2] Connect onboarding progression from profile completion to goal completion in `MacrosTrackerWeb/src/store/authStore.js`, `MacrosTrackerWeb/src/components/ProtectedRoute.jsx`, and `MacrosTrackerWeb/src/App.jsx`

**Checkpoint**: Users can save an active daily goal and finish onboarding.

---

## Phase 5: User Story 3 - Review And Update Setup Later (Priority: P3)

**Goal**: Let returning users retrieve their saved profile and goals and update either independently after onboarding is complete.

**Independent Test**: Sign in with a user at `ProfileCompleted`, load the saved profile and goal screens, change profile values and goal values independently, and confirm the new values are returned on refresh.

- [X] T030 [P] [US3] Implement setup-summary query and response composition in `MacrosTrackerAPI/src/GymScan.Services/QueryServices/Profile/ProfileQueryService.cs` and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Profile/ProfileBusinessService.cs`
- [X] T031 [US3] Expose the authenticated setup-summary endpoint in `MacrosTrackerAPI/src/GymScan.API/Controllers/Profile/ProfileController.cs`
- [X] T032 [P] [US3] Add frontend setup bootstrap and edit-state loading in `MacrosTrackerWeb/src/api/profileClient.js`, `MacrosTrackerWeb/src/api/nutritionGoalsClient.js`, and `MacrosTrackerWeb/src/store/authStore.js`
- [X] T033 [US3] Add returning-user profile edit behavior in `MacrosTrackerWeb/src/pages/ProfileSetup.jsx` and `MacrosTrackerWeb/src/pages/Dashboard.jsx`
- [X] T034 [US3] Add returning-user goal edit behavior in `MacrosTrackerWeb/src/pages/GoalSetup.jsx` and `MacrosTrackerWeb/src/pages/Dashboard.jsx`

**Checkpoint**: Returning users can review and update saved setup data without repeating the full onboarding flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align contracts, docs, and manual verification around the completed onboarding slice.

- [X] T035 [P] Update the onboarding API contract in `specs/003-profile-and-nutrition-goals/contracts/profile-goals-api.openapi.yaml`
- [X] T036 [P] Update quickstart and validation notes in `specs/003-profile-and-nutrition-goals/quickstart.md`
- [X] T037 [P] Align plan and task execution notes in `specs/003-profile-and-nutrition-goals/plan.md` and `specs/003-profile-and-nutrition-goals/tasks.md`
- [X] T038 Record final build and manual smoke-validation results in `specs/003-profile-and-nutrition-goals/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and the profile state created in User Story 1
- **User Story 3 (Phase 5)**: Depends on Foundational completion plus saved profile and goal data from User Stories 1 and 2
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: MVP slice for onboarding start
- **User Story 2 (P2)**: Builds on the profile-complete state produced by User Story 1
- **User Story 3 (P3)**: Builds on saved profile and goal data from User Stories 1 and 2

### Within Each User Story

- Request/response DTOs and validators should exist before orchestration services are wired
- Repo services should encapsulate repository access before business services compose the flow
- Controllers should be added only after the service contracts are stable
- Frontend API wiring should exist before page and route integration

### Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel
- Foundational tasks marked `[P]` can run in parallel after entity direction is agreed
- In User Story 1, DTO/validator, mappings, repo-service, and frontend API helper work can run in parallel
- In User Story 2, DTO/validator, mappings, repo-service, and frontend API helper work can run in parallel
- In User Story 3, setup-summary backend work and frontend bootstrap preparation can run in parallel until integration

---

## Parallel Example: User Story 1

```bash
# Launch backend support work for User Story 1 together:
Task: "Add profile request DTO and validator in MacrosTrackerAPI/src/GymScan.Services/Profile/Dtos/Requests/UpsertProfileRequestDto.cs and MacrosTrackerAPI/src/GymScan.Services/Profile/Validators/UpsertProfileRequestValidator.cs"
Task: "Add profile mapping helpers in MacrosTrackerAPI/src/GymScan.Services/Profile/Mappings/ProfileMappingExtensions.cs"
Task: "Implement profile repository access in MacrosTrackerAPI/src/GymScan.Services/RepoServices/Profile/ProfileRepoService.cs"

# Launch frontend support work for User Story 1 together:
Task: "Implement frontend profile client and setup-status helpers in MacrosTrackerWeb/src/api/profileClient.js and MacrosTrackerWeb/src/utils/setupStatus.js"
Task: "Build the first-time profile setup page in MacrosTrackerWeb/src/pages/ProfileSetup.jsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate that incomplete users are routed into profile setup and can save body metrics

### Incremental Delivery

1. Deliver User Story 1 and validate first-time profile completion
2. Deliver User Story 2 and validate active-goal creation plus onboarding completion
3. Deliver User Story 3 and validate returning-user review and edit flows
4. Finish with contract, docs, and smoke-validation alignment

### Validation Strategy

1. Run `dotnet build MacrosTrackerAPI\\MacrosTrackerAPI.slnx`
2. Apply the profile-and-goals migration in the development database
3. Smoke test profile bootstrap, profile save, daily-goal save, and returning-user updates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map tasks to specific user stories for traceability
- Each user story should be independently completable and manually testable
- Repository access stays behind repo services, and controllers remain thin
