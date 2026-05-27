# Implementation Plan: Daily Nutrition Log

**Branch**: `006-spec-006` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-daily-nutrition-log/spec.md`

## Summary

Add a dedicated manual food-logging page that lets authenticated users search the pre-seeded local food database, select an item, adjust the serving quantity with real-time nutritional feedback and a live daily-progress preview, choose a meal type, and confirm the log entry to their diary. A "Recent Foods" quick-add list shows the 10 most recently logged distinct items for repeat entry with fewer steps.

The implementation is minimal: the vast majority of required infrastructure already exists from Spec 004 (food search, log endpoint, food items, meal log entity) and Spec 005 (diary day read, daily summary component). New backend work is a single `GetRecentFoodsAsync` method on `FoodSearchService` and one new `GET /api/FoodScan/RecentFoods` action. New frontend work is a `ManualLog.jsx` page, a `FoodLogConfirm.jsx` confirmation component, a `nutritionLogClient.js` API client, and route/nav wiring. No database migrations are required.

---

## Technical Context

**Language/Version**: C# with .NET 10 (backend); JavaScript with React 18 (frontend)

**Primary Dependencies**: ASP.NET Core controllers, JWT bearer authentication, Entity Framework Core with SQL Server, React Router, Axios, Zustand

**Storage**: SQL Server — reads `LocalFoodItems` and `MealLogs`; writes to `MealLogs` via the existing `POST /api/FoodScan/Log` endpoint. No new tables or migrations.

**Testing**: Solution build verification plus the 10-step smoke test in `quickstart.md`. No backend unit-test project or frontend test harness — per repository standard.

**Target Platform**: Web application (desktop and mobile browsers), same as Specs 004–005

**Project Type**: Web application with separate backend API (modular monolith) and frontend SPA

**Performance Goals**: Food search results under 2 seconds; nutritional preview recalculation under 300ms (client-side arithmetic, no network call per keystroke); log submission under 500ms; recent foods list under 1 second.

**Constraints**: All endpoints require authentication; standard `ServiceResponse<T>` envelope on every response; entries logged for today only (no backdating); editing existing entries is out of scope; no new EF Core migrations; no unit tests.

**Scale/Scope**: Same v1 scale as Specs 004–005 (~1,000 active users).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase-0 Gate

| Principle | Verdict | Notes |
|-----------|---------|-------|
| I. N-tier Modular Monolith | PASS | No new projects. New service method in `GymScan.Services`, new controller action in `GymScan.API`. No database project changes (no migrations). |
| II. Thin Controllers, No Logic Leakage | PASS | The new `RecentFoods` action calls one service method and returns `ToActionResult()`. The existing `Log` action is unchanged. |
| III. CQRS-style Service Separation (No MediatR) | PASS | `GetRecentFoodsAsync` is a read-path addition to `FoodSearchService`. The write path uses the existing `FoodScanService.LogMealAsync`. No MediatR. |
| IV. Standard Response Contract | PASS | `GET /api/FoodScan/RecentFoods` returns `ServiceResponse<List<FoodSearchResultDto>>`. All other endpoints reused unchanged. |
| V. Simplicity — No Premature Complexity | PASS | No unit tests, no test harnesses. Daily preview computed client-side — no new preview endpoint. Recent foods computed with a single EF Core LINQ query. |

**Gate Result**: PASS — no violations, no Complexity Tracking entries required.

### Post-Phase-1 Recheck

Research, data model, contracts, and quickstart confirm full alignment with all five constitution principles. The feature adds one service method, one controller action, one page, one component, and one API client function. No architectural drift from the established pattern.

**Gate Result**: PASS

---

## Project Structure

### Documentation (this feature)

```text
specs/006-daily-nutrition-log/
├── plan.md                                  # this file
├── spec.md
├── research.md                              # Phase 0 output
├── data-model.md                            # Phase 1 output
├── quickstart.md                            # Phase 1 output
├── contracts/
│   └── nutrition-log-api.openapi.yaml       # Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md                                 # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
MacrosTrackerAPI/
└── src/
    ├── GymScan.API/
    │   └── Controllers/
    │       └── FoodScanController.cs              ← extend: add GetRecentFoods action
    └── GymScan.Services/
        └── Features/
            └── FoodSearch/
                ├── IFoodSearchService.cs          ← extend: add GetRecentFoodsAsync signature
                └── FoodSearchService.cs           ← extend: implement GetRecentFoodsAsync

MacrosTrackerWeb/
└── src/
    ├── api/
    │   └── nutritionLogClient.js                  ← new: getRecentFoods()
    ├── components/
    │   └── FoodLogConfirm.jsx                     ← new: quantity adjuster + daily preview + confirm
    ├── pages/
    │   └── ManualLog.jsx                          ← new: search state → confirm state
    ├── App.jsx                                    ← extend: add /log route
    └── components/
        └── PageShell.jsx                          ← extend: add "Log Food" nav link
```

**Structure Decision**: Follow the established `Features/{Domain}/` service organization from Spec 004. No new NuGet packages or npm packages required. All reused components (`FoodSearchPanel`, `MealTypeSelector`, `DailySummary`) and API clients (`foodScanClient.logMeal`, `diaryClient.getDiaryDay`) are imported unchanged.

---

## Complexity Tracking

No constitution violations. No exceptional complexity justifications required.
