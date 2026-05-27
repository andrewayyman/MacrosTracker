# Tasks: Progress Dashboard & Goal Achievement

**Input**: Design documents from `/specs/007-progress-dashboard/`

**Prerequisites**: plan.md âœ… | spec.md âœ… | research.md âœ… | data-model.md âœ… | contracts/ âœ… | quickstart.md âœ…

**Tests**: None â€” not requested in spec. Per repository standard (Constitution Principle V), no unit-test or test-harness tasks are generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. US1 (daily progress) has no new backend work â€” it reuses the existing `GET /api/Diary` endpoint.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install chart library and create all response DTO files. These tasks have no inter-dependencies and can all run in parallel.

- [x] T001 Run `npm install recharts` in `MacrosTrackerWeb/` to add the charting library (required by TrendChart and GoalHeatmap components in later phases)
- [x] T002 [P] Create `GymScan.Services/Features/Progress/Dtos/Responses/TrendDayDto.cs` as `sealed record TrendDayDto(string Date, decimal Calories, decimal Protein, decimal Carbs, decimal Fat, bool HasData)` and `TrendResponseDto.cs` as `sealed record TrendResponseDto(IReadOnlyList<TrendDayDto> Days, GoalSnapshotDto? Goals, int RangeInDays)` â€” import `GoalSnapshotDto` from `GymScan.Services.Features.Diary.Dtos.Responses`
- [x] T003 [P] Create `GymScan.Services/Features/Progress/Dtos/Responses/DayStatusEntry.cs` as `sealed record DayStatusEntry(string Date, string Status, decimal TotalCalories)` and `StreakResponseDto.cs` as `sealed record StreakResponseDto(int CurrentStreak, decimal GoalHitRate, IReadOnlyList<DayStatusEntry> HeatmapDays, bool HasGoal)`
- [x] T004 [P] Create `GymScan.Services/Features/Progress/Dtos/Responses/WeekDayEntry.cs` as `sealed record WeekDayEntry(string Date, string DayName, decimal TotalCalories, int CaloriesTarget, bool HasData, string Status)` and `WeeklySummaryResponseDto.cs` as `sealed record WeeklySummaryResponseDto(string WeekStart, string WeekEnd, IReadOnlyList<WeekDayEntry> Days, decimal WeeklyTotal, decimal WeeklyGoal, bool HasGoal)`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend service interface + skeleton + controller + DI registration, and frontend page shell + route + nav. ALL user stories depend on this phase.

**âڑ ï¸ڈ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T005 Create `GymScan.Services/Features/Progress/IProgressService.cs` declaring three methods: `Task<ServiceResponse<TrendResponseDto>> GetTrendsAsync(int rangeInDays)`, `Task<ServiceResponse<StreakResponseDto>> GetStreaksAsync()`, `Task<ServiceResponse<WeeklySummaryResponseDto>> GetWeeklySummaryAsync(DateOnly weekStart)`
- [x] T006 Create `GymScan.Services/Features/Progress/ProgressService.cs` implementing `IProgressService` with constructor `(AppDbContext db, ICurrentUserService currentUser)` and three method stubs (each returns `throw new NotImplementedException()` for now)
- [x] T007 Create `GymScan.API/Controllers/ProgressController.cs` with `[AppAuthorize]` and `[Route("api/[controller]")]` attributes, constructor injecting `IProgressService`, and three thin actions: `[HttpGet("trends")] GetTrends([FromQuery] int range = 7)`, `[HttpGet("streaks")] GetStreaks()`, `[HttpGet("weekly")] GetWeekly([FromQuery] string? weekStart = null)` â€” each calling the service and returning `ToActionResult(result)`; the `GetWeekly` action parses `weekStart` with `DateOnly.TryParseExact(weekStart, "yyyy-MM-dd", ...)` and defaults to the Monday of the current week when null
- [x] T008 Add `services.AddScoped<IProgressService, ProgressService>()` to `GymScan.Services/DependencyInjection.cs`
- [x] T009 [P] Create `MacrosTrackerWeb/src/api/progressClient.js` with three exported functions: `getProgressTrends(range = 7)` calling `GET /Progress/trends?range=${range}`, `getProgressStreaks()` calling `GET /Progress/streaks`, `getWeeklySummary(weekStart)` calling `GET /Progress/weekly${weekStart ? '?weekStart='+weekStart : ''}` â€” each returning `r.data.data`
- [x] T010 [P] Create `MacrosTrackerWeb/src/pages/Progress.jsx` page container: import `PageShell`; add `activeTab` state defaulting to `'today'`; render four tab button controls (Today, Trends, Streaks, Weekly) that set `activeTab`; render a placeholder `<div>Tab content here</div>` conditionally per tab; wrap page in `<PageShell>`
- [x] T011 [P] Add `import ProgressPage from "./pages/Progress"` and a new `<ProtectedRoute>` for path `/progress` wrapping `<ProgressPage />` in `MacrosTrackerWeb/src/App.jsx`
- [x] T012 [P] Add `{ to: "/progress", label: "Progress" }` to the `navLinks` array in `MacrosTrackerWeb/src/components/PageShell.jsx`

