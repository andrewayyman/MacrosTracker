# Quickstart: Progress Dashboard & Goal Achievement

## Prerequisites

- Spec 002 (Auth) implemented — JWT login works.
- Spec 003 (Nutrition Goals) implemented — at least one `DailyNutritionGoal` row with `IsActive = true` exists for the test user.
- Spec 006 (Daily Nutrition Log) implemented — `MealLog` entries exist across multiple dates for the test user.

## Running the Stack

```bash
# Terminal 1 — API
cd MacrosTrackerAPI
dotnet run --project src/GymScan.API

# Terminal 2 — Frontend
cd MacrosTrackerWeb
npm run dev
```

API base URL: `http://localhost:5139`
Frontend URL: `http://localhost:5173`

## Smoke Testing P1 — Daily Progress View

1. Log in as a test user who has a nutrition goal set and has logged food today.
2. Navigate to `http://localhost:5173/progress`.
3. Verify four progress bars are visible (Calories, Protein, Carbs, Fat).
4. Each bar should display: consumed / goal, and a remaining or "over by X" label.
5. Call the existing diary endpoint directly to cross-check values:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5139/api/Diary
```

The `dailySummary` and `goals` fields in the response should match what is shown on the progress bars.

## Smoke Testing P2 — Trend Charts

1. Navigate to the Trends tab on the `/progress` page.
2. Verify charts render for the default 7-day range.
3. Switch between 7, 30, and 90-day ranges and confirm charts update.
4. Cross-check via the new endpoint:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5139/api/Progress/trends?range=7"
```

Expected response shape:
```json
{
  "data": {
    "days": [ { "date": "2026-05-21", "calories": 1800, "hasData": true }, ... ],
    "goals": { "caloriesTarget": 2200, ... },
    "rangeInDays": 7
  },
  "message": "",
  "errorList": []
}
```

## Smoke Testing P3 — Streaks & Heatmap

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5139/api/Progress/streaks
```

Expected response:
- `currentStreak` — matches the count of consecutive on-goal days visible in the heatmap.
- `goalHitRate` — should equal `(OnGoal day count / total days with data in past 30 days) × 100`.
- `heatmapDays` — 30 entries, each with a `status` of `OnGoal`, `OverGoal`, `UnderGoal`, or `NoData`.

## Smoke Testing P4 — Weekly Summary

```bash
# Current week (defaults to this Monday)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5139/api/Progress/weekly

# Previous week
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5139/api/Progress/weekly?weekStart=2026-05-18"

# Invalid — not a Monday (expect 400)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5139/api/Progress/weekly?weekStart=2026-05-21"
```

## Verifying Empty States

1. Log in as a new user with no goals set and no log entries.
2. Navigate to `/progress`.
3. Verify the page shows a "Set your nutrition goals to see progress" prompt, not broken charts.

4. Log in as a user with goals but no log entries.
5. Navigate to `/progress`.
6. Verify today's progress bars show 0 / goal with "No entries yet today" messaging.

## Verifying Streak Logic

To verify a streak of N days:
1. Ensure the test user has N consecutive days (including or ending today) where `MealLog` calories ≤ `DailyNutritionGoal.CaloriesTarget`.
2. Call `GET /api/Progress/streaks` and confirm `currentStreak` = N.
3. Add a log entry that pushes one day over the calorie goal, then verify `currentStreak` resets to 0 (or the count since the break).

## Environment Notes

- Dates are compared using `DateOnly` — the API uses UTC for log timestamps but the `DiaryDate` field is the local calendar date set at log time.
- The `weekStart` parameter expects `yyyy-MM-dd` and must be a Monday. The API returns 400 otherwise.
- Recharts renders client-side; if charts are blank, open the browser console for render errors.
