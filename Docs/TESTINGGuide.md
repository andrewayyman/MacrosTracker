# GymScan API - Complete Testing Guide

## Prerequisites

- .NET 10 SDK installed
- SQL Server (LocalDB is fine)
- A Gemini API key set in user secrets (see below)
- Any REST client: curl, Postman, Scalar docs UI, or PowerShell

## 1. Setup

### Set the Gemini API key (one-time)

```powershell
cd MacrosTrackerAPI
dotnet user-secrets set "AI:ApiKey" "YOUR_GEMINI_KEY" --project src/GymScan.API
```

### Start the API

```powershell
cd MacrosTrackerAPI
dotnet run --project src/GymScan.API
```

The API runs at **http://localhost:5051**. Swagger/Scalar docs at **http://localhost:5051/docs**.

### Seeded Test Users

On first startup, the app seeds four test users. All share the password **`Test@1234`**.

| Email | Name | Status | Notes |
|---|---|---|---|
| `admin@gymscan.test` | Ahmed Hassan | ProfileCompleted | Fully set up, has nutrition goals (2200 cal) |
| `sara@gymscan.test` | Sara Ali | ProfileCompleted | Fully set up, has nutrition goals (1800 cal) |
| `new@gymscan.test` | Omar | AccountCreated | Fresh account, no profile, no goals |
| `disabled@gymscan.test` | Nour Ibrahim | ProfileCompleted | **Inactive** account, login should fail |

---

## 2. Authentication

### Login (get JWT token)

```powershell
curl -X POST http://localhost:5051/api/Auth/Login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@gymscan.test","password":"Test@1234"}'
```

**Expected**: 200 with `data.accessToken`, `data.refreshToken`, and `data.user`.

Copy the `accessToken` value. Use it as `Bearer <token>` in all subsequent requests.

### Verify disabled user is rejected

```powershell
curl -X POST http://localhost:5051/api/Auth/Login `
  -H "Content-Type: application/json" `
  -d '{"email":"disabled@gymscan.test","password":"Test@1234"}'
```

**Expected**: 401 - "Invalid email or password."

### Verify new user has AccountCreated status

```powershell
curl -X POST http://localhost:5051/api/Auth/Login `
  -H "Content-Type: application/json" `
  -d '{"email":"new@gymscan.test","password":"Test@1234"}'
```

**Expected**: 200 with `data.user.setupStatus` = `"AccountCreated"`.

---

## 3. Food Scan - Analyze (POST /api/FoodScan/Analyze)

### 3a. Upload a real food photo

```powershell
curl -X POST http://localhost:5051/api/FoodScan/Analyze `
  -H "Authorization: Bearer <TOKEN>" `
  -F "image=@path/to/food-photo.jpg"
```

**Expected**: 200 with:
- `data.foodName` - AI-identified food name
- `data.calories`, `data.protein`, `data.carbs`, `data.fat` - macro values
- `data.resultSource` - either `"AiEstimate"` or `"Verified"` (if matched a local Egyptian food)
- `data.confidencePercent` - 0-100 confidence score
- `data.scanId` - GUID to use for logging

If the food matches a seeded Egyptian item (e.g., Koshary, Shawarma), `resultSource` will be `"Verified"` and macros will come from the local database.

### 3b. Reject a non-image file

```powershell
curl -X POST http://localhost:5051/api/FoodScan/Analyze `
  -H "Authorization: Bearer <TOKEN>" `
  -F "image=@some-text-file.txt"
```

**Expected**: 400 - "File type not supported. Upload a JPEG, PNG, WebP, or GIF image."

### 3c. Reject a file larger than 10 MB

Upload any file > 10 MB.

**Expected**: 400 - "File size must not exceed 10 MB."

### 3d. Test without auth token

```powershell
curl -X POST http://localhost:5051/api/FoodScan/Analyze `
  -F "image=@food.jpg"
```

**Expected**: 401 Unauthorized.

### 3e. Test AI service unavailable

Temporarily set an invalid API key in `appsettings.json` (`"ApiKey": "invalid"`), restart the server, and analyze a photo.

**Expected**: 503 - "AI service is temporarily unavailable. Try searching manually instead."

---

## 4. Food Search (GET /api/FoodScan/Search)

### 4a. Search for an Egyptian food

```powershell
curl "http://localhost:5051/api/FoodScan/Search?q=koshary" `
  -H "Authorization: Bearer <TOKEN>"
```

**Expected**: 200 with at least 1 result. Each result includes:
- `id` - LocalFoodItem GUID
- `name` - e.g., "Koshary"
- `caloriesPerServing`, `proteinPerServing`, `carbsPerServing`, `fatPerServing`
- `servingSizeGrams`

### 4b. Search by alternate name (Arabic)

```powershell
curl "http://localhost:5051/api/FoodScan/Search?q=falafel" `
  -H "Authorization: Bearer <TOKEN>"
```

**Expected**: 200 - returns Ta'meya (Egyptian falafel).

### 4c. Search with no results

```powershell
curl "http://localhost:5051/api/FoodScan/Search?q=zzzznotfound" `
  -H "Authorization: Bearer <TOKEN>"
```

**Expected**: 200 with empty `data` array and message "Found 0 result(s)."

### 4d. Empty query

```powershell
curl "http://localhost:5051/api/FoodScan/Search?q=" `
  -H "Authorization: Bearer <TOKEN>"
