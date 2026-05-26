<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

Architecture standard for future backend work in this repository:
- Follow a clean N-tier modular monolith structure.
- Presentation lives in `MacrosTrackerAPI/src/GymScan.API`.
- EF Core database concerns live in `MacrosTrackerAPI/src/GymScan.Database`.
- Generic repository logic and unit-of-work save coordination live in `MacrosTrackerAPI/src/GymScan.Repository`.
- Application/business logic lives in `MacrosTrackerAPI/src/GymScan.Services`.
- Use thin REST controllers only. No business logic, mapping logic, or query logic in controllers.
- Controllers should call business services directly.
- Business services should orchestrate validation, current-user context, repo services, command/query services, and repository-layer unit-of-work saves.
- Repo services should hide database/query composition from business services.
- Keep CQRS-style separation with explicit command services for writes and query services for reads, but do not use MediatR.
- Use dependency injection everywhere.
- Use EF Core SQL Server with one configuration file per entity, global soft-delete query filters, and migrations stored in the database project.
- Use the generic repository for entity fetches, lists, pagination, projections, includes, no-tracking reads, split queries, and query-filter bypass when needed.
- Keep all business rules outside repositories.
- Organize service implementation folders by service type first, then domain. Example: `BusinessServices/Auth`, `RepoServices/Auth`, `CommandServices/Auth`, and `QueryServices/Auth`.
- Standardize all service responses to `Data`, `Message`, and `ErrorList`.
- Avoid re-introducing unit testing or frontend test harnesses unless the request explicitly asks for them.
<!-- SPECKIT END -->
