# Research: AI Food Scan

**Branch**: `004-food-scan` | **Date**: 2026-05-26
**Feeds into**: plan.md → Phase 1 design

---

## Decision 1: Gemini API Integration Strategy

**Decision**: Call the Gemini REST API directly via `HttpClient` rather than using a third-party SDK.

**Rationale**: The `AiOptions` configuration (Provider, ApiKey, Model `gemini-2.5-flash`) is already wired in `appsettings.json`. Using `HttpClient` keeps the dependency footprint minimal, mirrors how .NET projects commonly consume external JSON APIs, and makes the `IFoodVisionService` implementation straightforward to read and test without SDK abstractions. If the client later needs to swap to OpenAI or a local model, only `GeminiFoodVisionService.cs` changes.

**Endpoint used**:
```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
Content-Type: application/json
```

**Request shape**:
```json
{
  "contents": [{
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } },
      { "text": "Analyze this food image. Respond only with JSON in this exact format: { \"foodName\": string, \"calories\": number, \"proteinGrams\": number, \"carbsGrams\": number, \"fatGrams\": number, \"servingSizeGrams\": number, \"confidencePercent\": number, \"notes\": string | null }" }
    ]
  }]
}
```

**Extensibility — three swap scenarios, zero cascading changes:**

| Scenario | What changes | What stays the same |
|----------|-------------|---------------------|
| Swap provider (Gemini → OpenAI → local model) | New class implementing `IFoodVisionService`, one DI line in `Program.cs` | `FoodScanService`, controller, all DTOs, all frontend code |
| Change model within same provider (e.g., flash → pro) | `AI:Model` in `appsettings.json` | Everything |
| Tune the AI prompt | `AI:PromptTemplate` in `appsettings.json` | Everything — prompt is never hardcoded in source |

`FoodVisionResult` is the stable boundary record. It MUST contain only provider-neutral fields. If a new provider returns additional data (e.g., ingredient breakdown), expose it through a separate method or a new interface — never add provider-specific fields to `FoodVisionResult`.

**Failure handling**:
- HTTP error from Gemini → return `FoodVisionResult` with `ConfidencePercent = 0` and `Notes = "AI service unavailable"`
- Unparseable JSON response → same fallback — business service detects low confidence and surfaces fallback message to user

**Alternatives considered**:
- `Google.AI.Generative` NuGet SDK: Official but experimental, adds package dependency, offers no meaningful abstraction benefit over direct HTTP for a single endpoint.
- OpenAI vision: Different provider, same pattern — the `IFoodVisionService` abstraction means this swap costs one class file.

---

## Decision 2: Image Storage

**Decision**: Store uploaded scan images on the local filesystem under a configurable `UploadPath`, defaulting to `wwwroot/uploads/scans/`.

**Rationale**: No additional infrastructure dependencies. Files are named by GUID to avoid collisions and path traversal. The business context notes a future `storeImage: false` flag as out-of-scope for v1, so this is an acceptable starting point. The path is surfaced via an `UploadOptions` configuration section so the client can override it without code changes.

**Stored path**: relative path (e.g., `uploads/scans/{guid}.jpg`) is persisted in `FoodScan.ImagePath`. The API can serve these as static files via `UseStaticFiles`.

**Alternatives considered**:
- Azure Blob Storage: Better for production scale, but adds SDK dependency and credential management scope. Deferred to phase 2.
- Storing images as DB BLOBs: Anti-pattern for SQL Server at this scale.

---

## Decision 3: File Validation

**Decision**: Validate uploaded images by reading the first 12 bytes (magic bytes / file signature) in addition to checking declared MIME type and file size.

**Rationale**: The business context explicitly requires magic byte validation ("validate magic bytes, not just extension"). Extension and Content-Type headers are trivially spoofed; reading the actual file signature is the reliable approach.

**Supported signatures**:
| Format | Signature bytes |
|--------|----------------|
| JPEG   | FF D8 FF |
| PNG    | 89 50 4E 47 0D 0A 1A 0A |
| WebP   | 52 49 46 46 ?? ?? ?? ?? 57 45 42 50 |
| GIF    | 47 49 46 38 |

Any file failing signature validation is rejected before being written to disk.

**Size limit**: 10 MB, enforced before reading the stream.

---

## Decision 4: Local Food Database Lookup

**Decision**: After the AI returns a food name, perform a case-insensitive substring match against `LocalFoodItem.Name` and `LocalFoodItem.AlternateNames`. If a match is found, use the verified local macros instead of the AI estimate and mark the result as `ResultSource.Verified`.

**Rationale**: This is the core localization differentiator. A simple `Contains` match covers most cases (e.g., AI returns "Koshary" and the DB has "Koshary"). For v1 with ~50 seed items, this is sufficient. Full fuzzy matching (trigram, Levenshtein) is deferred to the Egyptian food database spec.

**Alternate names storage**: Stored as a pipe-delimited string in `LocalFoodItem.AlternateNames` (e.g., `"ta'meya|falafel|طعمية"`). This avoids a join table for v1 while still enabling substring search across all names.

---

## Decision 5: Seed Data Strategy

**Decision**: Seed the `LocalFoodItem` table using an EF Core `HasData` call in `LocalFoodItemConfiguration`, consistent with the existing `Seeds/` pattern in the database project.

**Rationale**: Keeps seeding inside the migration pipeline. The seed data for 50+ Egyptian foods is defined in `GymScan.Database/Seeds/LocalFoodItemSeed.cs` as a static array and referenced from the entity configuration.

**Priority foods for seed** (business context section 10):
Main dishes, staples, sides, desserts, and common fast food — full list defined in `LocalFoodItemSeed.cs`.

---

## Decision 6: MealType Enum

**Decision**: Define `MealType` as a C# enum with values `Breakfast = 1`, `Lunch = 2`, `Dinner = 3`, `Snack = 4`. Stored as integer in the database. No custom meal types in v1.

---

## Decision 7: ResultSource Enum

**Decision**: Define `ResultSource` as a C# enum with values `AiEstimate = 1`, `Verified = 2`. Stored as integer in `FoodScan.ResultSource`.
