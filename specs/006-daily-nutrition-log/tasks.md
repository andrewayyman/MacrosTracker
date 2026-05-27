# Tasks: Daily Nutrition Log

**Input**: Design documents from `/specs/006-daily-nutrition-log/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: None — not requested in spec. Per repository standard (Constitution Principle V), no unit-test or test-harness tasks are generated.

**Organization**: Tasks grouped by user story. US1 is fully testable independently; US2 and US3 extend US1 without breaking it.

---

## Phase 1: Setup (Shared Frontend Plumbing)

**Purpose**: Wire the new `/log` route, navigation link, and API client file into the existing app shell. These three tasks are independent and can run in parallel.

- [x] T001 [P] Add protected `/log` route to `MacrosTrackerWeb/src/App.jsx` — import `ManualLog` page and wrap in existing `ProtectedRoute`
- [x] T002 [P] Add "Log Food" navigation link pointing to `/log` in `MacrosTrackerWeb/src/components/PageShell.jsx`
- [x] T003 [P] Create `MacrosTrackerWeb/src/api/nutritionLogClient.js` with stub `getRecentFoods` function that returns `client.get('/FoodScan/RecentFoods').then(r => r.data.data)`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `ManualLog.jsx` page container with the search state wired up. All three user story phases depend on this page existing before their UI work can plug in.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T004 Create `ManualLog.jsx` page with search state: render `FoodSearchPanel` wired to `searchFood()` from `foodScanClient.js`, display a results list of returned `FoodSearchResultDto` items (each item clickable), track selected food in component state, and show loading and error states in `MacrosTrackerWeb/src/pages/ManualLog.jsx`

**Checkpoint**: Navigation to `/log` renders a working search panel. Typing a query returns results. Clicking a result sets selected-food state (no confirm screen yet — that comes in US1).

---

## Phase 3: User Story 1 — Search and Log a Food Entry (Priority: P1) 🎯 MVP

**Goal**: Users can search for a food, select it, adjust quantity, choose a meal type, and confirm the log entry — which then appears in the Diary.

**Independent Test**: Log in, navigate to `/log`, search for "Koshary", select it, set quantity to 1, pick "Lunch", confirm. Verify the entry appears on `/history` under Lunch for today.

### Implementation

- [x] T005 [US1] Create `FoodLogConfirm.jsx` component: accept a `food` prop (`FoodSearchResultDto`), render food name, a positive decimal quantity input (default `1`, step `0.1`), real-time nutritional value display (`calories/protein/carbs/fat = perServing × quantity`), `MealTypeSelector`, a Confirm button (disabled when `quantity <= 0`), and a Cancel button in `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`
- [x] T006 [US1] Wire state machine in `ManualLog.jsx`: when a search result is clicked, transition from search state to confirm state rendering `FoodLogConfirm`; Cancel returns to search; Confirm calls `logMeal(payload)` from `foodScanClient.js` (set `LocalFoodItemId = food.id`, `FoodScanId = null`, `DiaryDate = today`, computed nutritional values, meal type), then navigates to `/history` on success in `MacrosTrackerWeb/src/pages/ManualLog.jsx`
- [x] T007 [US1] Add network error display with retry option in `FoodLogConfirm.jsx` when `logMeal()` rejects — show error message and a "Try again" button that re-submits the same payload in `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`
- [x] T008 [US1] Add empty-state message in `ManualLog.jsx` when `searchFood()` returns an empty array — display "No results found. Try different keywords or use the Scan page." in `MacrosTrackerWeb/src/pages/ManualLog.jsx`

**Checkpoint**: Full US1 flow is independently testable. Search → select → confirm → entry appears in diary.

---

## Phase 4: User Story 2 — Preview Daily Impact Before Logging (Priority: P2)

**Goal**: On the confirmation screen, users see their current day totals and a projected total if the current item is confirmed, updating live as quantity changes.

**Independent Test**: Log two previous meals, navigate to `/log`, search and select a food, verify the current day totals are shown alongside a projected total that updates when you change the quantity.

### Implementation

- [x] T009 [US2] Fetch today's diary day in `FoodLogConfirm.jsx` on mount via `getDiaryDay(today)` from `diaryClient.js`; store `summary` (`DailySummaryDto`) and `goalSnapshot` (`GoalSnapshotDto`) in component state in `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`
- [x] T010 [US2] Add a daily-impact section to `FoodLogConfirm.jsx` that renders current totals (calories, protein, carbs, fat) and projected totals (`current + food.perServing × quantity`) for each macro; this section re-computes on every quantity change in `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`
- [x] T011 [US2] Handle no-goals state in the daily-impact section: when `goalSnapshot` is null, display raw current and projected totals without a goal comparison, and show a prompt "Set your nutrition goals" linking to `/goal-setup` in `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`

**Checkpoint**: US1 and US2 both work. Changing quantity on the confirm screen updates the projected totals in real time.

---

## Phase 5: User Story 3 — Quick-Add a Recently Logged Food (Priority: P3)

**Goal**: Users who frequently log the same foods see a "Recent Foods" list above the search panel. Selecting a recent item skips search and goes directly to the confirmation screen with the last-used serving size pre-filled.

**Independent Test**: Log a food, return to `/log`, verify that food appears in the "Recent Foods" section. Select it and verify the confirm screen opens with quantity pre-filled.

### Backend Implementation

- [x] T012 [P] [US3] Create `RecentFoodDto` record with fields: `Id`, `Name`, `CaloriesPerServing`, `ProteinPerServing`, `CarbsPerServing`, `FatPerServing`, `ServingSizeGrams`, `LastServingSizeGrams` (the actual `ServingSizeGrams` value from the most recent `MealLog` entry for this food) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/Dtos/Responses/RecentFoodDto.cs`
- [x] T013 [P] [US3] Add `ToRecentFoodDto(decimal lastServingSizeGrams)` mapping extension to `FoodSearchMappings.cs` that maps a `LocalFoodItem` plus the last logged serving size to `RecentFoodDto` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/Mappings/FoodSearchMappings.cs`
- [x] T014 [US3] Add `GetRecentFoodsAsync(Guid userId)` to `IFoodSearchService` returning `Task<ServiceResponse<List<RecentFoodDto>>>` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/IFoodSearchService.cs`
- [x] T015 [US3] Implement `GetRecentFoodsAsync` in `FoodSearchService`: query `_db.MealLogs.AsNoTracking()` where `UserId == userId && LocalFoodItemId != null && LoggedAt >= UtcNow.AddDays(-30)`, include `LocalFoodItem` navigation, group by `LocalFoodItemId`, from each group select the entry with the most recent `LoggedAt`, order by `LoggedAt` descending, take 10, map each to `RecentFoodDto` via `ToRecentFoodDto(entry.ServingSizeGrams ?? entry.LocalFoodItem.TypicalServingSizeGrams)` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/FoodSearchService.cs`
- [x] T016 [US3] Add `[HttpGet("RecentFoods")]` action to `FoodScanController`: resolve current user id via `_currentUserService`, call `await _foodSearchService.GetRecentFoodsAsync(userId)`, return `result.ToActionResult()` in `MacrosTrackerAPI/src/GymScan.API/Controllers/FoodScanController.cs`

### Frontend Implementation

- [x] T017 [US3] Add "Recent Foods" section to the search state in `ManualLog.jsx`: fetch via `getRecentFoods()` from `nutritionLogClient.js` on mount, render a labelled list of up to 10 items showing food name and per-serving calories, hide the entire section when the list is empty, show a loading spinner while fetching in `MacrosTrackerWeb/src/pages/ManualLog.jsx`
- [x] T018 [US3] Wire Recent Foods item click to transition to the confirm state with `initialQuantity = item.lastServingSizeGrams / item.servingSizeGrams` passed as a prop to `FoodLogConfirm.jsx`; update `FoodLogConfirm.jsx` to accept and use an `initialQuantity` prop (default `1`) instead of always starting at `1` in `MacrosTrackerWeb/src/pages/ManualLog.jsx` and `MacrosTrackerWeb/src/components/FoodLogConfirm.jsx`

**Checkpoint**: All three user stories work independently. Recent Foods list appears after a prior log, items open the confirm screen with the correct pre-filled quantity.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T019 Build the solution to verify no compilation errors: `dotnet build` in `MacrosTrackerAPI/`
- [ ] T020 Run all 10 smoke test steps from `specs/006-daily-nutrition-log/quickstart.md` end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — T001, T002, T003 can start immediately and run in parallel
- **Phase 2 (Foundational)**: Depends on Phase 1 completion (route + page file must exist before T004 can complete)
- **Phase 3 (US1)**: Depends on Phase 2 — T005 and T006 require the `ManualLog.jsx` container from T004
- **Phase 4 (US2)**: Depends on Phase 3 — `FoodLogConfirm.jsx` from T005 must exist before adding the preview section
- **Phase 5 (US3)**: Backend tasks (T012–T016) can start after Phase 1 in parallel with frontend phases; frontend tasks (T017–T018) depend on Phase 3 (ManualLog.jsx state machine must exist)
- **Phase 6 (Polish)**: Depends on all desired user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (`FoodLogConfirm.jsx` must exist)
- **US3 (P3)**: Backend tasks are independent; frontend tasks depend on US1

### Within Each User Story

- T005 (create component) before T006 (wire it into the page)
- T006 (confirm flow) before T007/T008 (error handling / empty state)
- T009 (fetch diary) before T010 (render preview) before T011 (no-goals handling)
- T012/T013 (DTO + mapping) before T014 (interface) before T015 (implementation) before T016 (controller)
- T016 (backend endpoint live) before T017 (frontend can call it)
- T017 (recent list visible) before T018 (clicking an item pre-fills confirm)

---

## Parallel Opportunities

### Phase 1 — all three in parallel

```
T001 Add /log route         →  App.jsx
T002 Add nav link           →  PageShell.jsx
T003 Create API client      →  nutritionLogClient.js
```

### Phase 5 Backend — T012 and T013 in parallel (different files)

```
T012 Create RecentFoodDto   →  RecentFoodDto.cs
T013 Add mapping extension  →  FoodSearchMappings.cs
```

### US3 Backend vs. US2 Frontend — can proceed in parallel (different layers)

```
Developer A: T012 → T013 → T014 → T015 → T016  (US3 backend)
Developer B: T009 → T010 → T011                  (US2 frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 1 (T005–T008)
4. **STOP and validate**: run steps 1–6 of the quickstart smoke test
5. Ship or demo the core log flow

### Incremental Delivery

| Stage | Adds | Validates |
|-------|------|-----------|
| Phase 1 + 2 | Routable empty page | Navigation works |
| + Phase 3 (US1) | Search → select → log → diary | Full MVP log flow |
| + Phase 4 (US2) | Live daily preview | Impact visibility |
| + Phase 5 (US3) | Recent foods quick-add | Repeat-logging efficiency |
| + Phase 6 | Build + smoke test | Release readiness |

---

## Notes

- No test tasks generated — not requested in spec; Constitution Principle V applies
- `[P]` = different files, no incomplete-task dependencies; safe to run concurrently
- `[USn]` = traces each task to the user story it delivers
- US3 backend tasks (T012–T016) can begin after Phase 1 completes, in parallel with US1/US2 frontend work
- `lastServingSizeGrams` in `RecentFoodDto` falls back to `TypicalServingSizeGrams` if the most recent log's `ServingSizeGrams` is null
- Commit after each phase checkpoint to keep the branch clean