**Checkpoint**: Navigate to `http://localhost:5173/progress` â€” page loads with four tab buttons. "Progress" appears in the nav bar.

---

## Phase 3: User Story 1 â€” Daily Progress View (Priority: P1) ًںژ¯ MVP

**Goal**: Progress bars showing today's calories and macro totals vs. goals, reusing the existing `GET /api/Diary` endpoint â€” no new backend code required.

**Independent Test**: A logged-in user with an active nutrition goal and at least one food logged today opens `/progress` and sees four filled progress bars on the Today tab with values matching `GET /api/Diary`'s `dailySummary` and `goals` fields.

- [x] T013 [US1] Create `MacrosTrackerWeb/src/components/MacroProgressBar.jsx` â€” props: `label` (string), `consumed` (number), `goal` (number), `unit` (string, default "g"); render: label, a progress bar filling `Math.min(consumed / goal, 1) * 100%` width, numeric display `consumed / goal unit`; when `consumed <= goal`: green/neutral bar colour, show `(goal - consumed) unit remaining`; when `consumed > goal`: red bar at 100%, show `(consumed - goal) unit over`; handle `goal === 0` safely (show "No goal" rather than dividing by zero)
- [x] T014 [US1] Implement Today tab content in `MacrosTrackerWeb/src/pages/Progress.jsx`: use TanStack Query (`useQuery`) to call `getDiaryDay()` from `diaryClient.js` (today, no date arg); when loaded, render four `<MacroProgressBar>` components: Calories (consumed=dailySummary.totalCalories, goal=goals.caloriesTarget, unit="kcal"), Protein (protein/proteinTarget/g), Carbs (carbs/carbsTarget/g), Fat (fat/fatTarget/g); show a loading spinner while fetching
- [x] T015 [US1] Add empty states to Today tab in `MacrosTrackerWeb/src/pages/Progress.jsx`: when `goals` is null, replace progress bars with "Set your nutrition goals to see your progress" and a `<Link to="/goal-setup">Set goals</Link>`; when `goals` is set but `dailySummary.totalCalories === 0`, display progress bars at zero with a hint "No food logged today â€” head to Log Food to start tracking"

**Checkpoint**: Navigate to `/progress` â†’ Today tab â†’ four progress bars visible with correct values. Verify by comparing against `curl GET /api/Diary` output.

---

## Phase 4: User Story 2 â€” Historical Trend Charts (Priority: P2)

**Goal**: Bar charts with a goal reference line for calorie and per-macro daily trends over selectable 7/30/90-day ranges.

**Independent Test**: A user with log entries on at least 3 distinct days can view the Trends tab, see charts with data bars and a dashed goal line, and switch between 7d/30d/90d ranges â€” charts update correctly each time.

