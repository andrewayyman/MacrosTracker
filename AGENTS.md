<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read [specs/003-profile-and-nutrition-goals/plan.md](specs/003-profile-and-nutrition-goals/plan.md)

Backend architecture standard for this repository:
- Use a modular .NET backend monolith.
- Keep the API project limited to startup, middleware, attributes, current-user access, and thin REST controllers.
- Put all DTOs, FluentValidation validators, business services, command services, query services, repo services, mappings, and helpers in `MacrosTrackerAPI/src/GymScan.Services`.
- Put all EF Core concerns in `MacrosTrackerAPI/src/GymScan.Database`, including DbContext, entities, entity configurations, migrations, seeds, and any future DB functions.
- Put the generic repository implementation and unit-of-work save boundary in `MacrosTrackerAPI/src/GymScan.Repository`.
- Controllers must not contain business logic or query logic. Controllers should only handle transport concerns and call business services directly.
- Business services may orchestrate validators, current-user context, command/query services, repo services, and the repository-layer unit of work.
- Repo services are the only service-layer types that should compose repository access details.
- Reads and writes should stay split through query services and command services without MediatR.
- Keep business rules out of repositories.
- Organize controllers by business domain, but organize service implementations by service type first, then domain. Example: `BusinessServices/Auth`, `RepoServices/Auth`, `CommandServices/Auth`, and `QueryServices/Auth`.
- All service methods should return the standard response wrapper with `Data`, `Message`, and `ErrorList`.
- Do not add unit test projects or frontend test tooling unless explicitly requested again.
<!-- SPECKIT END -->
