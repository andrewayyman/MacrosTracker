# Feature Specification: Daily Nutrition Log

**Feature Branch**: `006-spec-006`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Allow users to log meals and track daily macro/calorie intake against their goals."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search and Log a Food Entry (Priority: P1)

A user wants to record a meal item. They open the log interface, type a food name (e.g., "chicken breast"), see a list of matching results from the food database with nutritional data per serving, select the correct item, adjust the serving quantity, choose a meal type (Breakfast, Lunch, Dinner, Snack), and confirm the entry. The item immediately appears in their Diary.

**Why this priority**: Manual food search and logging is the primary way users record meals they cannot scan. Without it, users are entirely dependent on the AI scanner, which may fail or be unavailable for many common foods.

**Independent Test**: A user can type a food name, select a result, adjust the serving size, pick a meal type, and confirm — resulting in a new entry visible on the Diary page for today.

**Acceptance Scenarios**:

1. **Given** a user is on the log screen, **When** they type at least 2 characters into the search field, **Then** matching food items appear within 2 seconds showing name, serving size, calories, protein, carbs, and fat.
2. **Given** search results are displayed, **When** the user selects a food item, **Then** they see a detail screen with the full nutritional breakdown for the default serving size.
3. **Given** a user is on the food detail screen, **When** they change the serving quantity, **Then** all nutritional values (calories, protein, carbs, fat) update in real time to reflect the new quantity.
4. **Given** a user has set a quantity and meal type, **When** they confirm the log entry, **Then** the entry is saved to their diary for today under the selected meal type.
5. **Given** a user is not authenticated, **When** they attempt to access the log feature, **Then** they are redirected to the login page.

---

### User Story 2 — Preview Daily Impact Before Logging (Priority: P2)

While reviewing a food item before confirming the log entry, a user can see how the item will affect their daily macro totals. A summary widget shows current day totals and a projected total if this item is added, updating live as the serving quantity is adjusted.

**Why this priority**: Seeing the nutritional impact before confirming helps users make informed choices and stay within their goals. It closes the feedback loop between logging and daily goal tracking.

**Independent Test**: A user with saved nutrition goals can see their current daily progress and a live preview of how a selected food affects it, before confirming the log entry.

**Acceptance Scenarios**:

1. **Given** a user has nutrition goals set and has selected a food item, **When** they view the confirmation screen, **Then** a summary shows current day totals and projected totals if this item is added.
2. **Given** a user adjusts the serving quantity, **When** the quantity changes, **Then** the projected daily total preview updates in real time.
3. **Given** a user has no nutrition goals set, **When** they view the confirmation screen, **Then** current day totals are still displayed without goal comparison, and a prompt suggests setting goals.

---

### User Story 3 — Quick-Add a Recently Logged Food (Priority: P3)

A user who regularly eats the same foods can select from a list of their recently logged items rather than searching each time. The list shows up to 10 distinct food items from the past 30 days, ordered by most recently logged. Selecting a recent item pre-fills the detail screen so the user only needs to confirm or adjust the quantity.

**Why this priority**: Users who track consistently eat similar foods repeatedly. Reducing friction for common entries improves long-term adherence to nutrition tracking.

**Independent Test**: A user who has previously logged at least one food can open the log screen, select an item from the recent foods list, and complete the log entry with fewer steps than a fresh search.

**Acceptance Scenarios**:

1. **Given** a user has logged at least one food previously, **When** they open the log screen, **Then** a "Recent Foods" section appears with up to 10 items ordered by most recently logged.
2. **Given** a user selects a recent food item, **When** the detail screen opens, **Then** the serving quantity is pre-filled to match the quantity used in the most recent log of that item.
3. **Given** a user has never logged any food, **When** they open the log screen, **Then** no "Recent Foods" section is shown.

---

### Edge Cases