```

**Expected**: 400 - "Search query is required."

### 4e. Some foods to search for

| Query | Expected Match |
|---|---|
| koshary | Koshary |
| falafel | Ta'meya |
| hummus | Hummus |
| shawarma | Shawarma |
| konafa | Konafa |
| basbousa | Basbousa |
| molokhia | Molokhia |
| liver | Liver Sandwich, Alexandrian Liver |
| rice | Egyptian Rice, Roz Bel Laban |
| bread | Baladi Bread |

---

## 5. Meal Logging (POST /api/FoodScan/Log)

### 5a. Log from a scan result

After a successful Analyze call, use the returned data:

```powershell
curl -X POST http://localhost:5051/api/FoodScan/Log `
  -H "Authorization: Bearer <TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{
    "foodName": "Koshary",
    "calories": 560,
    "protein": 19.2,
    "carbs": 98,
    "fat": 10.5,
    "servingSizeGrams": 350,
    "mealType": "Lunch",
    "foodScanId": "<SCAN_ID_FROM_ANALYZE>",
    "localFoodItemId": "a0000001-0000-0000-0000-000000000001"
  }'
```

**Expected**: 201 with `data.id`, `data.diaryDate` = today, `data.mealType` = "Lunch".

### 5b. Log from manual search (no scan)

```powershell
curl -X POST http://localhost:5051/api/FoodScan/Log `
  -H "Authorization: Bearer <TOKEN>" `
  -H "Content-Type: application/json" `
  -d '{
    "foodName": "Hummus",
    "calories": 166,
    "protein": 8,
    "carbs": 14,
    "fat": 10,
    "servingSizeGrams": 100,
    "mealType": "Snack",
    "localFoodItemId": "a0000001-0000-0000-0000-000000000016"
  }'
```

**Expected**: 201 - `foodScanId` will be null in the DB (manual search, no scan).

### 5c. Valid meal types

| Value | Description |
|---|---|
| Breakfast | Morning meal |
| Lunch | Midday meal |
| Dinner | Evening meal |
| Snack | Between meals |

### 5d. Validation errors

**Missing food name:**
```json
{"foodName":"","calories":100,"protein":5,"carbs":10,"fat":3,"mealType":"Lunch"}
```
**Expected**: 400 - FoodName required.

**Negative calories:**
```json
{"foodName":"Test","calories":-10,"protein":5,"carbs":10,"fat":3,"mealType":"Lunch"}
```
**Expected**: 400 - Calories >= 0.

**Invalid meal type:**
```json
{"foodName":"Test","calories":100,"protein":5,"carbs":10,"fat":3,"mealType":"Brunch"}
```
**Expected**: 400 - "MealType must be one of: Breakfast, Lunch, Dinner, Snack."

---

## 6. End-to-End Flow (Happy Path)

1. **Login** as `admin@gymscan.test` / `Test@1234` -> copy `accessToken`
2. **Search** for "shawarma" -> see Shawarma with per-serving macros
3. **Log** the Shawarma as Dinner with `localFoodItemId` from search result
4. **Analyze** a real food photo -> get AI result with macros
5. **Log** the scan result as Lunch with the `scanId` from step 4
6. **Search** for "ful" -> should return "Ful Medames" and "Foul with Oil"

---

## 7. Cross-User Isolation

1. Login as `admin@gymscan.test`, log a meal
2. Login as `sara@gymscan.test`, log a different meal
3. Each user's meal logs are scoped to their `userId` - no cross-contamination

---

## 8. Seeded Egyptian Food Items (55 total)

The database is pre-loaded with verified nutritional data for:

**Main Dishes**: Koshary, Ful Medames, Hawawshi, Molokhia, Mahshi, Feteer Meshaltet, Shawarma, Kofta, Kebab, Grilled Chicken, Kabab Halla, Mixed Grill, Shakshuka, Macarona Bechamel, Fatta, Fattah, Chicken Pane

**Sandwiches**: Liver Sandwich, Taameya Sandwich, Foul Sandwich, Sausage Sandwich, Alexandrian Liver

**Sides & Staples**: Egyptian Rice, Baladi Bread, Lentil Soup, Hummus, Baba Ghanoush, Bessara, Grape Leaves, Sambousek, Bamia, Moussaka, Torly, Fiteer Baladi, Tahini, Dukkah

**Dairy**: Gibna Domiati, Gebna Areesh, Ayran

**Desserts**: Om Ali, Konafa, Basbousa, Roz Bel Laban, Qatayef, Halawa Tahinia, Mehalabeya, Sahlab

**Beverages**: Karkade

---

## 9. API Endpoints Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Auth/Register` | No | Create new account |
| POST | `/api/Auth/Login` | No | Get JWT tokens |
| POST | `/api/Auth/Refresh` | No | Refresh expired token |
| POST | `/api/Auth/Logout` | Yes | Revoke session |
| GET | `/api/Auth/Me` | Yes | Get current user |
| POST | `/api/Profile/Upsert` | Yes | Set/update profile |
| GET | `/api/Profile/Me` | Yes | Get profile |
| GET | `/api/Profile/SetupSummary` | Yes | Get setup status |
| GET | `/api/NutritionGoal/Daily` | Yes | Get daily goal |
| GET | `/api/NutritionGoal/Suggested` | Yes | Get AI-suggested goal |
| POST | `/api/NutritionGoal/Upsert` | Yes | Set/update daily goal |
| POST | `/api/FoodScan/Analyze` | Yes | Upload food photo for AI analysis |
| POST | `/api/FoodScan/Log` | Yes | Log a meal to diary |
| GET | `/api/FoodScan/Search` | Yes | Search local food database |

All authenticated endpoints require `Authorization: Bearer <token>` header.

---

## 10. Scalar API Docs (Interactive)

Open **http://localhost:5051/docs** in your browser for interactive API documentation. You can test all endpoints directly from the browser UI. Click the lock icon to enter your Bearer token.
