# MacrosTracker: AI-Driven Nutrition & Fitness Goal Tracking

A modern full-stack web application that empowers users to track their nutrition, set personalized fitness goals, and achieve sustainable health outcomes through intelligent macro tracking and AI-assisted goal planning.

---

## 🎯 Project Overview

**MacrosTracker** combines modern web technologies with data science to deliver a seamless nutrition tracking experience. The platform helps users:

- **Set Evidence-Based Goals** – AI-powered goal calculator uses Mifflin-St Jeor formula + ISSN nutrition guidelines
- **Track Daily Nutrition** – Log meals and monitor progress toward personalized macro targets
- **Plan Intelligently** – Receive personalized macro recommendations based on body metrics and fitness objectives
- **Adapt in Real-Time** – Dashboard insights help users adjust strategies as they progress

---

## 🚀 Project Idea

MacrosTracker addresses a critical gap in fitness technology: while many apps track *what* users eat, few intelligently *calculate what they should eat*. 

### The Problem
- Most nutrition apps use generic formulas or require manual goal entry
- Users lack guidance on macro distribution for their specific goals (weight loss, muscle gain, maintenance)
- Goal setting is disconnected from real physiology

### The Solution
MacrosTracker provides:
1. **Onboarding Interview** – Collects height, weight, age, activity level, and goal preference
2. **Smart Calculation Engine** – Computes BMR → TDEE → Safe Calorie Floor → Personalized Macros
3. **Safe Guardrails** – Enforces nutritional minimums (1200 kcal women / 1500 kcal men)
4. **Progress Dashboard** – Visual breakdown of daily compliance vs. personalized targets

---

## 🤖 AI-Driven Development

This project is built with **Claude Code** and **Spec Kit**, leveraging AI to accelerate development while maintaining code quality and architecture consistency.

### Development Workflow

```
Spec Kit (Plan-Driven Architecture)
    ↓
    ├─ Specification Phase: Define feature requirements
    ├─ Research Phase: Gather technical context
    ├─ Data Model Phase: Design schema and contracts
    ├─ Planning Phase: Break work into tasks
    ├─ Implementation Phase: Execute with Claude Code
    └─ Analysis Phase: Quality review & iteration
```

### Claude Code Integration

**Claude Code** powers intelligent code generation across the stack:

- **Backend Logic** – Generates C# business logic following N-tier architecture
- **Database Operations** – EF Core migrations and entity configurations
- **API Contracts** – REST endpoint design with FluentValidation
- **Frontend Components** – React components with Zustand state management
- **Testing & Fixes** – Root cause analysis and refactoring based on CI/CD logs

### Spec Kit (Specification-Driven Development)

All features follow a structured, spec-driven methodology documented in `specs/`:

```
specs/
├── 001-project-setup/
├── 002-user-auth/
├── ...
└── 008-user-nutrition-goals/
    ├── plan.md ..................... Implementation roadmap
    ├── research.md ................. Technical research & validation
    ├── data-model.md ............... Entity design & database schema
    ├── contracts/
    │   └── user-goal-profile.md .... API contract specifications
    └── tasks.md .................... Actionable task breakdowns
```

Each spec includes:
- **Constitutional Check** – Validates adherence to architecture principles
- **Phase-Based Breakdown** – Research → Design → Planning → Implementation
- **Contract Definition** – Request/response DTOs with validation rules
- **Calculation Specs** – Detailed algorithms (e.g., Mifflin-St Jeor BMR formula)

---

## 🏗️ Architecture

### N-Tier Modular Monolith

MacrosTracker follows a clean, scalable architecture organized into logical tiers:

