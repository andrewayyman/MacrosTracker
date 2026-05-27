# Data Model: User Goal Setting & Nutrition Plan Calculator

**Feature**: 008-user-nutrition-goals | **Date**: 2026-05-27

---

## New Entities

### UserGoalProfile

**Location**: `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/UserGoalProfile.cs`

**Table**: `UserGoalProfiles`

**Relationship**: One-to-one with `Users` (unique constraint on `UserId`). Single record per user — upserted on save, never soft-deleted.

| Column | CLR Type | Nullable | Notes |
|--------|----------|---------|-------|
| Id | Guid | No | PK |
| UserId | Guid | No | FK → Users.Id, unique |
| BiologicalSex | string | No | "Male" or "Female" — snapshot at time of calculation |
| AgeYears | int | No | Snapshot of User.Age at save time |
| WeightKg | double | No | Snapshot of User.WeightKg at save time |
| HeightCm | double | No | Snapshot of User.HeightCm at save time |
| ActivityLevel | int (enum) | No | ActivityLevel enum value |
| GoalType | int (enum) | No | GoalType enum value |
| CalculatedBmr | double | No | Intermediate: BMR before TDEE |
| CalculatedTdee | double | No | Intermediate: BMR × activity multiplier |
| CalorieAdjustment | int | No | Signed delta applied to TDEE (negative = deficit) |
| DailyCaloriesTarget | int | No | Final calorie target (post-floor-clip) |
| DailyProteinGrams | double | No | Computed protein target |
| DailyCarbsGrams | double | No | Computed carbs target |
| DailyFatGrams | double | No | Computed fat target |
| IsCalorieMinimumApplied | bool | No | True if safe floor overrode the calculation |
| CreatedAt | DateTimeOffset | No | From AuditableEntity |
| UpdatedAt | DateTimeOffset | No | From AuditableEntity |

**Validation rules**:
- BiologicalSex must be "Male" or "Female"
- AgeYears: 15–100
- WeightKg: 30.0–350.0
- HeightCm: 100.0–250.0
- ActivityLevel: valid enum value
- GoalType: valid enum value

---

## New Enums

### ActivityLevel

**Location**: `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/ActivityLevel.cs`

| Value | Int | TDEE Multiplier | Description |
|-------|-----|-----------------|-------------|
| Sedentary | 1 | 1.20 | Desk job, no structured exercise |
| LightlyActive | 2 | 1.375 | Light exercise 1–3 days/week |
| ModeratelyActive | 3 | 1.55 | Moderate exercise 3–5 days/week |
| VeryActive | 4 | 1.725 | Hard exercise 6–7 days/week |
| ExtraActive | 5 | 1.90 | Very hard exercise + physical job |

---

### GoalType

**Location**: `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/GoalType.cs`

| Value | Int | Calorie Δ | Protein Multiplier | Weekly Change |
|-------|-----|-----------|--------------------|---------------|
| LoseWeightSlow | 1 | −250 kcal | 2.0 g/kg | ~−0.25 kg |
| LoseWeightModerate | 2 | −500 kcal | 2.0 g/kg | ~−0.50 kg |
| LoseWeightAggressive | 3 | −750 kcal | 2.0 g/kg | ~−0.75 kg |
| Maintain | 4 | 0 kcal | 1.6 g/kg | 0 kg |
| GainMuscleLean | 5 | +250 kcal | 2.2 g/kg | ~+0.25 kg |
| GainMuscleStandard | 6 | +500 kcal | 2.2 g/kg | ~+0.50 kg |

---

## Modified Entities

### User (no schema changes)

No columns added. The interview pre-populates from `User.WeightKg`, `User.HeightCm`, `User.Age`, `User.Gender`. If the user enters different values during the interview, those are stored only in `UserGoalProfile` as a snapshot; `User` is not updated by the goal-save flow.

### DailyNutritionGoal (no schema changes)

When `UserGoalProfileService.SaveGoalProfileAsync` is called:
1. All existing `DailyNutritionGoal` rows for the user with `IsActive = true` are set to `false`.
2. A new `DailyNutritionGoal` row is inserted with `CaloriesTarget`, `ProteinGramsTarget`, `CarbohydratesGramsTarget`, `FatGramsTarget` from the calculated profile, and `GoalSource = GoalSource.Suggested`.
3. `User.SetupStatus` is updated to `ProfileCompleted` if currently `ProfilePending`.

---

## EF Core Configuration Notes

`UserGoalProfileConfiguration.cs`:
- `HasKey(p => p.Id)`
- `HasIndex(p => p.UserId).IsUnique()`
- `HasOne<User>().WithOne().HasForeignKey<UserGoalProfile>(p => p.UserId).OnDelete(DeleteBehavior.Cascade)`
- ActivityLevel and GoalType stored as int (enum)
- No soft-delete filter needed (single record, no IsActive/IsDeleted flag)

Migration name: `AddUserGoalProfile`
