# Research: Authentication and User Setup

## Decision 1: Use email-and-password authentication with access-token plus refresh-session flow

**Rationale**: The business context explicitly calls for JWT auth, seamless return visits, and protected pages. A short-lived access token paired with a longer-lived session renewal credential gives the right balance of usability and revocability for a mobile-friendly web app.

**Alternatives considered**:
- Server-only cookie session: simpler on some fronts, but less aligned with the existing frontend token scaffolding and current API wiring.
- Social sign-in providers: not needed for v1 and would expand scope and dependency risk.

## Decision 2: Store hashed passwords and hashed renewal credentials in persistent storage

**Rationale**: The business context requires that passwords are never stored in plain text and that refresh tokens are stored hashed in the database. Hashing both password secrets and renewal credentials limits damage if the persistence layer is exposed.

**Alternatives considered**:
- Storing raw refresh tokens: rejected because it weakens session-security posture.
- Stateless refresh without persistence: rejected because logout and revocation become much harder to enforce cleanly.

## Decision 3: Treat onboarding state as a first-class account attribute

**Rationale**: The spec requires the app to know whether a new user has only created an account or has also completed later nutrition setup. Persisting a lightweight setup-status field allows the frontend to route new users consistently after sign-in and page refresh.

**Alternatives considered**:
- Inferring setup completion from missing future profile fields: workable later, but too implicit for the first auth slice.
- No onboarding marker at all: rejected because it pushes routing ambiguity into later features.

## Decision 4: Expose a compact auth API surface with register, login, refresh, logout, and current-user endpoints

**Rationale**: These five endpoints cover the full lifecycle described in the spec without pulling password recovery, email verification, or account deletion into the current slice. They also match the frontend app shell that already distinguishes public and protected routes.

**Alternatives considered**:
- One combined authenticate endpoint: rejected because registration and sign-in have different validation and business rules.
- Separate onboarding API in this feature: rejected because onboarding content belongs to the later profile and goals specs.

## Decision 5: Keep client session state in the existing auth store and local storage, with a bootstrap check on app start

**Rationale**: The frontend already has Zustand auth state, token persistence helpers, and an Axios interceptor for unauthorized responses. Extending that foundation is the lowest-risk path and supports refresh-on-reopen behavior expected in the business context.

**Alternatives considered**:
- Full server-driven session only: rejected because it would require reworking the current frontend foundation.
- In-memory-only auth state: rejected because it would force users to log in again on refresh.

## Decision 6: Validate the auth slice with solution builds and live smoke checks instead of adding automated test projects

**Rationale**: The current repository standard explicitly avoids backend unit-test projects and frontend test harnesses unless they are requested later. For this slice, build validation plus live register/login/current-user smoke checks keeps the implementation aligned with the repo rules while still verifying the critical auth path.

**Alternatives considered**:
- Adding xUnit and frontend test tooling: rejected because it conflicts with the current architecture and repo-maintenance standard for this project.
- Manual implementation without build or smoke verification: rejected because the auth flow still needs direct runtime confirmation.