- What happens when a food search returns no results? Display a clear "no results" message and suggest trying different keywords or using the AI scanner (Spec 004).
- What if the network fails while saving a log entry? The entry is not silently discarded — an error message is shown with a retry option.
- What if a food item in the database has incomplete nutritional data? Show available fields and display zero or a dash for missing macros with no assumed values.
- What if the user attempts to confirm a log entry with a quantity of zero or negative? The confirm action is disabled until a positive quantity greater than zero is entered.
- What if food search returns too many results? Show the top 20 most relevant matches; the user can refine the search term to narrow results.
- What if the selected date changes while the user is mid-way through logging (midnight rollover)? The entry is saved to the calendar day the user confirmed on, not auto-adjusted.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text search input that queries the food database by name and returns matching results.
- **FR-002**: System MUST display each search result with at minimum: food name, default serving size, calories, protein, carbs, and fat per serving.
- **FR-003**: System MUST allow the user to adjust the serving quantity on the detail screen, with all nutritional values recalculated proportionally in real time.
- **FR-004**: System MUST allow the user to assign the log entry to one of four meal types: Breakfast, Lunch, Dinner, or Snack.
- **FR-005**: System MUST save the confirmed log entry to the user's diary for the current calendar day.
- **FR-006**: System MUST display the user's current day nutritional totals on the confirmation screen, with remaining budget shown if nutrition goals are set.
- **FR-007**: System MUST update the day total preview in real time as the user adjusts the serving quantity.
- **FR-008**: System MUST display a "Recent Foods" list of up to 10 distinct food items the user has logged in the last 30 days, ordered by most recent log date.
- **FR-009**: System MUST display an empty state when the food search returns no results.
- **FR-010**: System MUST prevent submission of a log entry when the quantity is zero or less — the confirm action is disabled.
- **FR-011**: System MUST require authentication — unauthenticated users are redirected to login.
- **FR-012**: System MUST show an error with a retry option if saving a log entry fails due to a network or server error.

### Key Entities

- **Food Item**: A record in the food database representing a consumable item. Contains name, default serving size (quantity and unit), and nutritional values per serving (calories, protein, carbs, fat). Populated via the AI scan pipeline (Spec 004) or a pre-seeded nutritional database.
- **Meal Log Entry**: A single recorded instance of a user consuming a food item. Contains a reference to the food item, the actual quantity consumed, the calculated nutritional values for that quantity, the assigned meal type, the user, and the date/time logged. Shared entity with Spec 004 and Spec 005.
- **Daily Summary**: An aggregate of all meal log entries for a specific calendar day for a given user — total calories, protein, carbs, fat. Derived at read time from existing entries. Shared with Spec 005.
- **Recent Foods**: A derived list of distinct food items the user has logged in the last 30 days, ordered by most recent log date, limited to 10 items. No stored entity — computed on request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full log entry — search, select, adjust quantity, choose meal type, and confirm — in under 60 seconds under normal network conditions.
- **SC-002**: Food search results appear within 2 seconds of the user entering a search term (minimum 2 characters).
- **SC-003**: Nutritional value previews and day total previews update in under 300 milliseconds when a user changes the serving quantity.
- **SC-004**: 100% of confirmed log entries appear correctly in the Diary page (Spec 005) under the correct meal type and date with accurate nutritional values.
- **SC-005**: The daily total preview on the confirmation screen is always arithmetically accurate — it reflects all entries already logged for the day plus the item being added at the current quantity.
- **SC-006**: The Recent Foods list contains no duplicate entries and is correctly ordered by most recent log date for any user with prior log history.

## Assumptions

- The food database is pre-seeded from an external nutritional data source or populated via the AI scan pipeline (Spec 004). Spec 006 does not include a food creation or editing UI for end users.
- Users log food for the current calendar day only. Backdating entries to a past day is out of scope for this version.
- Serving size units (grams, ml, pieces, etc.) are stored with the food item record. Users adjust quantity (how many of that unit), not the unit itself.
- The existing `MealLog` entity from Spec 004 is reused directly — no new log entity is introduced.
- The "Recent Foods" list spans all meal types — it is not filtered by the currently selected meal type.
- Editing an existing log entry is out of scope; users must delete and re-log to correct mistakes.
- The log feature is accessible only to authenticated users; guest or anonymous logging is not supported.
- The Diary page (Spec 005) is the canonical view of the day's entries — this feature adds entries to that diary without replacing it.
