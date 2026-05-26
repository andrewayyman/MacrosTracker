<!--
SYNC IMPACT REPORT
==================
Version change: [placeholder] → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A
Templates updated:
  - .specify/templates/plan-template.md ✅ — Constitution Check gates align with principles below
  - .specify/templates/spec-template.md ✅ — No structural changes required
  - .specify/templates/tasks-template.md ✅ — No structural changes required
  - No commands/ directory found — skipped
Follow-up TODOs: None. All placeholders resolved.
-->

# GymScan (MacrosTracker) Constitution

## Core Principles

### I. N-tier Modular Monolith

The backend MUST follow a strict 4-project layered structure:

- `GymScan.API` — HTTP presentation only (controllers, middleware, DI wiring).
- `GymScan.Database` — EF Core DbContext, entity configurations, migrations.
- `GymScan.Repository` — Generic repository, unit-of-work, query composition.
- `GymScan.Services` — All application and business logic.

No additional projects MUST be introduced without a documented, constitution-approved justification. Violations that bypass this structure require a Complexity Tracking entry in the implementation plan.

**Rationale**: Enforcing a fixed layer count prevents architectural drift as the product adds auth, scanning, diary, and analytics features across many contributors.

### II. Thin Controllers, No Logic Leakage

Controllers MUST contain only: route declaration, parameter binding, a single service call, and returning the response. Controllers MUST NOT contain: business logic, validation logic, mapping logic, query composition, or direct repository access.

Business services are the first point of orchestration. Repo services hide all query composition from business services.

**Rationale**: Business logic in controllers is untestable, leaks concerns, and creates inconsistent behavior across endpoints. Every feature added must stay within this contract.

### III. CQRS-style Service Separation (No MediatR)

Write operations MUST be handled by explicit command services. Read operations MUST be handled by explicit query services. Business services orchestrate both and coordinate the unit-of-work save.

Service implementation folders MUST follow the pattern: `{ServiceType}/{Domain}`. Examples: `BusinessServices/Auth`, `CommandServices/Nutrition`, `QueryServices/Scan`, `RepoServices/User`.

MediatR MUST NOT be introduced. The project uses direct, interface-backed DI instead.

**Rationale**: CQRS separation enforces intent clarity and makes write/read paths independently evolvable. Avoiding MediatR keeps the stack simple and fully traceable without a mediator abstraction layer.

### IV. Standard Response Contract

Every API response MUST use the envelope `{ Data, Message, ErrorList }`. No endpoint may return a raw object, plain string, or custom shape outside this envelope.

Global exception handling MUST intercept unhandled exceptions and return this envelope with a standardized error message rather than raw framework output.

**Rationale**: A stable response contract lets the frontend rely on a single deserialization shape and prevents each feature team from inventing a custom response format.

### V. Simplicity — No Premature Complexity

Unit tests and frontend test harnesses MUST NOT be added unless the feature specification explicitly requests them. Abstractions beyond the four-layer structure are not permitted without justification. YAGNI applies: implement only what the current spec requires.

EF Core global soft-delete query filters MUST be used for deletable entities rather than physical deletes or manual filter code.

**Rationale**: Premature abstraction and test scaffolding add maintenance cost without corresponding product value at this stage. Complexity must be justified against the current spec, not hypothetical future needs.

## Technology Stack

- **Backend**: .NET / C# with ASP.NET Core, EF Core, SQL Server.
- **Frontend**: React with Vite, TypeScript, React Router, Axios, Zustand, TanStack Query.
- **Database**: SQL Server. One EF Core entity configuration file per entity. Migrations live in `GymScan.Database`.
- **Authentication**: JWT bearer tokens with refresh. Configuration loaded from `appsettings`.
- **AI Provider**: External scanning provider configured via `appsettings` section (key injected per spec).

The stack MUST NOT change without a constitution amendment. New dependencies MUST be evaluated against the existing stack before adoption.

## Development Workflow

- Features MUST be developed on a dedicated branch following the naming convention `{###}-{feature-slug}`.
- Every feature MUST have a corresponding spec (`spec.md`) and implementation plan (`plan.md`) before implementation begins.
- The implementation plan MUST include a Constitution Check gate that verifies alignment with all five principles before Phase 0 research begins.
- Complexity Tracking entries MUST be logged in `plan.md` whenever a principle is intentionally deviated from, with a documented justification and simpler alternative considered.
- No unit tests or test harnesses are generated unless the feature spec explicitly lists them in requirements.

## Governance

This constitution supersedes all other development practices and conventions within the MacrosTracker repository. In case of conflict, the constitution takes precedence.

**Amendment procedure**:
1. Author proposes a change with a rationale and impact analysis.
2. Change is documented as a pull request to `.specify/memory/constitution.md`.
3. Version is bumped according to semantic versioning (MAJOR: principle removal/redefinition; MINOR: new principle or section; PATCH: wording/clarification).
4. All affected templates and CLAUDE.md MUST be updated in the same PR.
5. A migration plan MUST be provided if existing feature branches are impacted.

**Compliance review**: Every implementation plan's Constitution Check section enforces compliance before work begins. Deviations require Complexity Tracking entries.

**Version**: 1.0.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
