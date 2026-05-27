# Feature Specification: User Goal Setting & Nutrition Plan Calculator

**Feature Branch**: `008-smart-goal-setup`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Spec 008 where i set my goal and based on what? , i want the user to be asked/interviewed once he logged in to fill data about him and his target, based on this make an algorithm, make a research to know similar algorithms, to calculate full food plan for the user to reach the target from calories and protein intake and each macros, and also it's editable goal in future"

---

## Overview

When a user logs in for the first time (or has not yet completed their profile), they are guided through a one-time onboarding interview. The collected data — physical measurements, activity level, and body composition goal — feeds a scientifically grounded algorithm that calculates their daily calorie target and full macronutrient split (protein, carbohydrates, fat). The resulting nutrition plan is stored as the user's active goal and can be edited at any time.

**Algorithm Research Summary**:

The most widely validated approaches for calculating daily energy expenditure and macro targets are:

| Algorithm | Purpose | Notes |
|-----------|---------|-------|
| **Mifflin-St Jeor (1990)** | BMR (Basal Metabolic Rate) | Most accurate for general population; preferred by major dietitian bodies |
| **Harris-Benedict (Revised 1984)** | BMR | Classic; slightly overestimates for sedentary individuals |
| **Katch-McArdle** | BMR | Most accurate when body-fat % is known; requires lean body mass input |
| **Cunningham** | BMR | Research-oriented; also lean-mass-based |
| **TDEE Activity Multipliers** | Total Daily Energy Expenditure | Applied on top of BMR (sedentary → extra active) |

**Adopted algorithm**: Mifflin-St Jeor for BMR (no body-fat % required), with standard TDEE multipliers, aligned with how apps like MyFitnessPal, Cronometer, and MacroFactor operate.

**Mifflin-St Jeor formulas**:
- Male: `BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age_years) + 5`
- Female: `BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age_years) − 161`

**TDEE Activity Multipliers**:
| Level | Description | Multiplier |
|-------|-------------|-----------|
| Sedentary | Little or no exercise | 1.2 |
| Lightly Active | Light exercise 1–3 days/week | 1.375 |
| Moderately Active | Moderate exercise 3–5 days/week | 1.55 |
| Very Active | Hard exercise 6–7 days/week | 1.725 |
| Extra Active | Very hard exercise + physical job | 1.9 |

**Calorie adjustment by goal**:
| Goal | Adjustment |
|------|-----------|
| Lose weight (slow, ~0.25 kg/week) | −250 kcal/day |
| Lose weight (moderate, ~0.5 kg/week) | −500 kcal/day |
| Lose weight (aggressive, ~1 kg/week) | −750 kcal/day |
| Maintain weight | 0 kcal |
| Gain muscle (lean bulk, ~0.25 kg/week) | +250 kcal/day |
| Gain muscle (standard bulk, ~0.5 kg/week) | +500 kcal/day |

**Macro distribution**:
- **Protein**: 1.6–2.2 g/kg body weight (higher end for fat-loss and muscle-gain goals; ISSN recommendations)
- **Fat**: 25–35% of total calories (minimum 0.5 g/kg for hormonal health)
- **Carbohydrates**: Remaining calories after protein and fat are allocated

---

## User Scenarios & Testing

### User Story 1 — First-Time Onboarding Interview (Priority: P1)

A newly registered user logs in and has not yet completed their profile. Before accessing the main app, they are prompted to go through a short interview that collects their physical data and goal. At the end, their personalised nutrition plan is calculated and displayed for review.

**Why this priority**: Without this data, no meaningful nutrition guidance can be provided. This is the foundation for all downstream features.

**Independent Test**: A new user account can complete the interview, submit, and see a calculated daily calorie and macro target — fully testable without any other feature.

**Acceptance Scenarios**:

1. **Given** a logged-in user with no goal profile, **When** they access any main page, **Then** they are redirected to the onboarding interview before proceeding.
2. **Given** the onboarding interview is open, **When** the user fills in all required fields and submits, **Then** the system calculates and stores their nutrition targets and redirects them to the dashboard.
3. **Given** the user provides invalid data (e.g., age = 0, weight = negative), **When** they attempt to submit, **Then** the form shows specific validation messages without clearing valid inputs.
4. **Given** the user partially completes the interview and navigates away, **When** they return to the interview, **Then** their previously entered values are preserved.

---

### User Story 2 — View Calculated Nutrition Plan (Priority: P1)

After completing the interview, the user can see a clear summary of their personalised plan: daily calorie target, protein grams, carbohydrate grams, and fat grams — along with an explanation of why those numbers were chosen.

**Why this priority**: Users need to understand and trust their targets before using them daily.

**Independent Test**: After completing the interview, a user can navigate to a "My Goal" screen and read all four macro targets with brief explanations.

**Acceptance Scenarios**:

1. **Given** a user who has completed onboarding, **When** they open "My Goal", **Then** they see: daily kcal, protein (g), carbs (g), fat (g), their stated goal, and a brief rationale.
2. **Given** the plan is displayed, **When** the user views the breakdown, **Then** the macro percentages visually add up to 100% of the calorie target.

---

### User Story 3 — Edit Goal & Recalculate Plan (Priority: P2)

A user whose situation has changed (lost weight, changed activity level, switched goal from fat loss to maintenance) can edit any field in their profile and immediately see a newly calculated nutrition plan. The updated plan replaces the old one.

**Why this priority**: Goals change over time; the app must remain accurate without forcing re-registration.

**Independent Test**: An existing user with a completed goal can modify their weight and goal pace, save, and immediately see updated targets on the "My Goal" screen.

