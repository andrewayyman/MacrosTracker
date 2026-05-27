# API Contracts: User Goal Profile

**Feature**: 008-user-nutrition-goals | **Date**: 2026-05-27

All endpoints require `Authorization: Bearer <token>`. All responses use the standard envelope:
```json
{ "data": <T|null>, "message": "<string>", "errorList": ["<string>"] }
```

---

## GET /api/user-goal-profile

Returns the authenticated user's active goal profile.

**Response 200**:
```json
{
  "data": {
    "biologicalSex": "Male",
    "ageYears": 28,
    "weightKg": 80.0,
    "heightCm": 178.0,
    "activityLevel": "ModeratelyActive",
    "goalType": "LoseWeightModerate",
    "calculatedBmr": 1842.0,
    "calculatedTdee": 2855.1,
    "calorieAdjustment": -500,
    "dailyCaloriesTarget": 2355,
    "dailyProteinGrams": 160.0,
    "dailyCarbsGrams": 228.8,
    "dailyFatGrams": 78.5,
    "isCalorieMinimumApplied": false
  },
  "message": "Goal profile loaded successfully.",
  "errorList": []
}
```

**Response 404** — user has not yet completed the interview:
```json
{
  "data": null,
  "message": "No goal profile found.",
  "errorList": ["Goal profile not found."]
}
```

---

## POST /api/user-goal-profile

Save (create or replace) the user's goal profile and sync the DailyNutritionGoal.

**Request body**:
```json
{
  "biologicalSex": "Male",
  "ageYears": 28,
  "weightKg": 80.0,
  "heightCm": 178.0,
  "activityLevel": "ModeratelyActive",
  "goalType": "LoseWeightModerate"
}
```

**Validation rules**:
- `biologicalSex`: required, "Male" or "Female"
- `ageYears`: 15–100
- `weightKg`: 30.0–350.0
- `heightCm`: 100.0–250.0
- `activityLevel`: required, valid enum string
- `goalType`: required, valid enum string

**Response 200**:
```json
{
  "data": {
    /* same shape as GET response above */
    "isCalorieMinimumApplied": false
  },
  "message": "Goal profile saved successfully.",
  "errorList": []
}
```

**Response 200 with floor applied** (message differs):
```json
{
  "data": {
    "dailyCaloriesTarget": 1500,
    "isCalorieMinimumApplied": true
  },
  "message": "Goal profile saved. Your calorie target has been raised to the safe minimum of 1500 kcal/day.",
  "errorList": []
}
```

**Response 400** — validation failure:
```json
{
  "data": null,
  "message": "Validation failed.",
  "errorList": ["Age must be between 15 and 100.", "Weight must be between 30 and 350 kg."]
}
```

---

## POST /api/user-goal-profile/preview

Calculate the nutrition plan from given inputs without saving. Used for live frontend preview.

**Request body**: Same shape as `POST /api/user-goal-profile`

**Response 200**:
```json
{
  "data": {
    "calculatedBmr": 1842.0,
    "calculatedTdee": 2855.1,
    "calorieAdjustment": -500,
    "dailyCaloriesTarget": 2355,
    "dailyProteinGrams": 160.0,
    "dailyCarbsGrams": 228.8,
    "dailyFatGrams": 78.5,
    "isCalorieMinimumApplied": false
  },
  "message": "Calculation preview ready.",
  "errorList": []
}
```

---

## Enum String Values (accepted in requests; returned in responses)

### activityLevel
`"Sedentary"` | `"LightlyActive"` | `"ModeratelyActive"` | `"VeryActive"` | `"ExtraActive"`

### goalType
`"LoseWeightSlow"` | `"LoseWeightModerate"` | `"LoseWeightAggressive"` | `"Maintain"` | `"GainMuscleLean"` | `"GainMuscleStandard"`

---

## Frontend API Client Functions

**File**: `MacrosTrackerWeb/src/api/userGoalProfileClient.js`

```js
getGoalProfile()                       → GET  /api/user-goal-profile
saveGoalProfile(payload)               → POST /api/user-goal-profile
previewGoalCalculation(payload)        → POST /api/user-goal-profile/preview
```
