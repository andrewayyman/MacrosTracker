# Feature Specification: AI Food Scan

**Feature Branch**: `004-food-scan`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "AI-powered photo food scanning with macro analysis — spec 4 of the GymScan product"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan a Meal and Get Its Macros (Priority: P1)

As a gym-goer, I want to take a photo of my meal and instantly receive a calorie and macro breakdown so I can log my food without manually searching or guessing.

**Why this priority**: This is the core differentiator of the entire product. Without a working scan flow, the app has no reason to exist. Every other feature depends on users being able to get macro data from a photo.

**Independent Test**: Can be fully tested by uploading a food photo through the scan interface and confirming a result card is returned containing a food name, calorie count, and macro values (protein, carbs, fat) before any logging step is performed.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the Scan page, **When** they upload a clear food photo and tap Analyze, **Then** the system returns a result card showing a food name, calorie estimate, protein, carbs, and fat values within 5 seconds.
2. **Given** a scan result card is displayed, **When** the result came from the verified local food database, **Then** the result card shows a "Verified local data" badge alongside the macro values.
3. **Given** a scan result card is displayed, **When** the result came from the AI model, **Then** the result card shows an "AI estimate" badge with a confidence percentage.
4. **Given** a user uploads a blurry photo or an image that is not food, **When** the analysis completes, **Then** the system shows a low-confidence result with a note explaining the image could not be clearly identified, and offers the manual food search as an alternative.
5. **Given** the AI analysis service is unavailable, **When** a user attempts a scan, **Then** the system shows a clear error message and offers a direct link to the manual food search fallback.

---

### User Story 2 - Log a Scanned Meal to the Diary (Priority: P2)

As a gym-goer, I want to confirm a scan result and log it to my daily diary so my dashboard reflects what I have eaten.

**Why this priority**: Scanning without logging produces no lasting value. The diary entry is what feeds the dashboard totals and history — both features depend on this step.

**Independent Test**: Can be fully tested by completing a scan, selecting a meal type, confirming the log, and then verifying the meal appears in the daily diary with the correct macro values.

**Acceptance Scenarios**:

1. **Given** a scan result card is shown, **When** the user taps "Log this meal" and selects a meal type (Breakfast, Lunch, Dinner, or Snack), **Then** the meal is saved to their diary for today and a confirmation toast is shown.
2. **Given** a meal has been logged, **When** the user navigates to the dashboard, **Then** the dashboard totals for calories, protein, carbs, and fat are updated to reflect the newly logged meal.
3. **Given** a meal has been logged, **When** the user navigates to History for today, **Then** the logged meal appears in today's diary with its name, meal type, and macro values.
4. **Given** a user decides the scan result is incorrect, **When** they dismiss the result without logging, **Then** no diary entry is created and the user can start a new scan.

---

### User Story 3 - Search for Food Manually as a Fallback (Priority: P3)

As a user, I want to search the local food database by name so I can log a meal when a photo scan is not practical or when the scan result is inaccurate.

**Why this priority**: The scan-first UX must degrade gracefully. Users eating in poor lighting, logging a meal after the fact, or correcting a bad AI result need a manual path that still uses verified macro data.

**Independent Test**: Can be fully tested by searching for an Egyptian food item by name, selecting a result, and logging it to the diary — without performing any photo scan.

**Acceptance Scenarios**:

1. **Given** a user is on the Scan page, **When** they choose to search manually and type a food name, **Then** matching entries from the local food database are returned with their calorie and macro values per serving.
2. **Given** search results are shown, **When** the user selects an item and confirms the log with a meal type, **Then** the meal is saved to their diary exactly as it would be after a scan.
3. **Given** a user searches for a food that is not in the local database, **When** no results are found, **Then** the system shows a clear empty-state message and suggests scanning a photo instead.

---

### Edge Cases