**Acceptance Scenarios**:

1. **Given** a user with an active nutrition plan, **When** they tap "Edit Goal" and change any field, **Then** the form is pre-populated with their current values.
2. **Given** edited values are submitted, **When** the user saves, **Then** the system recalculates the plan and the "My Goal" screen reflects the new targets.
3. **Given** the user edits their goal, **When** they cancel without saving, **Then** the previous plan remains unchanged.

---

### User Story 4 — Algorithm Transparency (Priority: P3)

A user can see which algorithm and inputs were used to compute their plan (e.g., "Based on Mifflin-St Jeor, your BMR is X kcal. With your activity level, your TDEE is Y kcal. For your goal of Z, your daily target is W kcal.").

**Why this priority**: Transparency builds trust and reduces support enquiries about "why are my numbers different from other apps."

**Independent Test**: On the "My Goal" screen there is an expandable section that shows the step-by-step calculation breakdown.

**Acceptance Scenarios**:

1. **Given** a user views their goal, **When** they expand the "How was this calculated?" section, **Then** they see BMR, TDEE, calorie adjustment, and the final target with labelled intermediate values.

---

### Edge Cases

- What happens when a user skips optional fields (e.g., body-fat %)?
- How does the system handle extreme inputs (age 10, age 100, weight 30 kg, weight 300 kg)?
- What if the calculated calorie target falls below safe minimums (1200 kcal for females, 1500 kcal for males)?
- What if the user changes their biological sex mid-profile?
- How are macro targets affected when a user has very low body weight and the protein formula yields targets above 250 g/day?

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST redirect first-time users (those without a saved goal profile) to the onboarding interview immediately after login.
- **FR-002**: The onboarding interview MUST collect: biological sex, age, height, current weight, activity level, primary goal, and goal pace.
- **FR-003**: System MUST calculate BMR using the Mifflin-St Jeor equation applied to the provided biological sex, age, height, and weight.
- **FR-004**: System MUST multiply BMR by the appropriate TDEE activity multiplier based on the user's stated activity level.
- **FR-005**: System MUST apply the correct calorie adjustment (deficit or surplus) based on the user's selected goal and pace.
- **FR-006**: System MUST enforce safe minimum calorie floors: 1200 kcal/day for females, 1500 kcal/day for males; if the calculation falls below this, the system clips to the minimum and warns the user.
- **FR-007**: System MUST calculate daily protein target using 1.6 g/kg body weight for maintenance, 2.0 g/kg for fat loss, and 2.2 g/kg for muscle gain goals.
- **FR-008**: System MUST allocate fat at 30% of total daily calories (minimum 0.5 g/kg body weight).
- **FR-009**: System MUST allocate remaining calories to carbohydrates after protein and fat are set.
- **FR-010**: System MUST store the full goal profile (inputs + calculated targets) linked to the user account.
- **FR-011**: System MUST display the calculated targets (kcal, protein g, carbs g, fat g) with a brief explanation on a "My Goal" screen accessible from the main navigation.
- **FR-012**: System MUST provide an "Edit Goal" flow that pre-populates the interview form with the user's current values.
- **FR-013**: System MUST recalculate and replace the nutrition plan when the user saves edits via the "Edit Goal" flow.
- **FR-014**: System MUST display an expandable calculation breakdown showing: BMR, TDEE, calorie adjustment, and final targets.
- **FR-015**: All input fields MUST be validated; out-of-range values (age < 15 or > 100, weight < 30 kg or > 350 kg, height < 100 cm or > 250 cm) MUST show user-friendly error messages.

### Key Entities

- **UserGoalProfile**: Stores the interview inputs (biological sex, age, height, weight, activity level, goal type, goal pace) and the system-calculated outputs (BMR, TDEE, daily calorie target, protein g, carbs g, fat g). Linked one-to-one with a User.
- **GoalType**: Enumerated goal categories — lose weight slow, lose weight moderate, lose weight aggressive, maintain, gain muscle lean, gain muscle standard.
- **ActivityLevel**: Enumerated activity descriptors — sedentary, lightly active, moderately active, very active, extra active.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A new user can complete the onboarding interview and reach a displayed nutrition plan in under 3 minutes.
- **SC-002**: 95% of users who start the onboarding interview complete it without abandoning (measured by completion rate).
- **SC-003**: Calculated calorie targets match manual Mifflin-St Jeor + TDEE computation to within ±1 kcal across all valid input combinations (verified by automated calculation tests).
- **SC-004**: Users can view, update, and re-save their goal in under 2 minutes on any subsequent visit.
- **SC-005**: No user's calculated daily calorie target falls below safe minimums (1200/1500 kcal) without a visible warning and clipping applied.
- **SC-006**: The "My Goal" screen loads and renders all targets in under 1 second under normal network conditions.

---

## Assumptions

- Users are adults aged 15–100; no paediatric formulas are in scope.
- Body-fat percentage input is out of scope for v1 (Katch-McArdle / Cunningham algorithms are excluded); Mifflin-St Jeor is sufficient.
- The onboarding interview is a one-time prompt; users can always edit via "Edit Goal" afterward — no repeat onboarding prompt after first completion.
- Dietary restrictions and food preferences (vegetarian, vegan, allergies) are out of scope for this feature; they belong to a future meal-planning feature.
- Weight and height are stored in metric units (kg and cm) internally; unit conversion (lbs/ft-in) for display is handled by the existing user preferences system or is a separate concern.
- One active goal profile per user at a time; historical goal snapshots are not required for v1.
- The existing user authentication system is already in place (no changes to login/registration in scope here).
