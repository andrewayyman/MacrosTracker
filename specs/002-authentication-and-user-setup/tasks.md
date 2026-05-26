# Tasks: Authentication and User Setup

**Input**: Design documents from `/specs/002-authentication-and-user-setup/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Validation**: This repository currently validates the auth slice with `dotnet build` plus manual smoke checks. No backend unit-test project or frontend test harness is part of the current standard.

**Organization**: Tasks are grouped by user story to preserve independent delivery and traceability.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `MacrosTrackerAPI/src/`
- **Frontend**: `MacrosTrackerWeb/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the controller-based auth slice and the service-type-first folder structure.

- [x] T001 Create and wire the modular backend projects in `MacrosTrackerAPI/src/GymScan.API/`, `MacrosTrackerAPI/src/GymScan.Database/`, `MacrosTrackerAPI/src/GymScan.Repository/`, and `MacrosTrackerAPI/src/GymScan.Services/`
- [x] T002 [P] Create auth folders for DTOs and validators under `MacrosTrackerAPI/src/GymScan.Services/Auth/` and type-first service folders under `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Auth/`, `CommandServices/Auth/`, `QueryServices/Auth/`, and `RepoServices/Auth/`
- [x] T003 [P] Create frontend auth flow scaffolding in `MacrosTrackerWeb/src/api/`, `MacrosTrackerWeb/src/hooks/`, `MacrosTrackerWeb/src/pages/`, `MacrosTrackerWeb/src/store/`, and `MacrosTrackerWeb/src/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared auth foundation required before each user story flow.

- [x] T004 Create auth entities in `MacrosTrackerAPI/src/GymScan.Database/Entities/Auth/User.cs`, `RefreshSession.cs`, and `SetupStatus.cs`
- [x] T005 [P] Add auth persistence wiring in `MacrosTrackerAPI/src/GymScan.Database/Data/AppDbContext.cs` and `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Auth/`
- [x] T006 [P] Add auth migration and seed hooks in `MacrosTrackerAPI/src/GymScan.Database/Migrations/` and `MacrosTrackerAPI/src/GymScan.Database/Seeds/`
- [x] T007 Implement generic repository and repository-layer unit-of-work wiring in `MacrosTrackerAPI/src/GymScan.Repository/Implementations/`, `Interfaces/`, and `DependencyInjection.cs`
- [x] T008 [P] Add shared response, config, security, and current-user support in `MacrosTrackerAPI/src/GymScan.Services/Common/`, `Configuration/`, `Security/`, and `MacrosTrackerAPI/src/GymScan.API/Services/CurrentUserService.cs`
- [x] T009 Register controller, auth, repository, and database wiring in `MacrosTrackerAPI/src/GymScan.API/Program.cs`

**Checkpoint**: Foundation ready for user-story implementation.

---

## Phase 3: User Story 1 - Create An Account And Enter The App (Priority: P1)

**Goal**: Allow a new user to register, receive an authenticated session immediately, and enter the protected app.

- [x] T010 [P] [US1] Add registration DTO and validator in `MacrosTrackerAPI/src/GymScan.Services/Auth/Dtos/Requests/RegisterRequestDto.cs` and `MacrosTrackerAPI/src/GymScan.Services/Auth/Validators/RegisterRequestValidator.cs`
- [x] T011 [P] [US1] Add registration mapping and duplicate-email repo logic in `MacrosTrackerAPI/src/GymScan.Services/Auth/Mappings/AuthMappingExtensions.cs` and `MacrosTrackerAPI/src/GymScan.Services/RepoServices/Auth/AuthRepoService.cs`
- [x] T012 [US1] Implement registration orchestration in `MacrosTrackerAPI/src/GymScan.Services/CommandServices/Auth/AuthCommandService.cs` and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Auth/AuthBusinessService.cs`
- [x] T013 [US1] Expose the register transport endpoint in `MacrosTrackerAPI/src/GymScan.API/Controllers/Auth/AuthController.cs`
- [x] T014 [P] [US1] Implement frontend registration flow in `MacrosTrackerWeb/src/api/authClient.js`, `MacrosTrackerWeb/src/pages/Register.jsx`, and `MacrosTrackerWeb/src/store/authStore.js`

**Checkpoint**: New accounts can be created end to end.

---

## Phase 4: User Story 2 - Return Without Repeated Login Friction (Priority: P2)

**Goal**: Allow existing users to sign in and restore their session seamlessly on refresh or revisit.

