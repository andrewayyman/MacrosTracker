---
description: "Task list for AI Food Scan feature implementation"
---

# Tasks: AI Food Scan

**Input**: Design documents from `/specs/004-food-scan/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated per repository standard.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Create shared infrastructure that must exist before any development begins.

- [X] T001 Create `MacrosTrackerAPI/src/GymScan.API/wwwroot/uploads/scans/.gitkeep` to ensure the uploads directory is committed and ready for image storage
- [X] T002 Add `app.UseStaticFiles()` to `MacrosTrackerAPI/src/GymScan.API/Program.cs` so scan images stored in `wwwroot/` are served as static files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All three entities must exist before any migration can run, and the AI service must be wired before US1 can be tested. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: No user story implementation can begin until T013 (migration) and T016 (DI registration) are complete.

- [X] T003 Create `MealType` enum (Breakfast=1, Lunch=2, Dinner=3, Snack=4) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Enums/MealType.cs`
- [X] T004 [P] Create `ResultSource` enum (AiEstimate=1, Verified=2) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Enums/ResultSource.cs`
- [X] T005 [P] Create `LocalFoodItem` entity (Id, Name, AlternateNames, CaloriesPer100g, ProteinPer100g, CarbsPer100g, FatPer100g, TypicalServingSizeGrams, CreatedAt) in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/LocalFoodItem.cs`
- [X] T006 Create `LocalFoodItemConfiguration` (table name, column types precision(7,2), Name index, HasData referencing seed) in `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Nutrition/LocalFoodItemConfiguration.cs`
- [X] T007 Create `LocalFoodItemSeed` static array with 50+ verified Egyptian food items (Koshary, Ful Medames, Hawawshi, Molokhia, Mahshi, Feteer, Liver sandwich, Shawarma, Kofta, Grilled chicken, Egyptian rice, Baladi bread, Lentil soup, Baba ghanoush, Hummus, Om Ali, Konafa, Basbousa, Ayran, Karkade, and others from the business context seed list) with calories/macros per 100g and typical Egyptian serving sizes in `MacrosTrackerAPI/src/GymScan.Database/Seeds/LocalFoodItemSeed.cs`
- [X] T008 [P] Create `FoodScan` entity (Id, UserId FK, ImagePath, FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams nullable, ResultSource int, ConfidencePercent nullable int, Notes nullable, ScannedAt, ISoftDeletable) in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/FoodScan.cs`
- [X] T009 [P] Create `FoodScanConfiguration` (table name, column precisions, UserId FK → User, composite index UserId+ScannedAt, global soft-delete filter) in `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Nutrition/FoodScanConfiguration.cs`
- [X] T010 [P] Create `MealLog` entity (Id, UserId FK, DiaryDate DateOnly, MealType int, FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams nullable, FoodScanId nullable FK, LocalFoodItemId nullable FK, LoggedAt, ISoftDeletable) in `MacrosTrackerAPI/src/GymScan.Database/Entities/Nutrition/MealLog.cs`
- [X] T011 Create `MealLogConfiguration` (table name, column precisions, FK → User required, FK → FoodScan optional, FK → LocalFoodItem optional, composite indexes UserId+DiaryDate and UserId+LoggedAt) in `MacrosTrackerAPI/src/GymScan.Database/Data/Configurations/Nutrition/MealLogConfiguration.cs`
- [X] T012 Register `DbSet<LocalFoodItem>`, `DbSet<FoodScan>`, and `DbSet<MealLog>` in `MacrosTrackerAPI/src/GymScan.Database/Data/AppDbContext.cs`
- [X] T013 Run `dotnet ef migrations add AddFoodScanAndMealLog` and `dotnet ef database update` from `MacrosTrackerAPI/` targeting `GymScan.Database` startup `GymScan.API` to create all three tables and seed LocalFoodItem data
- [X] T014 Create `IFoodVisionService` interface (method: `Task<FoodVisionResult> AnalyzeAsync(Stream imageStream, string mimeType)`) and `FoodVisionResult` record (FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams, ConfidencePercent, Notes) in `MacrosTrackerAPI/src/GymScan.Services/Common/Interfaces/IFoodVisionService.cs`. `FoodVisionResult` MUST contain only provider-neutral fields — never add Gemini-specific properties here. This record is the stable contract between any AI provider and the rest of the application.
- [X] T015 Add `PromptTemplate` string property to the existing `AiOptions` class (in `MacrosTrackerAPI/src/GymScan.Services/Configuration/AiOptions.cs`) and add a default value to `appsettings.json` under the `AI` section — e.g., `"PromptTemplate": "Analyze this food image. Respond only with JSON: { \"foodName\": string, \"calories\": number, \"proteinGrams\": number, \"carbsGrams\": number, \"fatGrams\": number, \"servingSizeGrams\": number, \"confidencePercent\": number (0-100), \"notes\": string|null }"`. The prompt can be changed in `appsettings.json` (or environment variable override) without recompiling.
- [X] T016 Implement `GeminiFoodVisionService` using `IHttpClientFactory` to call `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}`, read `_options.PromptTemplate` for the text part of the request body (never hardcode the prompt in this file), encode the image stream as base64 inline data, parse the JSON response into `FoodVisionResult`, and return a fallback `FoodVisionResult` with `ConfidencePercent = 0` and `Notes = "AI service unavailable"` when the call fails or the response JSON cannot be parsed. Swapping to a different provider means adding a new class implementing this same interface and changing the DI registration — no other file changes in `MacrosTrackerAPI/src/GymScan.API/Services/GeminiFoodVisionService.cs`
- [X] T017-DI Register `IFoodVisionService` → `GeminiFoodVisionService` (Scoped) and add named `HttpClient` for Gemini calls in `MacrosTrackerAPI/src/GymScan.API/Program.cs`. To swap to OpenAI or another provider in future: replace this one registration line with the new implementation — all other code stays unchanged.

**Checkpoint**: Foundation ready — all tables exist with seed data, prompt is configurable in `appsettings.json`, `IFoodVisionService` is wired. User story implementation can now begin.

---

## Phase 3: User Story 1 — Scan a Meal and Get Its Macros (Priority: P1) 🎯 MVP

**Goal**: User uploads a food photo → receives a result card with food name, calories, macros, source badge, and confidence indicator within 5 seconds.

**Independent Test**: Upload a JPEG food photo via `POST /api/FoodScan/Analyze` (authenticated) and confirm a 200 response with `data.foodName`, `data.calories`, `data.protein`, `data.carbs`, `data.fat`, and `data.resultSource` populated. Upload a non-image file and confirm a 400 error is returned before reaching Gemini.

### Backend — User Story 1

- [X] T017 [P] [US1] Create `AnalyzeFoodRequest` record (wrapping `IFormFile Image`) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Dtos/Requests/AnalyzeFoodRequest.cs`
- [X] T018 [P] [US1] Create `FoodScanResultDto` record (ScanId, FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams, ResultSource string, ConfidencePercent nullable, Notes, LocalFoodItemId nullable) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Dtos/Responses/FoodScanResultDto.cs`
- [X] T019 [US1] Create `AnalyzeFoodRequestValidator` using FluentValidation: reject null file, reject files > 10 MB, read first 12 bytes and reject if not JPEG (FF D8 FF), PNG (89 50 4E 47), WebP (52 49 46 46 ... 57 45 42 50), or GIF (47 49 46 38) signatures in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Validators/AnalyzeFoodRequestValidator.cs`
- [X] T020 [P] [US1] Create `FoodScanMappings` with extension method `FoodScan.ToFoodScanResultDto()` mapping entity fields to DTO including `ResultSource` enum → display string in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Mappings/FoodScanMappings.cs`
- [X] T021 [US1] Create `IFoodScanService` interface with `Task<ServiceResponse<FoodScanResultDto>> AnalyzeAsync(IFormFile image)` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/IFoodScanService.cs`
- [X] T022 [US1] Implement `FoodScanService.AnalyzeAsync`: validate file via `AnalyzeFoodRequestValidator`, save image to `wwwroot/uploads/scans/{guid}{ext}`, call `IFoodVisionService.AnalyzeAsync`, perform case-insensitive `Contains` match on `LocalFoodItem.Name` and `AlternateNames` (prefer verified match), set `ResultSource` and `LocalFoodItemId` accordingly, compute per-serving macros from local data when verified, save `FoodScan` entity via `AppDbContext`, return `ServiceResponse<FoodScanResultDto>.Success(...)`. When `ConfidencePercent < 40`, set `Notes` to indicate low confidence even if AI returned a food name. When `IFoodVisionService` throws, return `ServiceResponse.Failure` with status 503 in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/FoodScanService.cs`
- [X] T023 [US1] Register `IFoodScanService` → `FoodScanService` (Scoped) in `MacrosTrackerAPI/src/GymScan.Services/Features/DependencyInjection.cs`
- [X] T024 [US1] Create `FoodScanController` inheriting `ApiControllerBase` with `[Authorize]` and `[HttpPost]` Analyze action accepting `[FromForm] IFormFile image`, calling `IFoodScanService.AnalyzeAsync`, returning `ToActionResult(result)` in `MacrosTrackerAPI/src/GymScan.API/Controllers/FoodScanController.cs`

### Frontend — User Story 1

- [X] T025 [P] [US1] Create `foodScanClient.js` with `analyzeFood(formData)` function posting to `/api/FoodScan/Analyze` with `Content-Type: multipart/form-data`, attaching the Bearer token from auth store in `MacrosTrackerWeb/src/api/foodScanClient.js`
- [X] T026 [P] [US1] Create `ScanResultCard.jsx` component rendering: food name, calorie count prominently, macro grid (Protein / Carbs / Fat in grams), serving size estimate, source badge ("Verified local data" in green or "AI estimate X% confidence" in amber), notes line when present, low-confidence warning with "Search manually instead" link when `resultSource === 'AiEstimate'` and `confidencePercent < 40` in `MacrosTrackerWeb/src/components/ScanResultCard.jsx`
- [X] T027 [US1] Build the scan upload UI in `MacrosTrackerWeb/src/pages/Scan.jsx`: file input with `accept="image/*" capture="environment"` for camera on mobile, selected image preview, Analyze button (disabled until file selected), loading spinner with "Analyzing your meal..." text during request, render `ScanResultCard` on success, show inline error message on 400/503, show "Search manually instead" link on 503

**Checkpoint**: US1 complete — upload a real food photo, receive a result card with macros and source badge. Test independently without logging.

---

## Phase 4: User Story 2 — Log a Scanned Meal to the Diary (Priority: P2)

**Goal**: User confirms scan result → selects meal type → diary entry is created → dashboard totals update.

**Independent Test**: After completing a scan (or using a mock `scanId`), POST to `/api/FoodScan/Log` with a valid `LogMealRequest` and confirm a 201 response with `data.id` and `data.diaryDate` set to today. Then confirm the MealLog row exists in the database.

### Backend — User Story 2

- [X] T028 [P] [US2] Create `LogMealRequest` record (FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams nullable, MealType, FoodScanId nullable Guid, LocalFoodItemId nullable Guid) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Dtos/Requests/LogMealRequest.cs`
- [X] T029 [P] [US2] Create `MealLogDto` record (Id, DiaryDate, MealType string, FoodName, Calories, Protein, Carbs, Fat, ServingSizeGrams nullable, LoggedAt) in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Dtos/Responses/MealLogDto.cs`
- [X] T030 [US2] Create `LogMealRequestValidator` using FluentValidation: FoodName required max 200, Calories >= 0, Protein/Carbs/Fat >= 0, MealType must be a valid `MealType` enum value in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Validators/LogMealRequestValidator.cs`
- [X] T031 [US2] Add `MealLog.ToMealLogDto()` extension method to `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/Mappings/FoodScanMappings.cs`
- [X] T032 [US2] Add `LogMealAsync(LogMealRequest request)` to `IFoodScanService` interface and implement in `FoodScanService`: get current user ID, validate request via `LogMealRequestValidator`, create `MealLog` with `DiaryDate = DateOnly.FromDateTime(DateTime.UtcNow)`, save via `AppDbContext`, return `ServiceResponse<MealLogDto>.Success(...)` with status 201 in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodScan/FoodScanService.cs`
- [X] T033 [US2] Add `[HttpPost] Log` action to `FoodScanController` accepting `[FromBody] LogMealRequest`, calling `IFoodScanService.LogMealAsync`, returning `ToActionResult(result)` in `MacrosTrackerAPI/src/GymScan.API/Controllers/FoodScanController.cs`

### Frontend — User Story 2

- [X] T034 [P] [US2] Create `MealTypeSelector.jsx` component rendering four buttons (Breakfast / Lunch / Dinner / Snack), highlighting the selected one, calling an `onSelect(mealType)` prop in `MacrosTrackerWeb/src/components/MealTypeSelector.jsx`
- [X] T035 [US2] Add `logMeal(payload)` function to `MacrosTrackerWeb/src/api/foodScanClient.js` posting to `/api/FoodScan/Log` with JSON body and Bearer token
- [X] T036 [US2] Add log flow to `MacrosTrackerWeb/src/pages/Scan.jsx`: "Log this meal" button on `ScanResultCard`, renders `MealTypeSelector`, Confirm button calls `logMeal`, shows success toast "Meal logged ✓" on 201, "Dismiss" button discards result without logging and resets to upload state

**Checkpoint**: US1 + US2 complete — full scan-to-diary flow works end-to-end. Dashboard totals should reflect the new MealLog row.

---

## Phase 5: User Story 3 — Manual Food Search Fallback (Priority: P3)

**Goal**: User searches the local database by food name → selects a result → logs it to diary using the same flow as a scan result.

**Independent Test**: GET `/api/FoodScan/Search?q=koshary` (authenticated) and confirm at least one result is returned. Then POST `/api/FoodScan/Log` with the result data (no `foodScanId`) and confirm a 201 MealLog is created.

### Backend — User Story 3

- [X] T037 [P] [US3] Create `FoodSearchResultDto` record (Id, Name, CaloriesPerServing, ProteinPerServing, CarbsPerServing, FatPerServing, ServingSizeGrams) computing per-serving values from the entity's per-100g fields × TypicalServingSizeGrams / 100 in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/Dtos/Responses/FoodSearchResultDto.cs`
- [X] T038 [P] [US3] Create `FoodSearchMappings` with `LocalFoodItem.ToFoodSearchResultDto()` extension method computing per-serving macro values in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/Mappings/FoodSearchMappings.cs`
- [X] T039 [US3] Create `IFoodSearchService` interface with `Task<ServiceResponse<List<FoodSearchResultDto>>> SearchAsync(string query)` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/IFoodSearchService.cs`
- [X] T040 [US3] Implement `FoodSearchService.SearchAsync`: validate query is not null/empty, query `AppDbContext.LocalFoodItems` with `.AsNoTracking()` and case-insensitive `.Where(f => f.Name.Contains(query) || (f.AlternateNames != null && f.AlternateNames.Contains(query)))`, take top 20, map to `FoodSearchResultDto`, return `ServiceResponse<List<FoodSearchResultDto>>.Success(...)` in `MacrosTrackerAPI/src/GymScan.Services/Features/FoodSearch/FoodSearchService.cs`
- [X] T041 [US3] Register `IFoodSearchService` → `FoodSearchService` (Scoped) in `MacrosTrackerAPI/src/GymScan.Services/Features/DependencyInjection.cs`
- [X] T042 [US3] Add `[HttpGet] Search` action to `FoodScanController` accepting `[FromQuery] string q`, calling `IFoodSearchService.SearchAsync(q)`, returning `ToActionResult(result)` in `MacrosTrackerAPI/src/GymScan.API/Controllers/FoodScanController.cs`

