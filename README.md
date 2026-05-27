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


## Architecture

N-tier modular monolith:
- **API Layer**: ASP.NET Core controllers
- **Service Layer**: Business logic & calculations
- **Data Layer**: EF Core + SQL Server

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

