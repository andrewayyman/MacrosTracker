# Quickstart: AI Food Scan

**Branch**: `004-food-scan` | **Date**: 2026-05-26

---

## Prerequisites

- Backend: .NET 10 SDK, SQL Server (local or Azure)
- Frontend: Node 20+, `npm` or compatible package manager
- Google Gemini API key (obtain from Google AI Studio at `aistudio.google.com`)
- Existing specs 001–003 implemented and database up to date

---

## Backend Setup

### 1. Add the Gemini API key

The AI key is already loaded from the `AI` configuration section. Set it in user secrets (never in source):

```powershell
cd MacrosTrackerAPI
dotnet user-secrets set "AI:ApiKey" "<your-gemini-api-key>" --project src/GymScan.API
```

Confirm the existing `appsettings.json` has the `AI` section with `Provider: "Gemini"` and `Model: "gemini-2.5-flash"`.

### 2. Add the uploads directory

The API serves scan images as static files from `wwwroot/uploads/scans/`. Create the folder:

```powershell
New-Item -ItemType Directory -Force "MacrosTrackerAPI/src/GymScan.API/wwwroot/uploads/scans"
```

Add to `.gitignore` (keep the folder, ignore contents):
```
MacrosTrackerAPI/src/GymScan.API/wwwroot/uploads/scans/*
!MacrosTrackerAPI/src/GymScan.API/wwwroot/uploads/scans/.gitkeep
```

### 3. Run the new migration

From the solution root:

```powershell
cd MacrosTrackerAPI
dotnet ef migrations add AddFoodScanAndMealLog `
  --project src/GymScan.Database `
  --startup-project src/GymScan.API
dotnet ef database update `
  --project src/GymScan.Database `
  --startup-project src/GymScan.API
```

This creates the `LocalFoodItems`, `FoodScans`, and `MealLogs` tables and seeds the initial Egyptian food data.

### 4. Start the backend

```powershell
cd MacrosTrackerAPI
dotnet run --project src/GymScan.API
```

Open `http://localhost:5000/swagger` and verify the new `FoodScan` endpoints appear:
- `POST /api/FoodScan/Analyze`
- `POST /api/FoodScan/Log`
- `GET /api/FoodScan/Search`

---

## Smoke Tests (Backend)

Authenticate first to get a JWT token, then:

### Test 1 — File validation rejects bad input
```powershell
# Should return 400 — file too large or wrong type
curl -X POST http://localhost:5000/api/FoodScan/Analyze `
  -H "Authorization: Bearer <token>" `
  -F "image=@not-an-image.txt"
```
Expected: `400` with a specific validation error in `errorList`.

### Test 2 — Analyze a food photo
```powershell
curl -X POST http://localhost:5000/api/FoodScan/Analyze `
  -H "Authorization: Bearer <token>" `
  -F "image=@test-food.jpg"
```
Expected: `200` with `data.foodName`, `data.calories`, macros, and `data.resultSource`.

### Test 3 — Manual search
```powershell
curl "http://localhost:5000/api/FoodScan/Search?q=koshary" `
  -H "Authorization: Bearer <token>"
```
Expected: `200` with at least one result in `data` array.

### Test 4 — Log a meal
```powershell
# Use scanId from Test 2
curl -X POST http://localhost:5000/api/FoodScan/Log `
  -H "Authorization: Bearer <token>" `
  -H "Content-Type: application/json" `
  -d '{"foodName":"Koshary","calories":520,"protein":18,"carbs":92,"fat":11,"mealType":"Lunch","foodScanId":"<scan-id>"}'
```
Expected: `201` with `data.id` and `data.diaryDate` set to today.

### Test 5 — AI service unavailable (optional)
Temporarily set `AI:ApiKey` to an invalid value. Attempt an analyze call.
Expected: `503` with `message` containing fallback guidance and no crash.

---

## Frontend Setup

No additional `npm install` needed. All required packages were installed in spec 003.

### Verify Scan page is routed
Open `http://localhost:5173/scan` — the `Scan.jsx` page should render.
After this feature is implemented, it will show the upload UI instead of a placeholder.

---

## Verify End-to-End Happy Path

1. Log in as a test user
2. Navigate to `/scan`
3. Upload a food photo (JPEG of a meal)
4. Confirm the result card appears with food name and macros
5. Select meal type "Lunch" and tap "Log this meal"
6. Confirm the success toast appears
7. Navigate to `/` (dashboard) and confirm the macro totals updated

---

## Common Issues

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| 401 on analyze | JWT expired | Re-login to get a fresh token |
| 503 from analyze | Gemini API key not set | Check user secrets `AI:ApiKey` |
| 400 "file type not supported" | File failed magic bytes check | Use a real JPEG/PNG image |
| Migration fails | Prior migrations not applied | Run `dotnet ef database update` from spec 001 first |
| Images not served | wwwroot/uploads folder missing | Run step 2 of backend setup |
