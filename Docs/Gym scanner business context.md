# GymScan — Business Context Document

**Project type:** Freelance web application  
**Client industry:** Health & fitness  
**Target market:** Egypt (primary), broader Arabic-speaking market (future)  

---

## 1. Problem Being Solved

Most people who care about their nutrition still track food manually — they search, guess, or give up entirely. This is especially painful in Egypt where:

- Local dishes like koshary, ful medames, and feteer are not in mainstream nutrition apps (MyFitnessPal, Lose It, etc.)
- Portion sizes are not standardized — a plate of koshary from a street vendor and one from a restaurant are very different
- Arabic-speaking users find Western-first apps frustrating and inaccurate for their diet
- Gym culture is growing rapidly in Egypt but the tools available don't reflect local eating habits

GymScan solves this by letting users **take a photo of their meal and instantly get a nutritional breakdown** — calories, protein, carbs, fat — with a special layer of accuracy for Egyptian and regional food.

---

## 2. Target Users

### Primary user — Gym-goer / fitness-focused individual
- Age 18–35, male or female
- Goes to the gym 3–5x per week
- Wants to hit protein/calorie targets but finds manual logging tedious
- Eats a mix of home-cooked Egyptian food and fast food
- Uses WhatsApp, Instagram — comfortable with mobile web apps
- Does not want to install another app if the web experience is smooth

### Secondary user — Person on a diet / weight loss journey
- Less gym-focused, more calorie-aware
- Wants to understand what they're eating without becoming a nutrition expert
- May be advised by a nutritionist to track intake

### Tertiary user (future) — Nutritionist or coach
- Monitors clients' food logs
- Could be an admin-level user in a future version

---

## 3. Core Value Proposition

> "Point your camera at your meal, get your macros in seconds — even if it's koshary."

Three things that differentiate GymScan from existing tools:

1. **Scan-first, not search-first.** No typing, no searching a food database. Camera is the primary input.
2. **Egyptian food accuracy.** A curated local food database corrects AI estimates for regional dishes. This is a real problem other apps don't solve.
3. **Simple, not overwhelming.** Shows what matters — calories and macros — without drowning the user in micronutrients, food diaries, recipes, and social features.

---

## 4. Business Model (Client's Perspective)

The client is building this as a product, not an internal tool. Likely monetization paths:

### Free tier
- Unlimited scans (AI-powered, standard accuracy)
- 30-day history
- Basic macro tracking

### Premium tier (future — not in this build)
- Verified Egyptian food database matches
- Extended history + export
- Goal recommendations based on body metrics
- Possible integration with gym management software

### B2B angle (future)
- License the platform to gyms to offer to their members as a branded tool
- This is why the Egyptian food DB is a valuable moat — it's something the client owns and competitors don't

**For this build:** The client is launching a v1 product. Revenue model is not yet active. The goal is to demonstrate the core product and grow a user base.

---

## 5. Features — What We're Building vs. Not Building

### In scope (v1)
| Feature | Why it matters |
|---------|---------------|
| Photo-based food scan | Core differentiator — reason the product exists |
| Macro breakdown (cal, protein, carbs, fat) | The #1 thing gym-goers track |
| Daily meal diary | Users need to see their day in one place |
| Daily macro totals vs goals | Without targets, tracking has no purpose |
| Meal history (past 30 days) | Users want to review patterns, not just today |
| Weekly trend charts | Visual progress is motivating |
| User profile + body metrics | Needed for accurate goal setting |
| Nutrition goal setting | Users need to set their own targets |
| Egyptian food database | The key localization differentiator |
| Manual food search (local DB) | Fallback when camera scan isn't ideal |
| JWT auth (register/login) | Required to persist user data |

### Out of scope (v1)
| Feature | Reason |
|---------|--------|
| Barcode scanning | Different tech stack, adds scope significantly |
| Recipe builder | Too complex for v1 |
| Social / sharing | Not the core job-to-be-done |
| Nutritionist dashboard | Different user type, different product |
| Native mobile app | Web-first is faster to ship; PWA covers mobile |
| Meal planning / suggestions | AI meal planning is a separate product |
| Water intake tracking | Nice-to-have, not critical |
| Supplement tracking | Niche, adds complexity |
| Payment / subscriptions | Not in v1 scope |
| Admin CMS for food DB | Basic seeded data is enough for v1; admin panel is phase 2 |

---

## 6. User Journey — End to End