### Frontend — User Story 3

- [X] T043 [P] [US3] Add `searchFood(query)` function to `MacrosTrackerWeb/src/api/foodScanClient.js` calling `GET /api/FoodScan/Search?q={query}` with Bearer token
- [X] T044 [US3] Create `FoodSearchPanel.jsx`: text input with 400ms debounce triggering `searchFood`, results list showing name + calories + macros per serving, clicking a result populates a pre-filled log form (food name, calories, macros, localFoodItemId set, no foodScanId) then shows `MealTypeSelector` → Confirm logs the entry in `MacrosTrackerWeb/src/components/FoodSearchPanel.jsx`
- [X] T045 [US3] Integrate `FoodSearchPanel` into `MacrosTrackerWeb/src/pages/Scan.jsx`: "Search manually instead" link (shown always below scan UI, also linked from 503 error and from low-confidence note in `ScanResultCard`) toggles between scan view and `FoodSearchPanel`; completed log from search panel shows the same success toast and resets view

**Checkpoint**: All three user stories complete — scan, log from scan, and log from manual search all work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation, observability, and hardening across all three stories.

- [X] T046 [P] Verify all three endpoints (`POST /Analyze`, `POST /Log`, `GET /Search`) appear in Swagger at `http://localhost:5000/swagger` with correct request/response schemas and the `[Authorize]` lock icon
- [ ] T047 Run all five quickstart.md smoke tests in order: file type rejection, analyze real photo, manual search for "koshary", log a meal via `/Log`, set `AI:ApiKey` to invalid value and confirm 503 with fallback message shown
- [X] T048 [P] Add inline loading states and error boundary to `MacrosTrackerWeb/src/pages/Scan.jsx`: show spinner during analyze request, show specific message for file-too-large (client-side check before upload), show specific message for wrong file type (client-side MIME check), ensure page does not crash if `ScanResultCard` receives null data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs the Analyze endpoint to get a `scanId`)
- **User Story 3 (Phase 5)**: Depends on Foundational completion — can run in parallel with US2 if staffed
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only
- **US2 (P2)**: Depends on US1 (Analyze endpoint must work to produce a scanId for the Log endpoint test)
- **US3 (P3)**: Depends on Foundational only — can be developed in parallel with US2