- [x] T015 [P] [US2] Add login and refresh DTOs plus validators in `MacrosTrackerAPI/src/GymScan.Services/Auth/Dtos/Requests/LoginRequestDto.cs`, `RefreshRequestDto.cs`, and `MacrosTrackerAPI/src/GymScan.Services/Auth/Validators/`
- [x] T016 [P] [US2] Add login and refresh repository support in `MacrosTrackerAPI/src/GymScan.Services/RepoServices/Auth/AuthRepoService.cs`
- [x] T017 [US2] Implement login and refresh orchestration in `MacrosTrackerAPI/src/GymScan.Services/CommandServices/Auth/AuthCommandService.cs`, `MacrosTrackerAPI/src/GymScan.Services/QueryServices/Auth/AuthQueryService.cs`, and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Auth/AuthBusinessService.cs`
- [x] T018 [US2] Expose login and refresh controller actions in `MacrosTrackerAPI/src/GymScan.API/Controllers/Auth/AuthController.cs`
- [x] T019 [P] [US2] Implement frontend login, refresh, and bootstrap behavior in `MacrosTrackerWeb/src/api/authClient.js`, `MacrosTrackerWeb/src/hooks/useAuthBootstrap.js`, `MacrosTrackerWeb/src/store/authStore.js`, and `MacrosTrackerWeb/src/pages/Login.jsx`

**Checkpoint**: Returning users can sign in and restore valid sessions.

---

## Phase 5: User Story 3 - Exit Cleanly And Recover From Invalid Sessions (Priority: P3)

**Goal**: Let users log out cleanly and recover predictably from expired or invalid sessions while retrieving their own account summary when authenticated.

- [x] T020 [P] [US3] Add logout request and current-user response support in `MacrosTrackerAPI/src/GymScan.Services/Auth/Dtos/Requests/LogoutRequestDto.cs`, `MacrosTrackerAPI/src/GymScan.Services/Auth/Dtos/Responses/CurrentUserDto.cs`, and `MacrosTrackerAPI/src/GymScan.Services/RepoServices/Auth/AuthRepoService.cs`
- [x] T021 [US3] Implement logout and current-user orchestration in `MacrosTrackerAPI/src/GymScan.Services/CommandServices/Auth/AuthCommandService.cs`, `MacrosTrackerAPI/src/GymScan.Services/QueryServices/Auth/AuthQueryService.cs`, and `MacrosTrackerAPI/src/GymScan.Services/BusinessServices/Auth/AuthBusinessService.cs`
- [x] T022 [US3] Expose logout and me controller actions in `MacrosTrackerAPI/src/GymScan.API/Controllers/Auth/AuthController.cs`
- [x] T023 [P] [US3] Implement frontend logout and unauthorized-session recovery in `MacrosTrackerWeb/src/api/client.js`, `MacrosTrackerWeb/src/components/ProtectedRoute.jsx`, `MacrosTrackerWeb/src/store/authStore.js`, and `MacrosTrackerWeb/src/pages/Dashboard.jsx`

**Checkpoint**: Authenticated users can view themselves, log out, and recover from invalid sessions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align documentation, contracts, configuration, and final validation with the implemented architecture.

- [x] T024 [P] Update auth API contract and quickstart notes in `specs/002-authentication-and-user-setup/contracts/auth-api.openapi.yaml` and `specs/002-authentication-and-user-setup/quickstart.md`
- [x] T025 [P] Align local development config in `MacrosTrackerAPI/src/GymScan.API/appsettings.Development.json` and `MacrosTrackerWeb/.env.example`
- [x] T026 [P] Standardize architecture guidance in `AGENTS.md` and `CLAUDE.md`
- [x] T027 Record final build and smoke-validation notes in `specs/002-authentication-and-user-setup/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion
- **User Story 3 (Phase 5)**: Depends on Foundational completion and the session model from User Story 2
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: MVP slice
- **User Story 2 (P2)**: Builds on shared auth entities and session infrastructure
- **User Story 3 (P3)**: Builds on the authenticated session model introduced in User Story 2

### Within Each User Story

- DTOs and validators should exist before orchestration services are wired
- Repo services should encapsulate repository access before business services compose the flow
- Controllers should be added only after the service contracts are stable
- Frontend API wiring should exist before page and store integration

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational work
2. Deliver User Story 1
3. Validate registration end to end

### Incremental Delivery

1. Add User Story 1 and validate registration
2. Add User Story 2 and validate login plus session restore
3. Add User Story 3 and validate logout plus invalid-session recovery
4. Finish with contract, config, and documentation alignment

### Validation Strategy

1. Run `dotnet build MacrosTrackerAPI\\MacrosTrackerAPI.slnx`
2. Apply the auth migration in the development database
3. Smoke test register, login, refresh, logout, and `GET /api/auth/me`

---

## Notes

- Completed tasks are marked `[x]` to reflect the implemented state of the feature
- Service implementations are organized by service type first, then domain
- Repository access stays behind repo services, and controllers remain thin
