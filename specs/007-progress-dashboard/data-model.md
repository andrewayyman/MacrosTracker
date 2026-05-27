# Data Model: Progress Dashboard & Goal Achievement

## No New Entities

This feature introduces **no new database entities**. All data is derived at read time from two existing entities:

| Entity | Location | Used For |
|--------|----------|----------|
| `MealLog` | `GymScan.Database/Entities/Nutrition/MealLog.cs` | Source of all calorie/macro totals |
| `DailyNutritionGoal` | `GymScan.Database/Entities/Nutrition/DailyNutritionGoal.cs` | Goal targets for comparison |

No EF Core migration is required for this feature.

---

## Existing Entity Reference

### MealLog (existing)

| Field | Type | Notes |
|-------|------|-------|
| `Id` | `Guid` | PK |
| `UserId` | `Guid` | FK → User |
| `DiaryDate` | `DateOnly` | The calendar day the entry belongs to |
| `Calories` | `decimal` | Calories for this entry at logged quantity |
| `Protein` | `decimal` | Protein grams |
| `Carbs` | `decimal` | Carbohydrate grams |
| `Fat` | `decimal` | Fat grams |
| `IsDeleted` | `bool` | Soft-delete; global EF query filter excludes deleted rows |
| `LoggedAt` | `DateTime` | UTC timestamp of logging |

### DailyNutritionGoal (existing)

| Field | Type | Notes |
|-------|------|-------|
| `UserId` | `Guid` | FK → User |
| `CaloriesTarget` | `int` | Daily calorie goal |
| `ProteinGramsTarget` | `double` | Daily protein goal |
| `CarbohydratesGramsTarget` | `double` | Daily carbs goal |
| `FatGramsTarget` | `double` | Daily fat goal |
| `IsActive` | `bool` | Only the active goal row is used for comparisons |

---

## New DTOs (Backend — GymScan.Services)

### TrendDayDto
Represents one day's aggregated actuals for trend charts.

```
TrendDayDto
  Date          string           "yyyy-MM-dd"
  Calories      decimal          Sum of all MealLog.Calories for this day
  Protein       decimal          Sum of all MealLog.Protein
  Carbs         decimal          Sum of all MealLog.Carbs
  Fat           decimal          Sum of all MealLog.Fat
  HasData       bool             True when at least one log entry exists for the day
```

### TrendResponseDto
Container returned by `GET /api/Progress/trends`.

```
TrendResponseDto
  Days          IReadOnlyList<TrendDayDto>    One entry per calendar day in range (including no-data days)
  Goals         GoalSnapshotDto?              Active goal targets (null when no goal set)
  RangeInDays   int                           The requested range (7, 30, or 90)
```

### DayStatusEntry
One calendar day entry in the heatmap and streak calculation.

```
DayStatusEntry
  Date          string           "yyyy-MM-dd"
  Status        string           "OnGoal" | "OverGoal" | "UnderGoal" | "NoData"
  TotalCalories decimal          Actual calories logged (0 when NoData)
```

Day status rules:
- `NoData` — no log entries for the day
- `OnGoal` — `TotalCalories >= (CaloriesTarget × 0.75)` AND `TotalCalories <= CaloriesTarget`
- `UnderGoal` — `TotalCalories < (CaloriesTarget × 0.75)` (meaningfully under-logged)
- `OverGoal` — `TotalCalories > CaloriesTarget`

### StreakResponseDto
Returned by `GET /api/Progress/streaks`.

```
StreakResponseDto
  CurrentStreak     int                          Consecutive on-goal days ending at most recent logged day
  GoalHitRate       decimal                      % of logged days (with data) in past 30 days that were OnGoal
  HeatmapDays       IReadOnlyList<DayStatusEntry> Past 30 calendar days including today (newest last)
  HasGoal           bool                         False when no active goal is set
```

### WeekDayEntry
One day row in the weekly summary.

```
WeekDayEntry
  Date              string           "yyyy-MM-dd"
  DayName           string           "Monday" .. "Sunday"
  TotalCalories     decimal          Actual logged calories (0 when no data)
  CaloriesTarget    int              Daily goal (0 when no goal set)
  HasData           bool             True when at least one log entry exists
  Status            string           "OnGoal" | "OverGoal" | "UnderGoal" | "NoData"
```

### WeeklySummaryResponseDto
Returned by `GET /api/Progress/weekly`.

```
WeeklySummaryResponseDto
  WeekStart         string                        "yyyy-MM-dd" (always a Monday)
  WeekEnd           string                        "yyyy-MM-dd" (always the following Sunday)
  Days              IReadOnlyList<WeekDayEntry>   7 entries, Mon → Sun
  WeeklyTotal       decimal                       Sum of calories across days with HasData = true
  WeeklyGoal        decimal                       CaloriesTarget × number of days with HasData (prorated)
  HasGoal           bool                          False when no active goal
```

---

## Frontend Data Shapes

The frontend consumes the DTOs above directly. The `/progress` page maintains local state for:

- `selectedRange: 7 | 30 | 90` — drives the trend chart query
- `weekOffset: number` — 0 = current week, -1 = previous week, etc. (drives `weekStart` parameter)
- `activeTab: 'daily' | 'trends' | 'streaks' | 'weekly'` — controls which section is visible

No new Zustand store is needed — all data is fetched via TanStack Query hooks with the above parameters as query keys.