- [x] T016 [US2] Implement `GetTrendsAsync(int rangeInDays)` in `GymScan.Services/Features/Progress/ProgressService.cs`: (1) validate `rangeInDays âˆˆ {7, 30, 90}` â€” return 400 if invalid; (2) compute `startDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-(rangeInDays - 1))`; (3) fetch all non-deleted MealLogs for the current user where `DiaryDate >= startDate`, `AsNoTracking`; (4) fetch active `DailyNutritionGoal`; (5) group logs by `DiaryDate` and sum macros; (6) enumerate every calendar day from `startDate` to today, emit a `TrendDayDto` with `HasData=false` and zeros for days with no entries; (7) return `TrendResponseDto` ordered oldestâ†’newest
- [x] T017 [US2] Complete `GetTrends` controller action in `GymScan.API/Controllers/ProgressController.cs` to pass the `range` query parameter to `_progressService.GetTrendsAsync(range)` and return `ToActionResult(result)` (remove the `NotImplementedException` stub)
- [x] T018 [US2] Create `MacrosTrackerWeb/src/components/TrendChart.jsx` â€” props: `days` (array of TrendDayDto), `metric` ('calories'|'protein'|'carbs'|'fat'), `goal` (number|null), `label` (string); use Recharts `<BarChart>` with `<Bar dataKey={metric}>`, `<XAxis dataKey="date">` showing abbreviated dates (e.g. "May 26"), `<YAxis>`, `<Tooltip>`; add a `<ReferenceLine y={goal} stroke="red" strokeDasharray="4 4" label="Goal">` when `goal` is set; render a centred "No data for this period" message when all `days` have `hasData === false`
- [x] T019 [US2] Implement Trends tab in `MacrosTrackerWeb/src/pages/Progress.jsx`: add `selectedRange` state (default 7); render three range selector buttons "7d", "30d", "90d" that update `selectedRange`; use TanStack Query to call `getProgressTrends(selectedRange)` (use `selectedRange` as part of the query key so switching ranges re-fetches); render four `<TrendChart>` components â€” calories, protein, carbs, fat â€” passing the corresponding goal value from `goals`

**Checkpoint**: Trends tab shows four charts. Switch 7d â†’ 30d â†’ 90d and confirm chart updates. Verify a data point against `curl GET /api/Progress/trends?range=7`.

---

## Phase 5: User Story 3 â€” Streaks & Heatmap (Priority: P3)

**Goal**: Current goal streak counter, 30-day goal hit rate percentage, and a 30-day colour-coded calendar heatmap.

**Independent Test**: A user with 3 consecutive days where logged calories â‰¤ their calorie goal sees `currentStreak = 3` and 3 green tiles in the heatmap; a day where calories exceeded the goal shows a red tile.

- [x] T020 [US3] Implement `GetStreaksAsync()` in `GymScan.Services/Features/Progress/ProgressService.cs`: (1) compute `startDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-29)`; (2) fetch MealLogs in [startDate, today], `AsNoTracking`; (3) fetch active goal; (4) for each of the 30 days, classify `DayStatusEntry`: `NoData` if no entries, `OnGoal` if `calories >= goalأ—0.75 && calories <= goal`, `UnderGoal` if `calories < goalأ—0.75`, `OverGoal` if `calories > goal`; when no goal is set, all days are `NoData`; (5) compute `CurrentStreak`: iterate from today backward, counting consecutive `OnGoal` days, skipping `NoData` days without breaking, stopping on first `OverGoal` or `UnderGoal`; (6) compute `GoalHitRate = (OnGoal count / days-with-data count) أ— 100`, rounded to one decimal, returning 0 when no days have data; (7) return `StreakResponseDto` with `HasGoal = goal != null`
- [x] T021 [US3] Complete `GetStreaks` controller action in `GymScan.API/Controllers/ProgressController.cs` to call `_progressService.GetStreaksAsync()` and return `ToActionResult(result)` (remove the `NotImplementedException` stub)
- [x] T022 [US3] Create `MacrosTrackerWeb/src/components/GoalHeatmap.jsx` â€” props: `days` (array of DayStatusEntry, 30 items, oldestâ†’newest); render a CSS grid (5 columns أ— 6 rows or a 30-cell flex wrap); each cell: a coloured square showing the day-of-month number extracted from the `date` field â€” `OnGoal`=green (`#4caf50`), `OverGoal`=red (`#f44336`), `UnderGoal`=amber (`#ff9800`), `NoData`=grey (`#e0e0e0`); add a legend row below the grid with colour swatches and labels
- [x] T023 [US3] Implement Streaks tab in `MacrosTrackerWeb/src/pages/Progress.jsx`: use TanStack Query to call `getProgressStreaks()`; display `currentStreak` as a large bold number with "day streak" label; display `goalHitRate` formatted as "X.X% of logged days on goal (last 30 days)"; render `<GoalHeatmap days={heatmapDays} />`; when `hasGoal === false`, show "Set your nutrition goals to start tracking your streak" with a link to `/goal-setup` instead of streak stats

