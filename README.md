# MacrosTracker

Intelligent macro tracking app that calculates personalized nutrition goals using science-based formulas and AI-assisted development.

## What It Does

MacrosTracker helps users:
- Set evidence-based macro targets based on body metrics and fitness goals
- Track daily nutrition intake vs. personalized targets
- Receive AI-powered recommendations using the Mifflin-St Jeor formula + ISSN guidelines

## Built With

- **Backend**: .NET 10, ASP.NET Core, EF Core, SQL Server
- **Frontend**: React 18, TypeScript, Zustand, Vite
- **Development**: Claude Code + Spec Kit (AI-assisted, spec-driven)

## Stack

```
70.8% JavaScript
18.1% C#
11.1% Other (PowerShell, CSS, Shell)
```

## Architecture

N-tier modular monolith:
- **API Layer**: ASP.NET Core controllers
- **Service Layer**: Business logic & calculations
- **Data Layer**: EF Core + SQL Server

## Quick Start

### Backend
```bash
cd MacrosTrackerAPI
dotnet restore
dotnet ef database update
dotnet run --project src/GymScan.API
# API: https://localhost:7001
```

### Frontend
```bash
cd MacrosTrackerWeb
npm install
npm run dev
# Frontend: http://localhost:5173
```

## How We Build

We use **Spec Kit** for spec-driven development and **Claude Code** for AI-assisted implementation:

1. Create feature specification → Spec Kit creates branch & structure
2. Write spec, research, design → Document in `specs/XXX/`
3. Generate code → Claude Code creates services, components, APIs
4. Review & merge → GitHub review workflow

Example: See `specs/008-user-nutrition-goals/` for a complete feature spec.

## Key Features

- 🧮 **Smart Goal Calculator** – Mifflin-St Jeor BMR + personalized macros
- 📊 **Progress Dashboard** – Visual compliance tracking
- 🔒 **Safe Guardrails** – Enforces minimum calorie requirements
- 🤖 **AI-Generated Code** – Consistent architecture across features
- 📋 **Spec-Driven** – Every feature documented before coding

## Contributing

1. Create a spec in `specs/XXX-feature-name/`
2. Follow the N-tier architecture
3. Use Claude Code for implementation
4. Test and submit PR

## License

MIT
