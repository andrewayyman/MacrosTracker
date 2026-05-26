# Implementation Plan: Authentication and User Setup

**Branch**: `[002-authentication-and-user-setup]` | **Date**: 2026-05-25 | **Spec**: [spec.md](/C:/Users/Andrew.Onsy/Andrew/MacrosTracker/specs/002-authentication-and-user-setup/spec.md)

**Input**: Feature specification from `/specs/002-authentication-and-user-setup/spec.md`

**Note**: This plan reflects the implemented controller-based auth slice and the current repository conventions.

## Summary

Add the first real authenticated user flow for GymScan so visitors can register, sign in, stay signed in across normal app use, and log out cleanly. The implementation extends the modular backend monolith with auth persistence, thin REST controllers, repository-backed service orchestration, and a React frontend with working login, registration, session bootstrap, and protected-route behavior.

## Technical Context

**Language/Version**: C# with .NET 10 for the backend, JavaScript with React 18 for the frontend

**Primary Dependencies**: ASP.NET Core controllers, JWT bearer authentication, Entity Framework Core, SQL Server provider, Serilog, React Router, Axios, Zustand, TanStack React Query

**Storage**: SQL Server for account and session data, browser local storage for current client session state

**Testing**: Solution builds plus manual smoke verification for register, login, refresh, logout, and current-user flows. Per the current repository standard, no backend unit-test project or frontend test harness is included.

**Target Platform**: Web application used primarily on mobile browsers and desktop browsers, backed by a hosted HTTP API

**Project Type**: Web application with separate backend API and frontend single-page application

**Performance Goals**: Sign-in and registration responses feel immediate under normal load, authenticated app restore completes in under 10 seconds, non-AI auth API responses remain aligned with the sub-200ms target from business context

**Constraints**: Passwords must never be stored in plain text, long-lived session renewal must be revocable, auth failures must return safe and consistent messages, protected pages must never remain visible after invalid-session detection

**Scale/Scope**: Initial v1 scale of roughly 1,000 active users, one primary end-user role, email-and-password authentication only for this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The current constitution file at `.specify/memory/constitution.md` is still an unfilled template, so there are no enforceable project principles or gates defined yet.

**Gate Result**: PASS

**Pre-Phase-0 Notes**:
- No explicit constitution constraints block this feature.
- Existing project structure from Phase 0 already matches the feature scope.

**Post-Phase-1 Recheck**:
- Research, data model, contracts, and quickstart artifacts do not conflict with any defined constitution because none is ratified yet.
- No complexity exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/002-authentication-and-user-setup/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- auth-api.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
MacrosTrackerAPI/
|-- MacrosTrackerAPI.slnx
`-- src/
    |-- GymScan.API/
    |   |-- Controllers/
    |   |-- Middleware/
    |   |-- Services/
    |   `-- Program.cs
    |-- GymScan.Database/
    |   |-- Data/
    |   |-- Entities/
    |   `-- Migrations/
    |-- GymScan.Repository/
    |   |-- Implementations/
    |   `-- Interfaces/
    `-- GymScan.Services/
        |-- Auth/
        |-- BusinessServices/
        |-- CommandServices/
        |-- QueryServices/
        |-- RepoServices/
        `-- Security/

MacrosTrackerWeb/
|-- package.json
`-- src/
    |-- api/
    |-- components/
    |-- hooks/
    |-- pages/
    |-- store/
    `-- utils/
```

**Structure Decision**: Keep the existing split web-application structure. Implement authentication persistence in `GymScan.Database`, repository abstractions and the unit-of-work save boundary in `GymScan.Repository`, and auth orchestration in `GymScan.Services` with service-type-first folders such as `BusinessServices/Auth`, `RepoServices/Auth`, `CommandServices/Auth`, and `QueryServices/Auth`. Use thin controllers in `GymScan.API`. Keep validation to build and manual smoke checks rather than introducing test projects.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this feature.
