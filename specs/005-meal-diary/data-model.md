# Data Model: Meal Diary & History View

**Branch**: `005-meal-diary` | **Date**: 2026-05-27

---

## No New Entities

This feature introduces no new database entities and requires no EF Core migration. All diary data is read from existing entities introduced in earlier specs:

- **`MealLog`** (Spec 004, `GymScan.Database/Entities/Nutrition/MealLog.cs`) — the source of diary entries.
- **`UserDailyNutritionGoal`** (Spec 003, `GymScan.Database/Entities/`) — provides the user's calorie and macro targets for the daily summary comparison.

---

## Existing Entities Referenced

### MealLog *(read + soft-delete)*

| Property | Type | Notes |
|----------|------|-------|
| Id | Guid | PK — used as the deletion target identifier |
| UserId | Guid | FK → User — all queries filter by the current authenticated user |
| DiaryDate | DateOnly | The diary calendar day the entry belongs to — primary filter key |
| MealType | int | Enum (Breakfast=1, Lunch=2, Dinner=3, Snack=4) — used for grouping |
| FoodName | string | Displayed in the diary list |
| Calories | decimal | Summed for the daily total |
| Protein | decimal | Summed for the daily total |
| Carbs | decimal | Summed for the daily total |
| Fat | decimal | Summed for the daily total |
| ServingSizeGrams | decimal? | Displayed per entry when present |
| LoggedAt | DateTime | UTC — entries are sorted chronologically within each meal group |
| IsDeleted | bool | EF Core global soft-delete filter already excludes `true` rows automatically |
| DeletedAt | DateTime? | Set when soft-deleting via `DiaryService` |

### UserDailyNutritionGoal *(read-only)*

| Property | Type | Notes |
|----------|------|-------|
| UserId | Guid | FK → User — joined by current user ID |
| CaloriesTarget | decimal | Compared against daily total in summary |
| ProteinGramsTarget | decimal | Compared against daily protein total |
| CarbohydratesGramsTarget | decimal | Compared against daily carbs total |
| FatGramsTarget | decimal | Compared against daily fat total |
| IsActive | bool | Only the active goal row is read |

---

## New Response DTOs

These are service-layer records only — not database entities, no configuration, no migration.

### DiaryDayDto

Top-level response for `GET /api/Diary`.

| Field | Type | Notes |
|-------|------|-------|
| Date | string | ISO 8601 date (YYYY-MM-DD) |
| MealGroups | MealGroupDto[] | Entries grouped and sorted by meal type |
| DailySummary | DailySummaryDto | Cumulative totals for the day |
| Goals | GoalSnapshotDto? | Null if no active goal exists for this user |

### MealGroupDto

One group per meal type that has at least one entry.

| Field | Type | Notes |
|-------|------|-------|
| MealType | string | Display label: "Breakfast", "Lunch", "Dinner", or "Snack" |
| Entries | MealLogEntryDto[] | Ordered by LoggedAt ascending |
| GroupCalories | decimal | Sum of calories in this group |

### MealLogEntryDto

One row in the diary list.

| Field | Type | Notes |
|-------|------|-------|
| Id | Guid | Used as the target for the delete endpoint |
| FoodName | string | |
| Calories | decimal | |
| Protein | decimal | |
| Carbs | decimal | |
| Fat | decimal | |
| ServingSizeGrams | decimal? | Null if not recorded |
| LoggedAt | string | ISO 8601 UTC datetime |

### DailySummaryDto

Aggregated totals for the selected date.

| Field | Type | Notes |
|-------|------|-------|
| TotalCalories | decimal | Sum of all `MealLog.Calories` for the date |
| TotalProtein | decimal | Sum of all `MealLog.Protein` |
| TotalCarbs | decimal | Sum of all `MealLog.Carbs` |
| TotalFat | decimal | Sum of all `MealLog.Fat` |

### GoalSnapshotDto

A read-only snapshot of the user's active daily targets.

| Field | Type | Notes |
|-------|------|-------|
| CaloriesTarget | decimal | |
| ProteinTarget | decimal | |
| CarbsTarget | decimal | |
| FatTarget | decimal | |

---

## Entity Relationship Diagram (unchanged from Spec 004)

```
User ──< MealLog >──── FoodScan
     └──< UserDailyNutritionGoal (0..1)
```

The diary feature queries `MealLog` filtered by `UserId + DiaryDate` and optionally joins `UserDailyNutritionGoal` filtered by `UserId + IsActive = true`.

---

## Query Logic (service layer)

### Get Diary Day

```text
1. Parse date parameter (default to today UTC if omitted)
2. Query MealLogs WHERE UserId = currentUser AND DiaryDate = date (soft-delete filter applied by EF Core)
3. Order by LoggedAt ascending
4. Group by MealType → build MealGroupDto list (only groups with entries, in enum order)
5. Aggregate totals → build DailySummaryDto
6. Query UserDailyNutritionGoal WHERE UserId = currentUser AND IsActive = true → build GoalSnapshotDto (or null)
7. Return DiaryDayDto
```

### Delete Diary Entry

```text
1. Load MealLog by Id WHERE UserId = currentUser (404 if not found or not owned by user)
2. Set IsDeleted = true, DeletedAt = DateTime.UtcNow
3. SaveChangesAsync
4. Return ServiceResponse with status 204
```