### New user
```
Land on homepage
  → See value prop + "Start tracking" CTA
  → Register (email + password + name)
  → Redirected to dashboard (empty state with onboarding hint)
  → Prompted to set nutrition goals (or use defaults)
  → Navigate to Scan page
  → First scan experience (see Section 7)
  → Meal logged → dashboard shows first entry
```

### Returning user (daily use)
```
Open app → auto-login (token refresh)
  → Dashboard shows today's progress
  → See how many calories remaining
  → Go to Scan → photograph lunch
  → Confirm macros → log meal → back to dashboard
  → Dashboard updates with new totals
```

### User checks progress
```
Navigate to History
  → See last 7 days as a chart
  → Spot a day where protein was low
  → Click that day → see that day's diary
  → Understand what meals caused the gap
```

---

## 7. Core Feature Deep Dive — Food Scan UX

This is the make-or-break interaction. It must feel fast and trustworthy.

### Happy path
1. User taps "Scan Food" button
2. Camera opens (mobile) or file picker opens (desktop)
3. User takes or selects a photo
4. Preview shown — user sees their photo
5. User taps "Analyze"
6. Spinner with "Analyzing your meal..." (should resolve in 2–4 seconds)
7. Result card appears:
   - Food name identified (e.g. "Koshary — Medium portion")
   - Calories prominently displayed (e.g. **520 kcal**)
   - Macro grid: Protein 18g | Carbs 92g | Fat 11g
   - Serving size estimate (e.g. ~380g)
   - Source badge: "Verified local data" OR "AI estimate (72% confidence)"
   - Notes if any (e.g. "Mixed dish — estimate may vary")
8. User taps "Log this meal"
9. Picks meal type (Breakfast / Lunch / Dinner / Snack)
10. Confirms → meal saved → toast "Meal logged ✓"

### Edge cases to handle gracefully
| Situation | Expected behavior |
|-----------|------------------|
| Photo is blurry or not food | Low confidence result + note "Couldn't identify food clearly" |
| Multiple foods on plate | AI estimates the whole plate as one serving |
| AI service is down | Error message "Scan unavailable — search manually instead" with link to food search |
| File too large (>10MB) | Instant validation error before upload |
| Wrong file type | Instant validation error |
| User scans a drink | Works — beverages are valid inputs |

---

## 8. Data the App Collects

| Data | Purpose | Stored where |
|------|---------|-------------|
| Email + hashed password | Authentication | DB — Users table |
| First name, last name | Personalization | DB — Users table |
| Weight, height, age, gender | Goal calculation (BMR formula) | DB — Users table |
| Food scan images | AI analysis only | Server /uploads folder |
| Macro scan results | Logged meals history | DB — FoodScans table |
| Meal logs | Diary and history features | DB — MealLogs table |
| Nutrition goals | Progress tracking | DB — UserGoals table |

### Privacy notes for the client
- Scan images are stored server-side. If the client wants to avoid storing images (privacy-first), they can delete after AI analysis — the endpoint should support a `storeImage: false` flag in future.
- No data is sent to third parties except the scan image which goes to Google Gemini API for analysis. This should be disclosed in a privacy policy.
- Users can delete their account (Spec 5) which soft-deletes their data.

---

## 9. Non-Functional Requirements

### Performance
- Food scan response (end-to-end including AI call): target under 5 seconds
- Page load (dashboard, history): under 2 seconds on 4G connection
- API response (non-AI endpoints): under 200ms

### Reliability
- AI service failures should not crash the app — always show a fallback message
- If Gemini is down, the local food search should still work
- Refresh token flow must be seamless — users should never be unexpectedly logged out mid-session

### Scale (v1 expectations)
- Designed for up to ~1,000 active users initially
- No heavy optimization needed at this stage — clean code over premature optimization
- SQL indexes on: UserId on MealLogs, LoggedAt on MealLogs, UserId on FoodScans

### Security
- Passwords: BCrypt hashed, never stored plain
- JWT: short-lived access tokens (15 min) + refresh tokens (7 days)
- Refresh tokens: stored hashed in DB, invalidated on logout
- API keys: never in source code, always environment variables
- File uploads: validate magic bytes, not just extension
- Rate limiting on auth endpoints to prevent brute force

### Accessibility
- Minimum contrast ratio AA for all text
- All interactive elements keyboard accessible
- Camera input has clear label for screen readers
- Error messages are specific and actionable (not just "Something went wrong")

---

## 10. Egyptian Food Database — Business Rationale

This is the feature that justifies a custom build over telling the client to just use an existing app.

### Why it matters
- Existing nutrition databases (USDA, Open Food Facts) have very limited Egyptian food data
- When they do have it, portion sizes and preparation methods differ significantly
- A user scanning a plate of koshary will get wildly different AI estimates depending on the day — the local DB anchors this to a verified value

