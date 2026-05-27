# Research: Progress Dashboard & Goal Achievement

## Architecture Decisions

### Decision 1: Reuse Existing Diary API for P1 (Daily Progress)

**Decision**: The daily progress view (P1) calls the existing `GET /api/Diary` endpoint rather than a new endpoint.

**Rationale**: `GET /api/Diary` already returns `DiaryDayDto` which contains `DailySummaryDto` (total calories, protein, carbs, fat) and `GoalSnapshotDto` (targets for each macro). The progress bars require only these two shapes — the remaining/overage is a subtraction the frontend can do. Adding a new endpoint for identical data violates YAGNI (Constitution Principle V).

**Alternatives considered**: A new `GET /api/Progress/daily` endpoint returning pre-computed remaining values was considered. Rejected because the computation is trivial arithmetic on the frontend, and it would duplicate the daily data fetching logic already in `DiaryService`.

---

### Decision 2: New `ProgressService` for Trends, Streaks, and Weekly Summary

**Decision**: Add a single `IProgressService` / `ProgressService` class in `GymScan.Services/Features/Progress/` that handles three new query operations: trend data, streak/heatmap data, and weekly summary data.

**Rationale**: Three new read operations are required for P2, P3, and P4 that do not exist in any current service. Following the established simplified architecture (one service class per domain, direct `AppDbContext` injection), a single `ProgressService` is the correct unit. CQRS splitting into BusinessService + QueryService is not used in this codebase (see architecture memory).

**Alternatives considered**: Adding the progress queries directly to `DiaryService` was considered. Rejected because progress analytics is a conceptually separate domain from diary entry retrieval, and mixing them would grow `DiaryService` beyond its single-responsibility boundary.

---

### Decision 3: All Progress Computations Done at Read Time (No Stored Aggregates)

**Decision**: Streak count, goal hit rate, and daily summaries are all computed on the server at query time from the `MealLog` table. No aggregate summary table is introduced.

**Rationale**: At this scale (single user, up to 90 days × typical 5–20 entries/day = at most ~1,800 rows per range query), EF Core LINQ aggregations over `MealLog` are well within acceptable performance bounds. A pre-aggregated summary table would add write-side complexity (updating the summary on every log entry) for no user-observable benefit.

**Alternatives considered**: A `DailyNutritionSummary` stored table that caches per-day totals. Rejected — premature optimization, adds schema complexity, and introduces cache-invalidation risk when log entries are deleted (soft-delete is used).

---

### Decision 4: Streak Definition — Calorie Goal Only, Zero-Data Days Are Neutral

**Decision**: A day is "on-goal" when total logged calories ≤ daily calorie goal. A day with no log entries is classified as `NoData` and does not break the streak. A streak is the count of consecutive `OnGoal` days ending at today (or the most recent logged day).

**Rationale**: Using only the calorie goal for streak computation is the industry standard (MyFitnessPal, Lose It!). Per-macro streaks are more punishing and less motivating for casual users. The spec states calories as the primary metric for the streak. Days with no data being neutral rather than streak-breaking prevents a missed logging day from resetting progress — this is standard behaviour and aligns with the spec assumption documented in spec.md.

**Alternatives considered**: Breaking the streak on no-data days (strict mode) — rejected per spec assumption. Using all macros for streak computation — out of scope for this spec per spec.md.

---

### Decision 5: Frontend — New `/progress` Route and Page

**Decision**: The Progress Dashboard is a new `/progress` route backed by a new `Progress.jsx` page. The existing `/dashboard` route is unchanged.

**Rationale**: The existing `Dashboard.jsx` is a landing/action hub ("what are you eating today?"). The Progress Dashboard is a data-heavy analytics view. They serve different purposes and should be separate pages. Mixing analytics into the action hub would clutter the primary user entry point.

**Alternatives considered**: Replacing `/dashboard` with the progress view. Rejected — the existing dashboard provides navigation affordances (scan, log, history, goals) that users rely on. Extending the existing page with analytics tabs was considered but creates a page that would become too long and unfocused.

---

### Decision 6: Chart Library — Recharts

**Decision**: Use Recharts for trend charts and the heatmap. No new chart library is installed; if Recharts is already in `package.json`, use it. If not, install it (`npm install recharts`).

**Rationale**: Recharts is the standard React chart library, is composable with JSX, has small bundle size, and is well-documented. The trend charts require line/bar charts and a reference line, both supported natively. The heatmap can be built with CSS grid if Recharts' ScatterChart is unsuitable, but Recharts is the first choice.

**Alternatives considered**: Chart.js with react-chartjs-2 — heavier API surface, more imperative. Nivo — more complex, higher bundle cost. CSS-only heatmap — sufficient for the 30-day calendar; this is a fallback if a charting library is not appropriate.

---

### Decision 7: Weekly Summary — Monday Start, No User Customisation

**Decision**: The weekly summary week starts on Monday. There is no user-configurable week start. The `weekStart` query parameter accepts a `yyyy-MM-dd` date; the API validates that it is a Monday.

**Rationale**: ISO week standard starts on Monday. This is consistent with European convention and acceptable internationally. Making the week start configurable is out of scope per spec.md assumption. Validating that `weekStart` is a Monday prevents ambiguous queries.

**Alternatives considered**: Defaulting to Sunday-start (US convention) — rejected in favour of ISO standard. Accepting any day as `weekStart` and computing the enclosing week — would require more complex API logic; a Monday input is simpler and explicit.