**Checkpoint**: Call `GET /api/Progress/streaks`. Verify `currentStreak` matches manual count of consecutive on-goal days. Confirm heatmap tile colours match each day's status.

---

## Phase 6: User Story 4 â€” Weekly Summary (Priority: P4)

**Goal**: Mondayâ€“Sunday week view with per-day calorie totals vs. goals, weekly aggregate, and prev/next week navigation.

**Independent Test**: A user with log entries in the current week sees a 7-row table (Monâ€“Sun) with correct calorie totals and can navigate to the previous week to see historical data.

- [x] T024 [US4] Implement `GetWeeklySummaryAsync(DateOnly weekStart)` in `GymScan.Services/Features/Progress/ProgressService.cs`: (1) validate `weekStart.DayOfWeek == DayOfWeek.Monday` â€” return 400 "weekStart must be a Monday" if not; (2) compute `weekEnd = weekStart.AddDays(6)`; (3) fetch MealLogs in [weekStart, weekEnd], `AsNoTracking`; (4) fetch active goal; (5) build 7 `WeekDayEntry` items for Monâ†’Sun: `HasData = entries exist for that day`, `TotalCalories = sum for that day`, `CaloriesTarget = goal?.CaloriesTarget ?? 0`, `DayName = date.DayOfWeek.ToString()`; classify each day's `Status` using the same rules as GetStreaksAsync; (6) compute `WeeklyTotal = sum of TotalCalories for HasData days`; compute `WeeklyGoal = CaloriesTarget أ— count of HasData days`; (7) return `WeeklySummaryResponseDto`
- [x] T025 [US4] Complete `GetWeekly` controller action in `GymScan.API/Controllers/ProgressController.cs`: when `weekStart` query param is null, default to the Monday of the current UTC week using `var today = DateOnly.FromDateTime(DateTime.UtcNow); var monday = today.AddDays(-(((int)today.DayOfWeek + 6) % 7));`; when provided, parse with `DateOnly.TryParseExact` and return 400 on parse failure; call `_progressService.GetWeeklySummaryAsync(parsedDate)` and return `ToActionResult(result)` (remove the `NotImplementedException` stub)
- [x] T026 [US4] Create `MacrosTrackerWeb/src/components/WeeklySummaryTable.jsx` â€” props: `summary` (WeeklySummaryResponseDto), `onPrev` (fn), `onNext` (fn), `isCurrentWeek` (bool); render: a header row showing week range (e.g. "May 25 â€“ May 31"); a 7-row table with columns Day | Logged (kcal) | Goal (kcal) | Status icon (âœ… OnGoal, ًں”´ OverGoal, ًںں، UnderGoal, â¬œ NoData); a footer row "Week Total: X kcal / Weekly Goal: Y kcal"; prev/next navigation `<button>` elements, with the "Next" button `disabled` when `isCurrentWeek`
- [x] T027 [US4] Implement Weekly tab in `MacrosTrackerWeb/src/pages/Progress.jsx`: add `weekOffset` state (default 0, where 0 = current week); compute `weekStart` ISO date string from offset: `const getMonday = (offset) => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7); return d.toISOString().slice(0, 10); }`; use TanStack Query to call `getWeeklySummary(weekStart)` with `weekStart` in the query key; render `<WeeklySummaryTable>` with `onPrev={() => setWeekOffset(o => o - 1)}`, `onNext={() => setWeekOffset(o => o + 1)}`, `isCurrentWeek={weekOffset === 0}`

**Checkpoint**: Navigate to `/progress` â†’ Weekly tab. Current week 7-row table visible with correct totals. Navigate back one week and confirm data loads. Verify a row's logged calories against `GET /api/Diary?date=yyyy-MM-dd` for that day.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Loading and error states across all tabs; final smoke-test pass.

