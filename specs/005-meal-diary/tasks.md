---
description: "Task list for Meal Diary & History View feature implementation"
---

# Tasks: Meal Diary & History View

**Input**: Design documents from `/specs/005-meal-diary/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated per repository standard.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to
- All paths are relative to repository root

---

## Phase 1: Foundational (Backend — Blocking Prerequisites)

**Purpose**: All backend service and controller work must exist before any frontend user story can be tested end-to-end. No migrations required — `MealLogs` and `UserDailyNutritionGoals` tables already exist from Specs 003 and 004.

**⚠️ CRITICAL**: No user story frontend work can be verified end-to-end until T011 (DI registration) is complete and the backend is running.

- [x] T001 [P] Create `DiaryDayDto` record (Date string, MealGroups MealGroupDto[], DailySummary DailySummaryDto, Goals GoalSnapshotDto? nullable) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Dtos/Responses/DiaryDayDto.cs`
- [x] T002 [P] Create `MealGroupDto` record (MealType string, Entries MealLogEntryDto[], GroupCalories decimal) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Dtos/Responses/MealGroupDto.cs`
- [x] T003 [P] Create `MealLogEntryDto` record (Id Guid, FoodName string, Calories decimal, Protein decimal, Carbs decimal, Fat decimal, ServingSizeGrams decimal? nullable, LoggedAt string as ISO 8601 UTC) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Dtos/Responses/MealLogEntryDto.cs`
- [x] T004 [P] Create `DailySummaryDto` record (TotalCalories decimal, TotalProtein decimal, TotalCarbs decimal, TotalFat decimal) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Dtos/Responses/DailySummaryDto.cs`
- [x] T005 [P] Create `GoalSnapshotDto` record (CaloriesTarget decimal, ProteinTarget decimal, CarbsTarget decimal, FatTarget decimal) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Dtos/Responses/GoalSnapshotDto.cs`
- [x] T006 Create `DiaryMappings` static class with: (a) `MealLog.ToMealLogEntryDto()` extension method mapping all DTO fields and formatting `LoggedAt` as ISO 8601 UTC string; (b) `BuildDiaryDayDto(DateOnly date, List<MealLog> entries, UserDailyNutritionGoal? goal)` static method that groups entries by `MealType` enum in order (Breakfast=1 first through Snack=4 last, skipping empty groups), computes `GroupCalories` per group, sums `DailySummaryDto` from all entries, maps `GoalSnapshotDto` from goal (null when goal is null) in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/Mappings/DiaryMappings.cs`
- [x] T007 Create `IDiaryService` interface with two methods: `Task<ServiceResponse<DiaryDayDto>> GetDiaryDayAsync(DateOnly date)` and `Task<ServiceResponse<object>> DeleteMealLogAsync(Guid id)` in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/IDiaryService.cs`
- [x] T008 Implement `DiaryService.GetDiaryDayAsync`: (1) if `date > DateOnly.FromDateTime(DateTime.UtcNow)` return `ServiceResponse.Failure("Date cannot be in the future.", 400)`; (2) query `AppDbContext.MealLogs` with `.AsNoTracking().Where(m => m.UserId == currentUserId && m.DiaryDate == date).OrderBy(m => m.LoggedAt).ToListAsync()`; (3) call `DiaryMappings.BuildDiaryDayDto(date, entries, goal)` where goal comes from `AppDbContext.UserDailyNutritionGoals.AsNoTracking().FirstOrDefaultAsync(g => g.UserId == currentUserId && g.IsActive)`; (4) return `ServiceResponse<DiaryDayDto>.Success(dto)` in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/DiaryService.cs`
- [x] T009 Implement `DiaryService.DeleteMealLogAsync`: (1) load entry via `AppDbContext.MealLogs.FirstOrDefaultAsync(m => m.Id == id && m.UserId == currentUserId)` — return `ServiceResponse.Failure("Meal log entry not found.", 404)` if null; (2) set `entry.IsDeleted = true` and `entry.DeletedAt = DateTime.UtcNow`; (3) call `AppDbContext.SaveChangesAsync()`; (4) return `ServiceResponse<object>.Success(null, 204)` in `MacrosTrackerAPI/src/GymScan.Services/Features/Diary/DiaryService.cs`
- [x] T010 Create `DiaryController` inheriting `ApiControllerBase` with `[Authorize]` attribute; add `[HttpGet]` action accepting `[FromQuery] string? date = null` — parse to `DateOnly` (default `DateOnly.FromDateTime(DateTime.UtcNow)` when null or empty, return 400 if format is invalid), call `IDiaryService.GetDiaryDayAsync`, return `ToActionResult(result)`; add `[HttpDelete("entries/{id:guid}")]` action accepting `Guid id`, call `IDiaryService.DeleteMealLogAsync(id)`, return `ToActionResult(result)` in `MacrosTrackerAPI/src/GymScan.API/Controllers/DiaryController.cs`
- [x] T011 Register `IDiaryService` → `DiaryService` (Scoped) in `MacrosTrackerAPI/src/GymScan.Services/Features/DependencyInjection.cs`

**Checkpoint**: Backend ready — `GET /api/Diary` and `DELETE /api/Diary/entries/{id}` are callable. Verify with smoke tests 1–5 from quickstart.md before starting frontend.

---

## Phase 2: User Story 1 — View Today's Diary (Priority: P1) 🎯 MVP

**Goal**: User opens the History page and immediately sees all meals logged today grouped by meal type, with daily macro totals and progress against their nutrition goals.

**Independent Test**: Log at least one meal via the Scan page, then open `/history`. Confirm meals appear under the correct meal type headings (Breakfast / Lunch / Dinner / Snack), the daily summary shows non-zero totals, and opening with no meals shows the empty state message with a link to /scan.

- [x] T012 [P] [US1] Create `diaryClient.js` with `getDiary(date?)` function: call `GET /api/Diary` with optional `params: { date }` (omit the param when date is undefined to let the backend default to today); Bearer token injected automatically by the axios client interceptor in `MacrosTrackerWeb/src/api/diaryClient.js`
- [x] T013 [P] [US1] Create `DailySummary.jsx` component: render total calories prominently (large amber number matching the Scan page style); render a three-column macro grid (Protein / Carbs / Fat) showing consumed grams; when `goals` prop is non-null, show remaining amounts (target − consumed) below each macro — use green text for within-goal, red text when exceeded; when `goals` is null, render a muted "Set your daily goals" link pointing to `/goal-setup` in `MacrosTrackerWeb/src/components/DailySummary.jsx`
- [x] T014 [P] [US1] Create `MealGroup.jsx` component: render a heading with the meal type label and group calorie subtotal; list all entries, each showing food name (bold), calories, protein, carbs, fat, and optional serving size; include a per-entry delete button (icon or small "Remove" label) that calls `onDeleteEntry(entry.id)` prop — show a disabled/spinner state when `deletingId === entry.id` prop matches in `MacrosTrackerWeb/src/components/MealGroup.jsx`
- [x] T015 [US1] Build the diary view in `MacrosTrackerWeb/src/pages/History.jsx`: replace the placeholder; on mount call `getDiary()` (today, no date arg); show a loading spinner while fetching; on success render `DailySummary` at the top and one `MealGroup` per group in `diaryData.mealGroups`; when `mealGroups` is empty show the empty state: "No meals logged for [formatted date] yet." with a "Scan a meal" link to `/scan`; on fetch error show an inline error box with a Retry button that re-calls `getDiary()`; do not render `DailySummary` or `MealGroup` components when data is null

**Checkpoint**: US1 complete — open `/history` after logging a meal and confirm the diary view works end-to-end.

---

## Phase 3: User Story 2 — Browse a Different Day (Priority: P2)

**Goal**: User can navigate backward and forward through past diary days one day at a time. The next-day button is visually disabled when the user is already on today.

**Independent Test**: On the History page, tap the previous day arrow. Confirm the date header updates to yesterday and the diary content reloads for that date (empty state is fine if no meals were logged). Tap the next day arrow back to today and confirm the content reloads for today. Confirm the next-day arrow is not interactive when viewing today.

- [x] T016 [US2] Create `DayNavigator.jsx` component: display formatted date — show "Today" when date equals today's date (UTC), "Yesterday" for yesterday, or the full formatted date (e.g. "26 May 2026") for older dates; render a left arrow button calling `onPrev()` prop; render a right arrow button calling `onNext()` prop that is visually disabled (`opacity: 0.4`, `pointer-events: none`, `cursor: not-allowed`) and non-interactive when `isToday` prop is true; accept `date` (ISO string), `onPrev`, `onNext`, and `isToday` props in `MacrosTrackerWeb/src/components/DayNavigator.jsx`
- [x] T017 [US2] Add day navigation to `MacrosTrackerWeb/src/pages/History.jsx`: add `selectedDate` state initialized to today's ISO date string (`new Date().toISOString().slice(0, 10)`); render `DayNavigator` above the diary content, passing `selectedDate`, `isToday` (compare to today's ISO string), and prev/next handlers that add/subtract one day from `selectedDate`; when `selectedDate` changes re-fetch diary via `getDiary(selectedDate)` using `useEffect` with `selectedDate` as dependency; prevent next-day navigation beyond today in the handler

**Checkpoint**: US1 + US2 complete — full day-by-day navigation works. Test prev/next across multiple days including empty ones.

---

## Phase 4: User Story 3 — Delete a Meal Log Entry (Priority: P3)

**Goal**: User can delete a mistakenly logged meal entry after confirming their intent. The daily summary updates immediately to reflect the removal.

**Independent Test**: On the History page with at least one meal entry visible, click the delete button on that entry. Confirm a confirmation prompt appears. Confirm deletion and verify the entry disappears from the list and the daily calorie and macro totals decrease accordingly.

- [x] T018 [P] [US3] Add `deleteDiaryEntry(id)` function to `MacrosTrackerWeb/src/api/diaryClient.js` calling `DELETE /api/Diary/entries/${id}` with Bearer token auto-injected
- [x] T019 [US3] Wire deletion flow in `MacrosTrackerWeb/src/pages/History.jsx`: add `deletingId` state (Guid string or null); implement `handleDeleteEntry(id, foodName)` that (1) shows `window.confirm(\`Remove "${foodName}" from your diary?\`)` — do nothing if cancelled; (2) sets `deletingId = id`; (3) calls `deleteDiaryEntry(id)`; (4) on success re-fetches the diary for the current `selectedDate` via `getDiary(selectedDate)` to get accurate server totals; (5) on error shows an inline error message; (6) clears `deletingId` in finally; pass `onDeleteEntry={handleDeleteEntry}` and `deletingId` to each `MealGroup`

**Checkpoint**: All three user stories complete — scan, diary view, navigation, and deletion all work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation, Swagger verification, and smoke test sign-off.

- [ ] T020 [P] Verify `GET /api/Diary` and `DELETE /api/Diary/entries/{id}` appear in Swagger at `http://localhost:5000/swagger` with correct request/response schemas and the `[Authorize]` lock icon
- [ ] T021 Run all six quickstart.md smoke tests in order: (1) get today's diary, (2) get yesterday's diary, (3) reject a future date (400), (4) delete an entry and confirm it disappears, (5) attempt to delete a non-owned entry (expect 404), (6) load diary for a user with no active goal (confirm `goals: null` in response)
- [x] T022 [P] Harden `MacrosTrackerWeb/src/pages/History.jsx`: ensure the page does not crash when `diaryData.mealGroups` is an empty array; ensure `DailySummary` renders correctly when all totals are zero; ensure `DayNavigator` renders correctly on the first day of a month (no boundary bugs in date arithmetic); confirm the page redirects to `/login` if the API returns 401 (via the existing axios interceptor — no additional code needed, but verify it triggers correctly)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. BLOCKS all user story end-to-end testing.
- **User Story 1 (Phase 2)**: Depends on Foundational completion.
- **User Story 2 (Phase 3)**: Depends on User Story 1 (navigation extends the diary view from US1).
- **User Story 3 (Phase 4)**: Depends on User Story 1 (delete button lives in the diary view built in US1).
- **Polish (Phase 5)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only.
- **US2 (P2)**: Depends on US1 — the `DayNavigator` and navigation state are added to the `History.jsx` page built in US1.
- **US3 (P3)**: Depends on US1 — the delete button lives in `MealGroup.jsx` built in US1; the handler lives in `History.jsx`.

### Within Each User Story

- Backend DTOs (T001–T005) → Mappings (T006) → Interface (T007) → Implementations (T008, T009) → Controller (T010) → DI (T011)
- Frontend API client → components → page integration
- Backend must be running before frontend end-to-end testing

### Parallel Opportunities

Within Foundational:
- T001, T002, T003, T004, T005 can all run in parallel (different DTO files)

Within US1:
- T012, T013, T014 can run in parallel (different files — diaryClient, DailySummary component, MealGroup component)
- T015 (History.jsx) depends on T012 (client) and T013, T014 (components)

Within US3:
- T018 (deleteDiaryEntry in client) can run in parallel with building T019

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational — all backend endpoints wired and verified in Swagger
2. Complete Phase 2: User Story 1 — diary view for today
3. **STOP and VALIDATE**: Open `/history` with real logged data. Confirm entries, summary, and empty state all work
4. Proceed to US2 (navigation) then US3 (deletion)

### Incremental Delivery

1. Foundational → backend API live and testable in Swagger
2. US1 → diary shows today's meals (MVP — core product value)
3. US2 → day-by-day navigation (allows reviewing the past)
4. US3 → delete entries (data correction)
5. Polish → Swagger verified, smoke tests passed, edge cases hardened

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks in the same phase
- `[US#]` label maps task to its user story for traceability
- No migrations required — all entities exist from Specs 003 and 004
- The EF Core global soft-delete query filter on `MealLog` automatically excludes `IsDeleted = true` rows from all diary queries — no manual filter needed in T008
- `DiaryService` needs `AppDbContext` and `ICurrentUserService` injected; follow the same pattern as `FoodScanService` from Spec 004
- The `UserDailyNutritionGoal` entity DbSet name — check `AppDbContext.cs` to confirm the correct property name before writing T008
- Date arithmetic in the frontend (prev/next day): use `new Date(selectedDate)` and adjust by ±1 day, then re-serialize with `.toISOString().slice(0, 10)` to stay in ISO format
