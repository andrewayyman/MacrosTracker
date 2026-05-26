# Feature Specification: Profile and Nutrition Goals

**Feature Branch**: `[003-profile-and-nutrition-goals]`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Spec 003"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Personal Setup After First Login (Priority: P1)

As a newly registered user, I want to complete my personal profile and body metrics so the app can prepare my account for meaningful nutrition tracking.

**Why this priority**: The product cannot compare intake against meaningful daily targets or personalize the experience unless the user has completed the basic setup expected right after account creation.

**Independent Test**: Can be fully tested by signing in as a newly registered user, entering the required profile and body-metric details, and confirming the account is marked as ready for nutrition tracking.

**Acceptance Scenarios**:

1. **Given** a signed-in user has not completed setup, **When** they open the app after registration, **Then** the app prompts them to finish their profile before treating the account as fully configured.
2. **Given** a signed-in user submits complete and valid body-metric details, **When** they save the form, **Then** the system stores the information and marks profile setup as complete.
3. **Given** a signed-in user submits missing or invalid values, **When** they try to save, **Then** the system blocks completion and shows clear correction guidance.

---

### User Story 2 - Define Daily Macro Targets (Priority: P2)

As a user who has completed my profile, I want to set my daily calorie and macro goals so I can compare future meal logs against a target.

**Why this priority**: Meal tracking has little value unless users can see whether their intake is aligned with a daily target they understand and control.

**Independent Test**: Can be fully tested by completing profile setup, choosing either suggested defaults or custom targets, and confirming the account now has an active daily nutrition goal set.

**Acceptance Scenarios**:

1. **Given** a signed-in user has completed their profile but has no goal yet, **When** they continue through onboarding, **Then** the app prompts them to set daily calorie, protein, carb, and fat targets before tracking progress.
2. **Given** a signed-in user accepts the provided starting targets, **When** they save, **Then** the system stores those values as their active daily goal.
3. **Given** a signed-in user prefers their own macro targets, **When** they enter valid custom values and save, **Then** the system stores the custom goal and uses it as the current target.

---

### User Story 3 - Review And Update Setup Later (Priority: P3)

As a returning user, I want to review and update my profile details and macro goals later so the app can stay aligned with my current body metrics and nutrition plan.

**Why this priority**: Fitness goals and body measurements change over time, so users need control to keep their tracking baseline current without creating a new account.

**Independent Test**: Can be fully tested by signing in as an existing user with saved profile and goals, editing one or more values, and confirming the new values replace the previous active setup.

**Acceptance Scenarios**:

1. **Given** a signed-in user already has saved profile data and goals, **When** they revisit the setup area, **Then** the app shows their current values for review and editing.
2. **Given** a signed-in user changes one or more body-metric details, **When** they save, **Then** the system updates the stored profile without forcing account recreation.
3. **Given** a signed-in user updates their daily macro targets, **When** they confirm the change, **Then** the system uses the new targets for future progress comparisons.

### Edge Cases

- What happens when a newly registered user leaves setup before finishing? The system should preserve the account as incomplete and prompt them to resume setup on the next authenticated visit.
- What happens when a user enters unrealistic or out-of-range body-metric or goal values? The system should reject the submission with specific field-level guidance rather than saving unreliable data.
- What happens when a user saves profile details but postpones goal setup? The system should preserve the completed profile while continuing to flag the account as not fully ready for progress tracking.
- What happens when an existing user wants to update only goals or only body metrics? The system should allow independent updates without requiring the whole onboarding flow to be repeated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow an authenticated user to view and update their personal profile details needed for nutrition tracking.
- **FR-002**: The system MUST allow an authenticated user to record body-metric information required for profile setup, including weight, height, age, and gender.
- **FR-003**: The system MUST validate profile and body-metric submissions and reject incomplete or invalid values with actionable error messages.
- **FR-004**: The system MUST track whether a signed-in user has completed profile setup, goal setup, both, or neither.
- **FR-005**: The system MUST prompt a newly authenticated user with incomplete setup to continue onboarding before the app treats the account as fully ready for nutrition tracking.
- **FR-006**: The system MUST allow a user to set daily calorie, protein, carbohydrate, and fat targets.
- **FR-007**: The system MUST provide a default or suggested path for creating an initial daily goal so users are not forced to invent targets from scratch.
- **FR-008**: The system MUST allow a user to replace suggested targets with custom values before saving their daily goal.
- **FR-009**: The system MUST persist the user's active daily nutrition goal for use by later tracking and dashboard features.
- **FR-010**: The system MUST allow a returning user to retrieve their current profile details, body metrics, and active nutrition goals for review.
- **FR-011**: The system MUST allow a returning user to update profile details and nutrition goals independently after onboarding is complete.
- **FR-012**: The system MUST keep previous saved data unchanged if a profile or goal update fails validation.
- **FR-013**: The system MUST return profile and goal results in the standard service response format with `Data`, `Message`, and `ErrorList`.
- **FR-014**: The system MUST keep authentication requirements in place so only the signed-in user can view or change their own setup data.

### Key Entities *(include if feature involves data)*

- **User Profile**: The signed-in user's personal setup record containing identification details relevant to the app experience and nutrition tracking.
- **Body Metrics**: The user's physical measurements and attributes, such as weight, height, age, and gender, used to support goal setup and future progress features.
- **Nutrition Goal**: The user's active daily targets for calories, protein, carbohydrates, and fat.
- **Setup State**: The current completion status showing whether profile details and nutrition goals have each been completed for the account.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A newly registered user can complete profile setup and save initial daily goals in under 4 minutes.
- **SC-002**: At least 90% of users who begin setup can successfully save valid profile details on their first attempt without needing support.
- **SC-003**: 100% of authenticated users with incomplete setup are correctly identified and prompted to finish onboarding before the app treats their account as fully configured.
- **SC-004**: A returning user can review and update their saved profile or daily goals in under 2 minutes.

## Assumptions

- The account registration flow from Spec 002 already captures basic identity and authenticated access, so this feature focuses on profile completion and nutrition-goal setup.
- This feature covers storing and maintaining body metrics and goals, not advanced coaching advice or premium recommendation logic.
- The app may provide starter target values during onboarding, but users remain in control of the final saved daily macro goals.
- Later dashboard, meal logging, and history features will consume the saved setup state and daily goals created here.