- [x] T028 Add TanStack Query loading and error states to all four tabs in `MacrosTrackerWeb/src/pages/Progress.jsx`: show a `<div className="loading">Loadingâ€¦</div>` while `isLoading`; show `<div className="error">Failed to load data. Please try again.</div>` while `isError`, for each tab's query independently
- [x] T029 [P] Run through all smoke-test scenarios in `specs/007-progress-dashboard/quickstart.md`: verify daily progress bars, trend charts for all three ranges, streak count and heatmap colour accuracy, weekly navigation; fix any display discrepancies found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies â€” all T001â€“T004 can run immediately in parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1 (DTOs must exist before the interface). T005â€“T008 are sequential (interface â†’ implementation â†’ controller â†’ DI). T009â€“T012 are independent of the backend and can run in parallel with T005â€“T008.
- **Phase 3 (US1)**: Depends on Phase 2 completion. No new backend work â€” uses existing `/Diary` endpoint.
- **Phase 4 (US2)**: Depends on Phase 2 completion. T016â€“T017 (backend) must complete before T018â€“T019 (frontend charts).
- **Phase 5 (US3)**: Depends on Phase 2 completion. T020â€“T021 (backend) must complete before T022â€“T023 (frontend heatmap).
- **Phase 6 (US4)**: Depends on Phase 2 completion. T024â€“T025 (backend) must complete before T026â€“T027 (frontend weekly).
- **Phase 7 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 2. No dependency on US2/3/4.
- **US2 (P2)**: Depends on Phase 2. Independent of US1/3/4 (different tab, different endpoint).
- **US3 (P3)**: Depends on Phase 2. Independent of US1/2/4.
- **US4 (P4)**: Depends on Phase 2. Independent of US1/2/3.

---

## Parallel Opportunities

### Phase 1 â€” All tasks run in parallel
```
T001 npm install recharts
T002 TrendDayDto + TrendResponseDto
T003 DayStatusEntry + StreakResponseDto
T004 WeekDayEntry + WeeklySummaryResponseDto
```

### Phase 2 â€” Backend chain + frontend in parallel
```
Backend (sequential): T005 â†’ T006 â†’ T007 â†’ T008
Frontend (parallel with backend): T009, T010, T011, T012
```

### Phase 3â€“6 â€” Each user story is independently parallelizable with others
```
US1: T013 â†’ T014 â†’ T015
US2: T016 â†’ T017 â†’ T018 â†’ T019  (can run alongside US1)
US3: T020 â†’ T021 â†’ T022 â†’ T023  (can run alongside US1/US2)
US4: T024 â†’ T025 â†’ T026 â†’ T027  (can run alongside US1/US2/US3)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install Recharts, create DTOs)
2. Complete Phase 2: Foundational (backend skeleton, frontend page shell, route, nav)
3. Complete Phase 3: US1 â€” Today tab with progress bars
4. **STOP and VALIDATE**: Navigate to `/progress` â†’ Today tab â†’ four filled progress bars correct
5. Demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 â†’ Foundation ready (page exists but shows placeholder content)
2. Phase 3 â†’ Today tab with progress bars (MVP!)
3. Phase 4 â†’ Trends tab with charts
4. Phase 5 â†’ Streaks tab with heatmap
5. Phase 6 â†’ Weekly summary tab
6. Phase 7 â†’ Polish and smoke tests

Each phase adds a complete, independently demoable tab without breaking prior tabs.

---

## Notes

- `[P]` = can run in parallel (touches different files, no task dependencies)
- `[US1]â€“[US4]` maps each task to its user story for traceability
- US1 requires **no new backend code** â€” it is purely frontend and reuses `GET /api/Diary`
- Recharts is not yet in `MacrosTrackerWeb/package.json` â€” T001 must run before any chart component work
- `GoalSnapshotDto` is reused from `GymScan.Services.Features.Diary.Dtos.Responses` â€” do not duplicate it
- Day status classification logic is identical in `GetStreaksAsync` and `GetWeeklySummaryAsync` â€” consider extracting a private `ClassifyDay(decimal totalCalories, int caloriesTarget) â†’ string` helper in `ProgressService` to avoid repetition