### What "verified" means
For each food entry the client should provide (or we research):
- Calorie and macro values per 100g from a credible source (USDA, Egyptian nutrition research, restaurant disclosed info)
- Typical serving size for Egyptian portions (not American)
- Common alternative names and spellings (e.g. "ta'meya" vs "falafel" vs "طعمية")

### How it creates a competitive moat
- Once the DB has 200+ verified Egyptian foods, it becomes very hard to replicate quickly
- Competitors using only AI will always have variance on these dishes
- The client can grow the DB over time as a data asset

### Foods to prioritize for seed data (minimum 50 at launch)
**Main dishes:** Koshary, Ful medames, Hawawshi, Molokhia with rice, Mahshi (stuffed vegetables), Feteer meshaltet, Liver sandwich (kebda), Shawarma, Grilled kofta, Grilled chicken, Fiteer bil gebna

**Sides & staples:** Egyptian rice, Baladi bread, Aish fino, Lentil soup (ads adas), Baba ghanoush, Hummus, Salad (Egyptian style)

**Desserts & drinks:** Om Ali, Konafa, Basbousa, Qatayef, Kahk, Rice pudding (roz bel laban), Ayran, Karkade (hibiscus), Sahlab

**Fast food / common:** Arayes, Kebab sandwich, Fiteer, Egg sandwich (Egyptian street style)

---

## 11. Third-Party Dependencies & Risks

| Dependency | Used for | Risk | Mitigation |
|------------|---------|------|------------|
| Google Gemini API | Food image analysis | API changes, downtime, cost increase | Abstract behind IFoodVisionService — can swap to OpenAI or local model without touching business logic |
| SQL Server / PostgreSQL | Data storage | Hosting cost | Use Azure SQL Basic ($5/mo) or Supabase free tier for start |
| .NET 10 | Backend | Very stable, LTS | No risk |
| React + Vite | Frontend | Very stable | No risk |
| JWT library | Auth | Standard | No risk |

### Vendor lock-in strategy
The most important rule: **all AI calls go through `IFoodVisionService`**. This means if Gemini raises prices, degrades in quality, or gets blocked in Egypt, the entire AI integration can be swapped in one file without touching a single controller, service, or frontend component.

---

## 12. What the Client Needs to Provide

Before development starts, collect from the client:

- [ ] Google AI Studio API key (or confirm they will create one)
- [ ] Preferred database: SQL Server (Azure) or PostgreSQL (Supabase / Railway)
- [ ] Hosting preference: Azure / Vercel / Railway / VPS
- [ ] Domain name (if they have one)
- [ ] Branding: app name, logo, primary color (or confirm GymScan as working name)
- [ ] Verified macro data for Egyptian foods they want in the seed DB
- [ ] Confirmation of launch scope (which specs are v1 vs later)
- [ ] Who manages API billing — client pays directly or passes through you

---

## 13. Delivery Phases & What to Charge Separately

### Phase 1 — Core product (Specs 0–5 + 7)
Everything a functional gym tracker needs. This is the baseline contract.

Includes: Foundation, Auth, Scan, Meal logging, Dashboard, History, Profile, Polish

**Deliverable:** Deployed, working web app with real AI food scanning.

---

### Phase 2 — Egyptian food localization (Spec 6)
The custom database work. Separate scope because:
- Requires research time to compile verified macro data
- Requires building a food matching engine
- Has ongoing value (the DB grows over time)

**Charge separately as:** "Local food database + AI accuracy layer"

---

### Phase 3 — Fine-tuning / custom model (optional future)
Only if the client wants to go deeper on accuracy — collecting food images, training or fine-tuning a model specifically on Egyptian food. This requires either:
- A machine learning partner/subcontractor
- Using OpenAI fine-tuning API (limited vision support)
- Building a labeled dataset (500+ images per food category)

**This is research work, not dev work. Price accordingly.**

---

## 14. Definition of Done (Per Spec)

A spec is done when:
- [ ] All endpoints listed in the spec return correct responses
- [ ] All frontend pages/components in the spec render correctly
- [ ] Happy path works end-to-end without errors
- [ ] Edge cases listed in the spec are handled (no crashes, appropriate error messages)
- [ ] No hardcoded secrets or localhost URLs
- [ ] EF migrations run cleanly on a fresh DB
- [ ] Swagger shows all new endpoints correctly documented

---

*Business context document — GymScan freelance project*  
*To be read alongside: gym-scanner-specs.md*
