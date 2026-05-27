# Research: Meal Diary & History View

**Branch**: `005-meal-diary` | **Date**: 2026-05-27

---

## Decision Log

### 1. Reuse existing entities vs introduce new ones

**Decision**: No new database entities. The feature reads from `MealLog` (Spec 004) and `UserDailyNutritionGoal` (Spec 003), both of which already exist in `GymScan.Database`.

**Rationale**: The diary is a read-oriented feature over data that is already persisted by the scan and log flow. Introducing a separate diary entity would duplicate data unnecessarily and add migration risk. Aggregating `MealLog` rows by `DiaryDate` at query time is simple and efficient at v1 scale.

**Alternatives considered**:
- Denormalized diary snapshot table — rejected; adds write-path complexity and sync risk with no benefit at <1,000 users.

---

### 2. Where to aggregate diary data (backend vs frontend)

**Decision**: Backend groups `MealLog` entries by `MealType` and computes daily macro totals. The frontend receives a fully-shaped `DiaryDayDto` ready for rendering.

**Rationale**: Grouping and aggregation in the service layer keeps the frontend simple (no reduce/groupBy logic in React state), makes the contract testable, and avoids sending raw arrays that each client must independently process correctly.

**Alternatives considered**:
- Return a flat list of MealLog rows and group on the frontend — rejected; leaks query logic into the presentation layer and creates divergent aggregation behavior if more clients (mobile) are added.

---

### 3. Date parameter format

**Decision**: `date` query parameter uses ISO 8601 format `YYYY-MM-DD`. When omitted, defaults to today (server-side UTC date). The backend parses it as `DateOnly`.

**Rationale**: ISO 8601 is unambiguous across locales, directly mappable to .NET `DateOnly`, and matches what JavaScript `new Date().toISOString().slice(0, 10)` produces natively. Defaulting to today reduces client boilerplate for the common case.

**Alternatives considered**:
- Unix timestamp — rejected; harder to read in logs and debug; no benefit over a string at this scale.
- Pass date via route (`/api/Diary/2026-05-27`) — rejected; query parameter is more conventional for optional/defaultable values.

---

### 4. Soft-delete implementation for diary entry deletion

**Decision**: Soft-delete via the existing `ISoftDeletable` interface and EF Core global query filter. `DiaryService` sets `IsDeleted = true` and `DeletedAt = DateTime.UtcNow`, then saves via `AppDbContext`. The global filter ensures deleted entries never appear in diary queries automatically.

**Rationale**: `MealLog` already implements `ISoftDeletable` (Spec 004). Using the existing soft-delete pattern is consistent, safe (data is recoverable), and requires zero migration changes.

**Alternatives considered**:
- Physical DELETE — rejected; irreversible, breaks the established pattern, risks cascading FK issues with FoodScan references.

---

### 5. Controller placement: DiaryController vs extending FoodScanController

**Decision**: Create a new `DiaryController` with base route `api/Diary`. The FoodScan controller handles scan-specific concerns; the diary is a distinct domain.

**Rationale**: Separating concerns by domain aligns with the constitution's CQRS and thin-controller principles. Adding diary endpoints to `FoodScanController` would violate single-responsibility and make the controller harder to maintain.

**Alternatives considered**:
- Add diary endpoints to `FoodScanController` — rejected; wrong domain, would violate SRP and thin-controller principle.

---

### 6. Frontend: new page vs extending Scan page

**Decision**: Implement the diary inside `History.jsx` (already routed at `/history`). The existing placeholder description from Spec 004 ("Spec 4 will add weekly trends and paginated daily summaries") is superseded by this diary implementation.

**Rationale**: The `/history` route and `History.jsx` component already exist and are wired in `App.jsx`. Reusing them avoids adding a new route and keeps the navigation structure consistent.

**Alternatives considered**:
- Create a new `Diary.jsx` at `/diary` route — rejected; requires modifying App.jsx routing and would leave `/history` as a dead placeholder.

---

### 7. Goals display when no goal exists

**Decision**: When `UserDailyNutritionGoal` is null (user has not completed setup), the `DiaryDayDto` returns `goals: null` and the frontend shows raw totals only, with a link to the goals setup page.

**Rationale**: The spec FR-011 requires this behaviour. Not crashing or hiding totals entirely is the safest approach.

---

### 8. No pagination for diary entries

**Decision**: All `MealLog` entries for the selected date are returned in one response. No pagination.

**Rationale**: The spec edge-cases note that a user is unlikely to have enough entries in a single day to warrant pagination. At v1 scale (~1,000 users, expected <20 entries/day/user) a simple `ToListAsync()` is sufficient.
