# Feature Specification: Meal Diary & History View

**Feature Branch**: `005-meal-diary`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "A page showing the user's logged meals by day, with daily macro totals and history browsing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Today's Diary (Priority: P1)

A user who has logged one or more meals today opens the Diary page and immediately sees all their entries for the current day, grouped by meal type (Breakfast, Lunch, Dinner, Snack). Each entry shows the food name, calorie count, and macro breakdown. At the top of the page, a daily summary shows total calories consumed and total grams of protein, carbs, and fat, compared against the user's nutrition goals.

**Why this priority**: This is the core value of the diary — it gives users visibility into their daily eating pattern and progress toward goals. Without this, the scan/log flow from Spec 004 has no feedback loop.

**Independent Test**: A user who has already logged two or more meals can open the Diary page and see each logged meal under its correct meal type heading, with a daily summary showing the cumulative totals.

**Acceptance Scenarios**:

1. **Given** a user has logged meals today, **When** they open the Diary page, **Then** they see each meal listed under its meal type (Breakfast / Lunch / Dinner / Snack) with food name, calories, and macros displayed per entry.
2. **Given** a user has logged meals today, **When** they view the daily summary, **Then** they see total calories, protein, carbs, and fat for the day alongside their goals, with a visual indicator of progress.
3. **Given** a user has logged no meals today, **When** they open the Diary page, **Then** they see an empty state message encouraging them to log their first meal.
4. **Given** a user is not authenticated, **When** they try to access the Diary page, **Then** they are redirected to the login page.

---

### User Story 2 — Browse a Different Day (Priority: P2)

A user can navigate backwards and forwards through their diary history one day at a time using previous and next day controls. The page heading updates to show the selected date, and the diary entries and daily summary reflect that day's data. Forward navigation is blocked at today so users cannot browse future dates.

**Why this priority**: Users frequently want to review what they ate yesterday or earlier in the week. Without navigation, the diary is only useful for the current day.

**Independent Test**: A user can tap the "previous day" control and see yesterday's diary entries (or an empty state if none) with the date header updated accordingly. The "next day" control is disabled or hidden when viewing today.

**Acceptance Scenarios**:

1. **Given** the user is viewing today's diary, **When** they tap the previous day control, **Then** the page shows the previous calendar day's entries and summary, with the date updated.
2. **Given** the user is viewing a past day, **When** they tap the next day control, **Then** the page advances one calendar day toward today.
3. **Given** the user is viewing today's diary, **When** they look at the next day control, **Then** it is visually disabled and non-interactive.
4. **Given** a user navigates to a past day with no logged meals, **When** the page loads, **Then** an empty state message is shown for that date.

---

### User Story 3 — Delete a Meal Log Entry (Priority: P3)

A user who logged a meal in error or wants to correct their diary can delete an individual meal log entry. After confirming the deletion, the entry is removed from the diary and the daily summary totals update immediately to reflect the change.

**Why this priority**: Mistakes happen during logging. Without the ability to remove an entry, users are stuck with incorrect diary data which undermines trust in the totals.

**Independent Test**: A user can select a meal log entry, confirm deletion, and see it disappear from the diary list with the daily calorie and macro totals decreasing accordingly.

**Acceptance Scenarios**:

1. **Given** a diary entry is visible, **When** the user initiates deletion, **Then** a confirmation prompt is shown before any data is removed.
2. **Given** the user confirms deletion, **When** the server processes the request, **Then** the entry disappears from the list and daily totals update without a full page reload.
3. **Given** the user cancels the deletion prompt, **When** the prompt closes, **Then** no data is removed and the diary remains unchanged.
4. **Given** only one entry exists for the day and the user deletes it, **When** the deletion succeeds, **Then** the page shows the empty state message and totals reset to zero.

---

### Edge Cases

- What happens when a user's daily goal is not set? Display raw totals without a goal comparison; prompt the user to set goals.
- What happens if a logged meal has no macro data (e.g., partial entry)? Show the available fields and display zero or a dash for missing values.
- What if a network request to load diary entries fails? Show a clear error message with a retry option; do not show stale data silently.
- What happens when today's date changes while the user has the Diary page open? The page continues to show the day it was loaded for; the user can navigate to the new "today" using the next-day control (if applicable).
- What if the user has hundreds of entries for a single day? Entries scroll within their meal-type group; no pagination required for v1 given expected volume.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all meal log entries for the selected date, grouped under their respective meal type headings (Breakfast, Lunch, Dinner, Snack).
- **FR-002**: System MUST display a daily summary showing total calories, protein, carbs, and fat consumed for the selected date.
- **FR-003**: System MUST compare daily totals against the user's saved nutrition goals and display the remaining or exceeded amount for each macro.
- **FR-004**: Users MUST be able to navigate to the previous calendar day to view that day's diary entries and summary.
- **FR-005**: Users MUST be able to navigate to the next calendar day when viewing a past date, up to and including today.
- **FR-006**: System MUST prevent navigation beyond today — future dates are not accessible.
- **FR-007**: Users MUST be able to delete an individual meal log entry after confirming their intent via a confirmation prompt.
- **FR-008**: Daily summary totals MUST update immediately after a deletion without requiring a full page reload.
- **FR-009**: System MUST display an empty state message when no meals have been logged for the selected date.
- **FR-010**: System MUST require authentication — unauthenticated users are redirected to login.
- **FR-011**: If no nutrition goals are saved for the user, the daily summary MUST display raw totals without a goal comparison, and include a prompt to set goals.

### Key Entities *(include if feature involves data)*

- **Meal Log Entry**: A single food item logged by a user for a specific date and meal type. Contains food name, calorie count, macro breakdown (protein, carbs, fat), optional serving size, optional link to the original scan or local food item, and the date and time it was logged.
- **Daily Summary**: An aggregate view of all meal log entries for a specific date, showing cumulative totals for calories and each macro, derived at read time from the individual entries.
- **Nutrition Goal**: The user's saved daily targets for calories, protein, carbs, and fat — used to calculate progress and remaining amounts in the daily summary.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the Diary page and see the current day's logged meals within 2 seconds under normal network conditions.
- **SC-002**: Users can navigate between diary days — previous and next — without perceivable delay (under 1 second per navigation).
- **SC-003**: Deleting a meal log entry takes effect and the daily totals update within 1 second of confirmation.
- **SC-004**: 100% of logged meal entries for the selected date are shown — no entries are silently omitted or reordered incorrectly.
- **SC-005**: The daily summary accurately reflects the sum of all visible entries at all times, including immediately after a deletion.
- **SC-006**: The empty state is displayed correctly for any day with zero logged meals, including newly registered users viewing their first diary day.

## Assumptions

- Users have already logged meals via the Scan page (Spec 004). The diary consumes existing `MealLog` data; it does not create new entries.
- Each user has at most one set of daily nutrition goals (from Spec 003). Goal comparison uses these saved values unchanged.
- The diary is date-based (calendar day), not 24-hour rolling window — entries belong to the calendar day they were logged.
- Editing a meal log entry (changing quantities, food name, or meal type) is out of scope for this version. Users who need to correct an entry must delete and re-log it.
- A calendar date picker is out of scope for v1 — navigation is day-by-day only (previous / next controls).
- Sorting of entries within a meal type group is by log time (chronological), oldest first.
- The diary page is accessible only to authenticated users; no public or shared diary URLs are needed.
- Soft-deleted meal log entries (from Spec 004's soft-delete flag) are automatically excluded by the existing global query filter and do not appear in the diary.