```
┌─────────────────────────────────────────────────────┐
│              ASP.NET Core API Layer                  │
│          GymScan.API (Controllers)                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          Business Logic & Services Layer              │
│   GymScan.Services (CQRS-Style Separation)          │
│  ├─ BusinessServices (Auth, Goal, Nutrition)        │
│  ├─ QueryServices (Reads, Projections)              │
│  ├─ CommandServices (Writes, Transactions)          │
│  └─ RepoServices (Data Access Abstraction)          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│        Data Access & Database Layer                   │
│      GymScan.Database (EF Core + SQL Server)        │
│  ├─ Entities (Domain Models)                        │
│  ├─ Configurations (Fluent API)                     │
│  └─ Migrations (Code-First)                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         React SPA Frontend (TypeScript/JSX)          │
│       MacrosTrackerWeb (Vite + Zustand)             │
└─────────────────────────────────────────────────────┘
```

### Key Principles

✅ **Thin Controllers** – No business logic; controllers call services directly  
✅ **CQRS-Style Separation** – Explicit command/query services without MediatR complexity  
✅ **Generic Repository Pattern** – Centralized data access with soft-delete filters  
✅ **Dependency Injection** – All services registered in DI container  
✅ **Standard Response Contract** – Every API response follows `{ Data, Message, ErrorList }`  
✅ **SQL Server + EF Core** – One configuration file per entity, migrations in database project  

---

## 💻 Tech Stack

### Backend
- **Runtime**: .NET 10 / ASP.NET Core
- **ORM**: Entity Framework Core 9 with SQL Server
- **Validation**: FluentValidation
- **Patterns**: CQRS-style (Query/Command Services), Generic Repository, Dependency Injection

### Frontend
- **Runtime**: Node.js / TypeScript
- **Framework**: React 18 + Vite
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router

### Infrastructure
- **Database**: SQL Server
- **Source Control**: Git (Spec Kit branching)
- **Development** AI: Claude Code (Anthropic)

### Language Composition
- JavaScript: 70.8%
- C#: 18.1%
- PowerShell: 5.7%
- CSS: 3.4%
- Shell: 2.0%

---

## 📁 Project Structure

```
MacrosTracker/
├── MacrosTrackerAPI/
│   └── src/
│       ├── GymScan.API/
│       │   ├── Controllers/
│       │   │   ├── AuthController.cs
│       │   │   ├── NutritionGoalsController.cs
│       │   │   └── UserGoalProfileController.cs
│       │   ├── Program.cs
│       │   └── appsettings.json
│       ├── GymScan.Services/
│       │   ├── Features/
│       │   │   ├── Auth/
│       │   │   ├── Nutrition/
│       │   │   └── UserGoalProfile/
│       │   ├── BusinessServices/
│       │   ├── QueryServices/
│       │   ├── CommandServices/
│       │   └── RepoServices/
│       └── GymScan.Database/
│           ├── Entities/
│           ├── Configurations/
│           ├── Data/AppDbContext.cs
│           └── Migrations/
├── MacrosTrackerWeb/
│   └── src/
│       ├── api/
│       ├── pages/
│       ├── components/
│       ├── store/
│       ├── App.jsx
│       └── main.jsx
└── specs/
    ├── 001-project-setup/
    ├── 002-user-auth/
    ├── ...
    └── 008-user-nutrition-goals/
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        └── tasks.md
```

---

## 🔄 Feature: User Nutrition Goals (Example)

### Feature Story

> As a fitness enthusiast, I want MacrosTracker to calculate my personalized daily macro targets based on my body metrics and goal, so I can track progress toward evidence-based nutrition objectives.

### Implementation Phases

#### Phase 0: Research
- Validate Mifflin-St Jeor BMR formula
- Document ISSN protein guidelines (1.6–2.2 g/kg by goal)
- Confirm SQL Server table design

#### Phase 1: Design
- Define `UserGoalProfile`, `GoalType`, `ActivityLevel` entities
- Create DTOs: `SetGoalProfileRequestDto`, `GoalCalculationPreviewDto`
- Document calculation algorithm step-by-step

#### Phase 2: Plan
- Break implementation into 8–12 discrete tasks
- Assign dependencies and sequence
- Estimate effort per task

#### Phase 3: Implement
- Create database entities and EF Core configurations
- Build `UserGoalProfileService` with calculation logic
- Implement REST controller endpoints
- Build React onboarding form (`GoalSetup.jsx`)
- Add calculation preview and validation