- What happens when the uploaded file exceeds 10 MB? The system must validate and reject the file immediately before any upload attempt, showing a specific size error.
- What happens when the uploaded file is not an image (wrong MIME type or magic bytes)? The system must reject it at the boundary with a specific file type error.
- What happens when the user has multiple foods on a single plate? The AI estimates the whole visible plate as one serving and notes this in the result.
- What happens when a user scans a beverage? Beverages are valid inputs and the system handles them the same as food.
- What happens if the scan returns a result but the user navigates away before logging? No diary entry is created; the scan session is discarded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a logged-in user to upload an image file from their device for food analysis.
- **FR-002**: The system MUST validate uploaded images for file size (maximum 10 MB) and file type (image MIME types, verified by magic bytes) before processing.
- **FR-003**: The system MUST send the uploaded image to the AI vision service for food identification and macro estimation.
- **FR-004**: The system MUST check the local food database for a verified match before presenting AI results, and prefer verified data when a match exists.
- **FR-005**: The system MUST return a scan result containing: identified food name, calorie estimate, protein (g), carbohydrates (g), fat (g), estimated serving size, result source ("Verified local data" or "AI estimate"), and confidence indicator.
- **FR-006**: The system MUST complete an end-to-end scan and return a result within 5 seconds under normal conditions.
- **FR-007**: The system MUST allow the user to log a scan result to their diary by selecting a meal type (Breakfast, Lunch, Dinner, Snack) and confirming.
- **FR-008**: The system MUST persist logged meals in the user's daily diary with the meal date, meal type, food name, and macro values.
- **FR-009**: The system MUST update daily macro totals on the dashboard after a meal is logged.
- **FR-010**: The system MUST allow users to discard a scan result without logging.
- **FR-011**: The system MUST provide a manual food search that queries the local food database by food name.
- **FR-012**: The system MUST display manual search results with food name, calories, protein, carbs, fat, and serving size.
- **FR-013**: The system MUST allow a user to log a food item selected from manual search results, following the same meal-type confirmation flow as a scan result.
- **FR-014**: The system MUST show a fallback message with a link to manual food search when the AI service is unavailable.
- **FR-015**: The system MUST show a low-confidence result with an explanatory note when the AI returns a confidence score below 40%, and MUST offer the manual food search as an alternative path.
- **FR-016**: The system MUST store the scan image server-side alongside the scan result record.
- **FR-017**: The system MUST apply the `IFoodVisionService` abstraction for all AI calls so the underlying AI provider can be swapped without changing any other layer.

### Key Entities *(include if feature involves data)*

- **FoodScan**: Records a single scan event. Contains the image reference, AI-returned food name, macro values, confidence score, result source, and the scanning user. Linked to a MealLog when confirmed.
- **MealLog**: Records a confirmed diary entry. Contains the user, diary date, meal type, food name, calorie and macro values, and optionally a reference to the originating FoodScan.
- **LocalFoodItem**: An entry in the verified local food database. Contains food name, alternate names/spellings, calorie and macro values per 100g, and typical serving size for Egyptian portions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the full flow from photo upload to a confirmed diary entry in under 30 seconds on a standard mobile connection.
- **SC-002**: The scan result is returned within 5 seconds for 90% of requests under normal AI service availability.
- **SC-003**: 100% of file upload requests with invalid size or type are rejected before reaching the AI service, with a specific error message shown to the user.
- **SC-004**: A logged meal appears on the dashboard with updated totals immediately after confirmation, without a page refresh.
- **SC-005**: Users who encounter an AI service failure are always presented with the manual search fallback rather than a blank or crashed screen.
- **SC-006**: The manual food search returns results for any of the 50+ seeded Egyptian food items within 1 second.

## Assumptions

- The AI vision provider is Google Gemini. The integration is abstracted behind `IFoodVisionService` so this assumption does not leak into business logic.
- The Google Gemini API key is available as an environment variable and configured via `appsettings` — the client will supply this before the feature can be end-to-end tested.
- The local food database is seeded with a minimum of 50 verified Egyptian food items as part of this spec's scope. Ongoing growth of the database is a separate concern.
- Scan images are stored server-side in an `/uploads` folder. A future `storeImage: false` option is out of scope for this spec.
- Meal types are a fixed enum: Breakfast, Lunch, Dinner, Snack. No custom meal types are supported in v1.
- The diary date for a logged meal defaults to today's date. Back-dating is out of scope for v1.
- The user must be authenticated to scan or log a meal. Unauthenticated access to the scan feature is not supported.
- Confidence percentage is returned by the AI provider and surfaced as-is. No calibration or normalization is in scope for v1.

## Clarifications

### Session 2026-05-26

- Q: At what AI confidence level should the system show the low-confidence note and fallback link? → A: Below 40% — any scan result where the AI returns `confidencePercent < 40` triggers the "couldn't identify food clearly" note and the manual food search fallback link.
