# Quickstart: Meal Diary & History View

**Branch**: `005-meal-diary` | **Date**: 2026-05-27

---

## Prerequisites

- Specs 001–004 fully implemented and database up to date
- At least one meal logged via the Scan page (Spec 004) so diary entries exist for today
- Backend running at `http://localhost:5000`
- Frontend running at `http://localhost:5173`

No new NuGet packages, npm packages, or database migrations are required for this feature.

---

## Backend Setup

No additional setup beyond Spec 004. The `MealLogs` and `UserDailyNutritionGoal` tables already exist.

### Start the backend

```powershell
cd MacrosTrackerAPI
dotnet run --project src/GymScan.API
```

Open `http://localhost:5000/swagger` and verify the new `Diary` endpoints appear:
- `GET /api/Diary`
- `DELETE /api/Diary/entries/{id}`

Both should show the `[Authorize]` lock icon.

---

## Smoke Tests (Backend)

Authenticate first to obtain a JWT token, then:

### Test 1 — Get today's diary (with entries)

First log at least one meal via `POST /api/FoodScan/Log`, then:

```powershell
curl "http://localhost:5000/api/Diary" `
  -H "Authorization: Bearer <token>"
```

Expected: `200` with `data.mealGroups` containing at least one group, `data.dailySummary.totalCalories > 0`, and `data.goals` populated (if goals are set).

### Test 2 — Get yesterday's diary (or any past date)

```powershell
curl "http://localhost:5000/api/Diary?date=2026-05-26" `
  -H "Authorization: Bearer <token>"
```

Expected: `200` with `data.date = "2026-05-26"` and `data.mealGroups` reflecting entries for that day (empty array if none).

### Test 3 — Reject a future date

```powershell
curl "http://localhost:5000/api/Diary?date=2030-01-01" `
  -H "Authorization: Bearer <token>"
```

Expected: `400` with `message` containing guidance about future dates.

### Test 4 — Delete a diary entry

Use an `id` from Test 1's response:

```powershell
curl -X DELETE "http://localhost:5000/api/Diary/entries/<entry-id>" `
  -H "Authorization: Bearer <token>"
```

Expected: `204` with no response body.

Confirm the entry is gone:

```powershell
curl "http://localhost:5000/api/Diary" `
  -H "Authorization: Bearer <token>"
```

Expected: The deleted entry no longer appears in `data.mealGroups` and `data.dailySummary.totalCalories` decreased accordingly.

### Test 5 — Delete an entry that does not belong to the user

Attempt to delete an entry ID belonging to a different user (or a non-existent ID).

Expected: `404` with `message = "Meal log entry not found."`.

### Test 6 — Diary with no active goal

Register a fresh test account, skip goal setup, log a meal, then call `GET /api/Diary`.

Expected: `200` with `data.goals = null`. No crash or 500 error.

---

## Frontend Setup

No additional `npm install` needed. The `/history` route already exists in `App.jsx`.

### Verify Diary page

Open `http://localhost:5173/history` — the `History.jsx` page should now render the full diary UI instead of the placeholder.

---

## Verify End-to-End Happy Path

1. Log in as a test user who has already logged meals today (use Scan page if needed)
2. Navigate to `/history`
3. Confirm today's meals appear grouped under their meal type headings
4. Confirm the daily summary shows correct totals and remaining macros vs goals
5. Tap the previous day arrow — confirm the date changes and entries update
6. Tap the next day arrow back to today — confirm navigation is blocked if already at today
7. On a diary entry, tap delete — confirm confirmation prompt appears
8. Confirm deletion — entry disappears and daily totals update immediately
9. Log in as a user with no goals set — navigate to `/history` — confirm raw totals show with a link to set goals

---

## Common Issues

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| 401 on diary endpoints | JWT expired | Re-login to get a fresh token |
| `data.mealGroups` is empty | No meals logged for today | Log a meal via `/scan` first |
| `data.goals` is null unexpectedly | User has no active goal | Complete goal setup via `/goal-setup` |
| 404 on delete | Wrong entry ID or different user | Use an entry ID from your own diary response |
| History page shows placeholder | Spec 005 frontend not yet implemented | Implement the diary UI tasks |
