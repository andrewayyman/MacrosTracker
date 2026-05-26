# Data Model: AI Food Scan

**Branch**: `004-food-scan` | **Date**: 2026-05-26

---

## New Entities

### LocalFoodItem

Stores verified nutritional data for Egyptian and regional dishes. Serves as the authoritative source when the AI identifies a food that matches an entry here.

**Location**: `GymScan.Database/Entities/Nutrition/LocalFoodItem.cs`
**Configuration**: `GymScan.Database/Data/Configurations/Nutrition/LocalFoodItemConfiguration.cs`

| Property | Type | Constraints | Notes |
|----------|------|------------|-------|
| Id | Guid | PK | Auto-generated |
| Name | string | Required, max 200 | Primary display name, e.g. "Koshary" |
| AlternateNames | string? | Max 500 | Pipe-delimited alternate names/spellings, e.g. "kosheri\|كشري" |
| CaloriesPer100g | decimal | Required, precision(7,2) | |
| ProteinPer100g | decimal | Required, precision(5,2) | |
| CarbsPer100g | decimal | Required, precision(5,2) | |
| FatPer100g | decimal | Required, precision(5,2) | |
| TypicalServingSizeGrams | decimal | Required, precision(6,2) | Egyptian portion size |
| CreatedAt | DateTime | Required | UTC |

**Implements**: None (not soft-deletable — it is reference data)

**Indexes**: `Name` (for search performance)

**Seed data**: 50+ entries defined in `GymScan.Database/Seeds/LocalFoodItemSeed.cs`

---

### FoodScan

Records a single AI analysis event — one per photo upload. Stores the result regardless of whether the user proceeds to log it.

**Location**: `GymScan.Database/Entities/Nutrition/FoodScan.cs`
**Configuration**: `GymScan.Database/Data/Configurations/Nutrition/FoodScanConfiguration.cs`

| Property | Type | Constraints | Notes |
|----------|------|------------|-------|
| Id | Guid | PK | Auto-generated |
| UserId | Guid | FK → User, Required | Owner of the scan |
| ImagePath | string | Required, max 500 | Server-relative path, e.g. `uploads/scans/{guid}.jpg` |
| FoodName | string | Required, max 200 | As identified by AI or verified local entry |
| Calories | decimal | Required, precision(7,2) | Per serving |
| Protein | decimal | Required, precision(5,2) | Grams per serving |
| Carbs | decimal | Required, precision(5,2) | Grams per serving |
| Fat | decimal | Required, precision(5,2) | Grams per serving |
| ServingSizeGrams | decimal? | precision(6,2) | Nullable — AI may not always estimate |
| ResultSource | int | Required | Enum: AiEstimate=1, Verified=2 |
| ConfidencePercent | int? | 0–100 | Null when source is Verified |
| Notes | string? | Max 500 | AI notes, e.g. "Mixed dish — estimate may vary" |
| ScannedAt | DateTime | Required | UTC |
| IsDeleted | bool | Required, default false | Soft delete |
| DeletedAt | DateTime? | | Soft delete timestamp |

**Implements**: `ISoftDeletable`

**Relationships**:
- `User` (many-to-one, required)
- `MealLog` (one-to-zero-or-one — optional, created when user confirms logging)

**Indexes**: `UserId, ScannedAt` (for history queries)

---

### MealLog

A confirmed diary entry. Created when a user taps "Log this meal" after a scan or manual food search. This is the source of truth for the dashboard and history features.

**Location**: `GymScan.Database/Entities/Nutrition/MealLog.cs`
**Configuration**: `GymScan.Database/Data/Configurations/Nutrition/MealLogConfiguration.cs`

| Property | Type | Constraints | Notes |
|----------|------|------------|-------|
| Id | Guid | PK | Auto-generated |
| UserId | Guid | FK → User, Required | Owner |
| DiaryDate | DateOnly | Required | Date the meal is attributed to (always today in v1) |
| MealType | int | Required | Enum: Breakfast=1, Lunch=2, Dinner=3, Snack=4 |
| FoodName | string | Required, max 200 | Snapshot at time of logging |
| Calories | decimal | Required, precision(7,2) | Snapshot at time of logging |
| Protein | decimal | Required, precision(5,2) | |
| Carbs | decimal | Required, precision(5,2) | |
| Fat | decimal | Required, precision(5,2) | |
| ServingSizeGrams | decimal? | precision(6,2) | |
| FoodScanId | Guid? | FK → FoodScan, nullable | Set when logged from a scan result |
| LocalFoodItemId | Guid? | FK → LocalFoodItem, nullable | Set when matched to verified local entry |
| LoggedAt | DateTime | Required | UTC |
| IsDeleted | bool | Required, default false | Soft delete |
| DeletedAt | DateTime? | | |

**Implements**: `ISoftDeletable`

**Relationships**:
- `User` (many-to-one, required)
- `FoodScan` (many-to-one, optional — null for manual search logs)
- `LocalFoodItem` (many-to-one, optional — null for AI-only results with no local match)

**Indexes**:
- `UserId, DiaryDate` (for today's diary / dashboard totals)
- `UserId, LoggedAt` (for history queries)

---

## AppDbContext Changes

Add to `AppDbContext.cs`:
```csharp
public DbSet<LocalFoodItem> LocalFoodItems { get; set; }
public DbSet<FoodScan> FoodScans { get; set; }
public DbSet<MealLog> MealLogs { get; set; }
```

---

## New Enums

**Location**: `GymScan.Services/Features/FoodScan/Enums/` (shared between service and API layers)

```csharp
public enum MealType { Breakfast = 1, Lunch = 2, Dinner = 3, Snack = 4 }
public enum ResultSource { AiEstimate = 1, Verified = 2 }
```

---

## Entity Relationship Diagram

```
User ──< FoodScan >──── MealLog >── LocalFoodItem
         (0..1)          (0..1)
```

- A user has many FoodScans (one per photo upload)
- A FoodScan may result in zero or one MealLog (user can discard)
- A MealLog may reference zero or one LocalFoodItem (when verified match found)
- A MealLog may exist without a FoodScan (manual food search logs)

---

## Migration

New migration name: `AddFoodScanAndMealLog`

Covers: `LocalFoodItem`, `FoodScan`, `MealLog` tables plus seed data for `LocalFoodItem`.
