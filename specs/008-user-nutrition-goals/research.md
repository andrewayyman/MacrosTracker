# Research: User Goal Setting & Nutrition Plan Calculator

**Feature**: 008-user-nutrition-goals | **Date**: 2026-05-27

---

## Decision 1: BMR Algorithm

**Decision**: Mifflin-St Jeor (1990)

**Rationale**: Most accurate for the general population without requiring body-fat percentage; adopted by the Academy of Nutrition and Dietetics and used by MyFitnessPal, Cronometer, and MacroFactor. Outperforms the classic Harris-Benedict (which overestimates for sedentary individuals by ~5%) and is simpler to implement than Katch-McArdle (requires body-fat %, which is not collected in our profile).

**Alternatives considered**:
- Harris-Benedict (Revised 1984): Overestimates for sedentary users; less accurate for modern populations.
- Katch-McArdle / Cunningham: More precise when body-fat % is known, but body-fat % measurement is unreliable for self-report and is excluded from scope (v2).

**Formulas**:
- Male: `BMR = 10 × weight_kg + 6.25 × height_cm − 5 × age + 5`
- Female: `BMR = 10 × weight_kg + 6.25 × height_cm − 5 × age − 161`

---

## Decision 2: TDEE Activity Multipliers

**Decision**: Standard Mifflin × activity factor model

**Rationale**: The five-level activity multiplier table (1.2–1.9) is the industry standard and maps well to plain-language descriptions users can self-select. No wearable device integration required.

| Level | Multiplier |
|-------|-----------|
| Sedentary | 1.2 |
| Lightly Active | 1.375 |
| Moderately Active | 1.55 |
| Very Active | 1.725 |
| Extra Active | 1.9 |

**Alternatives considered**: VO₂max-based calculations (too complex, requires lab testing); doubly-labelled water studies (not feasible for self-report apps).

---

## Decision 3: Calorie Adjustment by Goal

**Decision**: Fixed kcal adjustments per goal type

**Rationale**: The widely cited rule that 7,700 kcal ≈ 1 kg of body tissue yields the following daily adjustments:
- −250 kcal/day ≈ −0.25 kg/week (sustainable, beginner-friendly)
- −500 kcal/day ≈ −0.5 kg/week (standard fat loss; most evidence-based)
- −750 kcal/day ≈ −0.75 kg/week (aggressive; still above 1200/1500 kcal floor for most users)
- +250 kcal/day ≈ +0.25 kg/week lean bulk (minimal fat gain)
- +500 kcal/day ≈ +0.5 kg/week standard bulk

**Alternatives considered**: Dynamic adjustments based on weekly weight check-ins (deferred to v3 — requires persistent weight logging integration).

---

## Decision 4: Protein Target

**Decision**: ISSN (International Society of Sports Nutrition) position stand values

**Rationale**: The ISSN 2017 position stand on protein and exercise is the most cited evidence base for daily protein recommendations:
- Maintenance: 1.6 g/kg (minimum to preserve lean mass)
- Fat loss: 2.0 g/kg (higher protein preserves muscle during deficit)
- Muscle gain: 2.2 g/kg (supports hypertrophy)

**Alternatives considered**: RDA of 0.8 g/kg (too low for active individuals); 1 g/lb (≈2.2 g/kg for all goals, overly aggressive for maintenance).

---

## Decision 5: Fat Target

**Decision**: 30% of total calories, minimum 0.5 g/kg

**Rationale**: The American Heart Association and WHO both recommend fat at 25–35% of calories. 30% is the midpoint and ensures adequate fat for hormonal function. The 0.5 g/kg floor prevents excessively low fat for very-low-calorie cases (important for users with the minimum-floor applied).

---

## Decision 6: GoalType Enum Design

**Decision**: Single six-value enum combining direction + pace (no separate GoalPace entity)

**Rationale**: Pace is meaningless for the Maintain goal, making a separate GoalPace nullable in many rows. A six-value enum removes that nullability, simplifies the service logic (one switch, no conditional pair-checks), and maps directly to the 6-row UI selector.

Values: `LoseWeightSlow`, `LoseWeightModerate`, `LoseWeightAggressive`, `Maintain`, `GainMuscleLean`, `GainMuscleStandard`

---

## Decision 7: Frontend — Single-Page Interview vs Multi-Step Wizard

**Decision**: Single-page interview with live calculated preview

**Rationale**: The interview collects 7 fields (sex, age, height, weight, activity level, goal). A single form with a live-updating calculated summary below is faster to build, reduces navigation complexity, and is used by major apps (MyFitnessPal goal setup). A wizard adds state management overhead without a clear UX benefit for 7 fields.

The existing `GoalSetup.jsx` is enhanced in-place; no new route needed for onboarding.

---

## Decision 8: Backward Compatibility with DailyNutritionGoal

**Decision**: Sync DailyNutritionGoal from UserGoalProfile on save; do not replace

**Rationale**: `DiaryService`, `ProgressService`, dashboard, and meal logging all read `DailyNutritionGoal`. Removing it would require touching 4+ services and their tests. Syncing (deactivate old, insert new) reuses the existing pattern already in `NutritionGoalService.UpsertDailyGoalAsync`. Zero changes needed in unrelated services.