#### Phase 4: Analyze
- Review code quality and test coverage
- Validate calculations against nutritional guidelines
- Iterate on performance or UX issues

---

## 🚀 Getting Started

### Prerequisites
- **.NET 10** SDK
- **SQL Server** (local or Azure)
- **Node.js 18+** with npm/pnpm
- **Git** with Spec Kit extension

### Backend Setup

```bash
cd MacrosTrackerAPI
dotnet restore
dotnet ef database update --project src/GymScan.Database

# Run dev server
dotnet run --project src/GymScan.API
```

### Frontend Setup

```bash
cd MacrosTrackerWeb
npm install
npm run dev
```

The API will be available at `https://localhost:7001` and the frontend at `http://localhost:5173`.

---

## 🧠 Using Claude Code & Spec Kit

### Example Workflow

1. **Create a Spec** (Spec Kit)
   ```bash
   specify create --type feature --title "User Preferences"
   ```
   Spec Kit automatically:
   - Creates a feature branch (`009-user-preferences`)
   - Scaffolds `specs/009-user-preferences/`
   - Commits changes

2. **Research & Plan** (Your Input + Claude)
   - Document requirements in `spec.md`
   - Research technical approach
   - Define data model
   - Break into tasks

3. **Generate Implementation** (Claude Code)
   - Claude Code reads the spec
   - Generates C# services, EF configurations, DTOs
   - Generates React components, API clients
   - Follows architecture standards automatically

4. **Iterate & Refine** (Your Feedback + Claude)
   - Review generated code
   - Request adjustments via natural language
   - Claude Code updates files intelligently
   - Run tests and validate against spec

5. **Merge & Deploy**
   - Code review via GitHub
   - Merge feature branch to `main`
   - Deploy to staging/production

### Key Claude Code Strengths

- **Architecture Adherence** – Automatically applies N-tier patterns
- **Consistency** – Every generated service follows the same contract
- **Bulk Generation** – Creates multiple related files in one pass
- **Refactoring** – Understands existing code and integrates seamlessly
- **Error Analysis** – Fixes bugs by reading CI/CD logs

---

## 📊 Development Stats

| Metric | Value |
|--------|-------|
| **Language Composition** | 70.8% JavaScript, 18.1% C#, 11.1% Other |
| **Active Specs** | 8+ feature specifications |
| **Architecture Tiers** | 3 (API, Services, Database) |
| **Response Standard** | `{ Data, Message, ErrorList }` |
| **Testing** | Manual + CI/CD validation (no unit tests per constitution) |
| **Deploy Target** | Web (ASP.NET Core + React SPA) |

---

## 🎓 Learning Resources

- [Mifflin-St Jeor BMR Calculator](https://en.wikipedia.org/wiki/Basal_metabolic_rate#Mifflin%E2%80%93St_Jeor_equation) – Science behind calorie calculation
- [ISSN Protein Guidelines](https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-9) – Nutrition research
- [Spec Kit Documentation](#) – Specification-driven development framework
- [Claude Code Best Practices](#) – AI-assisted development workflows
- [ASP.NET Core Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/) – Microsoft N-tier guide
- [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/) – Database mapping

---

## 📝 Contributing

When adding features:

1. **Follow Spec Kit** – Create a spec in `specs/XXX-feature-name/`
2. **Respect Architecture** – Adhere to N-tier modular patterns
3. **Use Claude Code** – Generate code via AI, review carefully
4. **Document Calculations** – If adding business logic, document formulas
5. **Test Manually** – Validate against spec before merging

---

## 📄 License

MIT License – See LICENSE file for details.

---

## 🤝 Contact & Support

For questions, issues, or feature requests:
- **GitHub Issues** – Report bugs or request features
- **Discussions** – Community Q&A and ideas
- **Email** – [Project maintainer contact]

---

**Built with ❤️ using Claude Code and Spec Kit. Empowering smarter nutrition tracking.**
