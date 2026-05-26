# Quickstart: Authentication and User Setup

## Goal

Implement and verify the authentication slice so a user can register, sign in, remain signed in across normal app use, and log out cleanly.

## Prerequisites

- Backend foundation from Phase 0 is available in `MacrosTrackerAPI/src`
- Frontend foundation from Phase 0 is available in `MacrosTrackerWeb/src`
- Local database connection is configured for development
- JWT settings are configured for local development

## Backend Work Outline

1. Add user-account and refresh-session entities under `MacrosTrackerAPI/src/GymScan.Database/Entities/Auth/`.
2. Extend `MacrosTrackerAPI/src/GymScan.Services/Auth/` with auth DTOs, validators, mappings, and constants.
3. Implement service-type-first auth orchestration in `BusinessServices/Auth`, `RepoServices/Auth`, `CommandServices/Auth`, and `QueryServices/Auth`.
4. Add database configurations and a migration for the auth tables in `MacrosTrackerAPI/src/GymScan.Database/`.
5. Implement password hashing, JWT issuance, session issuance, session renewal, and logout revocation behavior.
6. Keep controllers thin in `MacrosTrackerAPI/src/GymScan.API/Controllers/Auth/AuthController.cs` and protect current-user and logout endpoints with authentication.
7. Keep repository access in `MacrosTrackerAPI/src/GymScan.Repository/` with the unit-of-work save boundary registered in the same layer.

## Frontend Work Outline

1. Replace placeholder login and registration screens with working forms.
2. Extend the auth store to bootstrap persisted user state on app load.
3. Add client functions for register, login, refresh, logout, and current-user requests.
4. Add session-restore behavior on initial app load and when access expires during normal use.
5. Update protected-route handling so invalid sessions redirect cleanly to login.
6. Add onboarding-aware redirect logic after successful authentication.
7. Keep the frontend aligned with the backend `data` / `message` / `errorList` response envelope.

## Manual Verification Flow

1. Start the backend API.
2. Start the frontend app.
3. Register a new account from the public flow.
4. Confirm the user reaches an authenticated page and their setup status is available.
5. Refresh the browser and confirm the session is restored.
6. Log out and confirm protected pages redirect back to login.
7. Attempt sign-in with invalid credentials and confirm the error is clear and safe.

## Completion Check

This feature is ready for task generation when:
- The auth API contract is implemented end to end
- Registration and sign-in work from the frontend
- Session renewal works during normal use
- Logout revokes access cleanly
- Build and smoke validation pass for the implemented auth flows

## Validation Notes

- Backend solution build passes with the controller-based authentication implementation.
- Local development auth migration in `MacrosTrackerAPI/src/GymScan.Database/Migrations/` was applied successfully.
- Backend smoke testing passed for register, login, and current-user lookup using a real local database.
- The repository standard for this project intentionally excludes backend unit-test projects and frontend test harnesses unless explicitly requested later.
- Frontend API and auth pages are aligned with the backend service-response envelope, but a frontend build was not executed in this shell because `npm` is unavailable here.
