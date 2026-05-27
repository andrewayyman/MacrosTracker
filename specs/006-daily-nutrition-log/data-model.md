# Data Model: Daily Nutrition Log (Spec 006)

## New Entities

None. Spec 006 introduces no new database entities or EF Core migrations. All data is read from and written to entities established in Spec 003 and Spec 004.

---

## Entities Reused

### LocalFoodItem *(Spec 004, GymScan.Database/Entities/Nutrition/LocalFoodItem.cs)*

Represents a food item in the pre-seeded nutritional database. Searched by name and displayed on the food detail/confirmation screen.

| Field | Type | Notes |
|-------|------|-------|
| `Id` | `Guid` | Primary key |
| `Name` | `string` | Display name shown in search results |
| `AlternateNames` | `string?` | Pipe- or comma-separated alternate names (used in `LIKE` search) |
| `CaloriesPer100g` | `decimal` | Nutrition per 100g of food |
| `ProteinPer100g` | `decimal` | Nutrition per 100g |
| `CarbsPer100g` | `decimal` | Nutrition per 100g |
| `FatPer100g` | `decimal` | Nutrition per 100g |
| `TypicalServingSizeGrams` | `decimal` | Default serving size used to compute per-serving values |

**Serving computation (done by `FoodSearchMappings`):**
```
CaloriesPerServing = CaloriesPer100g × TypicalServingSizeGrams / 100
```
The same formula applies to Protein, Carbs, Fat.

**Quantity adjustment (done on the frontend):**
```
ActualCalories = CaloriesPerServing × quantity          // quantity = serving multiplier
ActualServingSizeGrams = TypicalServingSizeGrams × quantity
```

---

### MealLog *(Spec 004, GymScan.Database/Entities/Nutrition/MealLog.cs)*

Represents a single logged meal entry for a user on a given calendar day. Manual logs from Spec 006 write to this same entity.

| Field | Type | Notes |
|-------|------|-------|
| `Id` | `Guid` | Primary key |
| `UserId` | `Guid` | FK → `User` |
| `DiaryDate` | `DateOnly` | Calendar day of the entry (today for Spec 006 logs) |
| `MealType` | `MealType` enum | `Breakfast` / `Lunch` / `Dinner` / `Snack` |
| `FoodName` | `string` | Display name at time of logging |
| `Calories` | `decimal` | Actual calories for the logged quantity |
| `Protein` | `decimal` | Actual protein (g) for the logged quantity |
| `Carbs` | `decimal` | Actual carbs (g) for the logged quantity |
| `Fat` | `decimal` | Actual fat (g) for the logged quantity |
| `ServingSizeGrams` | `decimal?` | Actual serving size in grams for the logged quantity |
| `FoodScanId` | `Guid?` | `null` for all manual log entries (Spec 006) |
| `LocalFoodItemId` | `Guid?` | FK → `LocalFoodItem` (set for all Spec 006 entries) |
| `LoggedAt` | `DateTime` | UTC timestamp of logging |
| `IsDeleted` | `bool` | Soft-delete flag; global query filter excludes deleted rows |

**For manual log entries (Spec 006):**
- `FoodScanId` is always `null`
- `LocalFoodItemId` is always set (to the selected food item's `Id`)
- `DiaryDate` is always today's UTC date

---

### DailyNutritionGoal *(Spec 003, GymScan.Database/Entities/Nutrition/DailyNutritionGoal.cs)*

Read by the frontend (via `GET /api/Diary?date=today`) to compute the daily progress preview on the confirmation screen. Not modified by Spec 006.

| Field | Type | Notes |
|-------|------|-------|
| `CaloriesTarget` | `decimal` | User's daily calorie goal |
| `ProteinGramsTarget` | `decimal` | User's daily protein goal |
| `CarbohydratesGramsTarget` | `decimal` | User's daily carb goal |
| `FatGramsTarget` | `decimal` | User's daily fat goal |

---

## Derived View: Recent Foods

No stored entity. Computed at read time from `MealLogs`.

**Definition:** Up to 10 distinct `LocalFoodItem` records that the authenticated user has logged in the last 30 days, ordered by most recent `LoggedAt` timestamp.

**EF Core conceptual query:**
```csharp
_db.MealLogs
    .AsNoTracking()
    .Where(m => m.UserId == userId
             && m.LocalFoodItemId != null
             && m.LoggedAt >= DateTime.UtcNow.AddDays(-30))
    .GroupBy(m => m.LocalFoodItemId)
    .Select(g => g.OrderByDescending(m => m.LoggedAt).First())
    .OrderByDescending(m => m.LoggedAt)
    .Take(10)
    .Select(m => m.LocalFoodItem)   // navigation property
```

**Response shape:** `List<FoodSearchResultDto>` — same DTO as `GET /api/FoodScan/Search`.

---

## DTOs

### New DTOs

None. All new endpoint responses use the existing `FoodSearchResultDto`.

### Existing DTOs Reused

| DTO | From | Used For |
|-----|------|----------|
| `FoodSearchResultDto` | Spec 004 FoodSearch | Recent foods list response |
| `LogMealRequest` | Spec 004 FoodScan | Log a manual food entry (unchanged shape) |
| `MealLogDto` | Spec 004 FoodScan | Log confirmation response (unchanged) |
| `DiaryDayDto` / `DailySummaryDto` | Spec 005 Diary | Daily totals for the frontend preview |
