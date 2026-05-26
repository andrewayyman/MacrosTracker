# Implementation Plan: Profile and Nutrition Goals

**Branch**: `[003-profile-and-nutrition-goals]` | **Date**: 2026-05-26 | **Spec**: [spec.md](/C:/Users/Andrew.Onsy/Andrew/MacrosTracker/specs/003-profile-and-nutrition-goals/spec.md)

**Input**: Feature specification from `/specs/003-profile-and-nutrition-goals/spec.md`

**Note**: This plan reflects the current controller-based modular monolith and the repository conventions already established in the project.

## Summary

Add the first post-auth onboarding slice so authenticated users can complete their body-metric profile, receive or edit starter macro targets, and keep those values updated later. The implementation extends the existing auth-backed monolith with profile and goal persistence, thin REST controllers, business-service orchestration, repo services for data access, and frontend onboarding screens that can resume incomplete setup cleanly.

## Technical Context

**Language/Version**: C# with .NET 10 for the backend, JavaScript with React 18 for the frontend

**Primary Dependencies**: ASP.NET Core controllers, JWT bearer authentication, Entity Framework Core, SQL Server provider, FluentValidation, Serilog, React Router, Axios, Zustand, TanStack React Query

**Storage**: SQL Server for user profile details and daily goal data, browser local storage for authenticated client session state

**Testing**: Solution builds plus manual smoke verification for setup bootstrap, profile save, goal save, and later profile/goal edits. Per the current repository standard, no backend unit-test project or frontend test harness is included.

**Target Platform**: Web application used primarily on mobile browsers and desktop browsers, backed by a hosted HTTP API

**Project Type**: Web application with separate backend API and frontend single-page application

**Performance Goals**: Profile and goal reads or saves feel immediate under normal load, onboarding restore completes in under 10 seconds, and non-AI setup endpoints remain aligned with the sub-200ms target from business context

**Constraints**: Authentication is required for every endpoint in this feature, controllers must stay thin, all service methods must return the standard `Data` / `Message` / `ErrorList` wrapper, invalid profile or goal submissions must never partially overwrite saved data, and the repository standard still excludes automated test projects

**Scale/Scope**: Initial v1 scale of roughly 1,000 active users, one primary end-user role, one active daily goal per user, and onboarding limited to profile completion plus nutrition-target setup rather than advanced coaching

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The current constitution file at `.specify/memory/constitution.md` is still an unfilled template, so there are no enforceable project principles or gates defined yet.

**Gate Result**: PASS

**Pre-Phase-0 Notes**:
- No explicit constitution constraints block this feature.
- The existing modular monolith structure already supports adding this slice without architectural exceptions.

**Post-Phase-1 Recheck**:
- Research, data model, contracts, and quickstart artifacts do not conflict with any ratified constitution because none is currently defined.
- No complexity exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/003-profile-and-nutrition-goals/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- profile-goals-api.openapi.yaml
`-- tasks.md
```

### Source Code (repository root)

```text
MacrosTrackerAPI/
|-- MacrosTrackerAPI.slnx
`-- src/
    |-- GymScan.API/
    |   |-- Attributes/
    |   |-- Controllers/
    |   |   |-- Auth/
    |   |   |-- Profile/
    |   |   `-- NutritionGoals/
    |   |-- Middleware/
    |   |-- Services/
    |   `-- Program.cs
    |-- GymScan.Database/
    |   |-- Data/
    |   |-- Entities/
    |   |   |-- Auth/
    |   |   `-- Nutrition/
    |   |-- Migrations/
    |   `-- Seeds/
    |-- GymScan.Repository/
    |   |-- Implementations/
    |   `-- Interfaces/
    `-- GymScan.Services/
        |-- Auth/
        |-- Profile/
        |-- NutritionGoals/
        |-- BusinessServices/
        |   |-- Profile/
        |   `-- NutritionGoals/
        |-- CommandServices/
        |   |-- Profile/
        |   `-- NutritionGoals/
        |-- QueryServices/
        |   |-- Profile/
        |   `-- NutritionGoals/
        |-- RepoServices/
        |   |-- Profile/
        |   `-- NutritionGoals/
        |-- Common/
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

**Structure Decision**: Keep the existing split web-application structure. Extend the current `User` entity for body-metric fields, add a dedicated nutrition-goal entity in the database layer, route all profile and goal orchestration through service-type-first business, command, query, and repo services, and expose the feature through thin authenticated controllers. Keep validation to build verification and manual smoke flows rather than adding test projects.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are required for this feature.
