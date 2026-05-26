# Quickstart: Profile and Nutrition Goals

## Goal

Implement and verify the onboarding slice so an authenticated user can complete body-metric setup, save daily macro targets, resume incomplete setup later, and edit the saved values afterward.

## Prerequisites

- Authentication from Spec 002 is implemented and working
- Backend projects are available in `MacrosTrackerAPI/src`
- Frontend application is available in `MacrosTrackerWeb/src`
- Local database connection is configured for development
- JWT authentication is configured for local development

## Backend Work Outline

1. Extend `MacrosTrackerAPI/src/GymScan.Database/Entities/Auth/User.cs` and its configuration with body-metric fields and setup-state progression support.
2. Add a nutrition-goal entity, configuration, and migration under `MacrosTrackerAPI/src/GymScan.Database/`.
3. Create DTOs, validators, mappings, and constants under `MacrosTrackerAPI/src/GymScan.Services/Profile/` and `MacrosTrackerAPI/src/GymScan.Services/NutritionGoals/`.
4. Implement service-type-first orchestration in `BusinessServices/Profile`, `BusinessServices/NutritionGoals`, `RepoServices/Profile`, `RepoServices/NutritionGoals`, `CommandServices/Profile`, `CommandServices/NutritionGoals`, `QueryServices/Profile`, and `QueryServices/NutritionGoals`.
5. Add authenticated controllers for setup bootstrap, profile updates, and goal updates under `MacrosTrackerAPI/src/GymScan.API/Controllers/Profile/` and `MacrosTrackerAPI/src/GymScan.API/Controllers/NutritionGoals/`.
6. Keep repository access details inside `MacrosTrackerAPI/src/GymScan.Repository/` and service-layer repo services, with saves crossing the existing repository-layer unit-of-work boundary.
7. Keep every controller action thin and return the standard service-response envelope.

## Frontend Work Outline

1. Add onboarding pages or flows for profile setup and daily-goal setup inside `MacrosTrackerWeb/src/pages/`.
2. Add API client functions for setup summary, profile retrieval and save, and daily-goal retrieval and save.
3. Extend auth bootstrap or protected-route behavior so incomplete setup routes the user into onboarding until profile and goal setup are finished.
4. Provide editable starter-goal values that can be accepted or overridden before save.
5. Add a returning-user edit path so saved profile and goals can be reviewed and updated later.
6. Keep frontend parsing aligned with the backend `data` / `message` / `errorList` response envelope.

## Manual Verification Flow

1. Start the backend API.
2. Start the frontend app.
3. Sign in with a newly registered account whose setup is still incomplete.
4. Confirm the app routes into profile setup instead of treating the account as fully configured.
5. Save valid body metrics and confirm setup advances but still requires a daily goal.
6. Accept or edit the suggested daily targets and save the goal.
7. Confirm the account is now treated as fully configured.
8. Reopen or refresh the app and confirm saved profile and goal values are restored.
9. Update one or more profile or goal values later and confirm the new values replace the prior active values.
10. Submit invalid profile or goal values and confirm the system rejects them without corrupting saved data.

## Completion Check

This feature is ready for task generation when:
- The setup-summary, profile, and goal API contracts are implemented end to end
- Newly authenticated users with incomplete setup are routed into onboarding reliably
- Profile details and daily goals can be created and updated from the frontend
- Saved setup state is restored correctly for returning users
- Build and smoke validation pass for the implemented onboarding flows

## Validation Notes

- The repository standard for this project intentionally excludes backend unit-test projects and frontend test harnesses unless explicitly requested later.
- Build verification should include the backend solution after controller, service, entity, and migration changes are in place.
- Runtime verification should include a real local database and authenticated flow checks for setup bootstrap, profile save, and goal save.
- A frontend build may remain unavailable in this shell if `npm` is not present, so frontend validation may rely on code review plus backend smoke confirmation unless the environment changes.