### Within Each User Story

- Backend DTOs and interfaces → implementations → controller actions
- Frontend API client function → component → page integration
- Backend must be runnable before frontend integration is testable end-to-end

### Parallel Opportunities

Within the Foundational phase:
- T004, T005, T008, T010 can all run in parallel (different entity files)

Within US1:
- T017, T018, T020 can run in parallel (different DTO/mapping files)
- T025, T026 (frontend client + component) can run in parallel with backend T022

Within US2:
- T028, T029 can run in parallel (different DTO files)
- T034 (MealTypeSelector component) can run in parallel with T030-T032 (backend)

Within US3:
- T037, T038, T043 can run in parallel
- Entire US3 backend (T037–T042) can run in parallel with US2 if a second developer is available

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — all entities, migration, Gemini service wired
3. Complete Phase 3: User Story 1 — scan, result card, source badge
4. **STOP and VALIDATE**: upload a real photo, get a result card back — the core product value is proven
5. Proceed to US2 (logging) once US1 smoke test passes

### Incremental Delivery

1. Setup + Foundational → database ready, AI service wired
2. US1 → Photo scan returns macros (MVP — the core UX is working)
3. US2 → Scanning + logging to diary (full scan-to-diary loop)
4. US3 → Manual search fallback (graceful degradation complete)
5. Polish → Swagger verified, smoke tests passed, loading states hardened

### Parallel Team Strategy

With two developers after Foundational is complete:
- Developer A: US1 (scan + result card)
- Developer B: US3 backend (search endpoint — only needs LocalFoodItem table)
- Once US1 is done, Developer A continues to US2 while Developer B does US3 frontend

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks in the same phase
- `[US#]` label maps task to its user story for traceability
- Migration (T013) must run before any endpoint smoke test
- Confidence threshold of 40% (from clarifications) applies in T022 (`FoodScanService.AnalyzeAsync`) and T026 (`ScanResultCard.jsx`)
- Manual search logs (US3) create `MealLog` only — no `FoodScan` row, `FoodScanId` is null (confirmed in clarification session)
- Never hardcode the Gemini API key — always read from `IOptions<AiOptions>` injected via DI
