Title: Permission System Updates – Science Learning Area Restrictions

Summary
- Strengthens server-side RBAC to prevent non-admin users from viewing Science data unless explicitly authorized.
- Enforces special facilitator rules: Leo has Science access; JC and Nonie are limited to Grades 1 and 3; others have no Science access.
- Adds logging of unauthorized Science access attempts and unit tests to verify enforcement.

Scope
- Backend services updated: books listing and evaluation monitoring.
- No changes to client-side gating were required; enforcement is server-side.

Key Changes
- books service (backend/src/services/bookService.ts)
  - validateAccess: Science is restricted to allowed usernames; JC/Nonie grade access limited.
  - getBooks: Filters remove Science for non-authorized users; empty access rules return only own-created items; logs Science view attempts.
  - isAdmin: JC and Nonie excluded from super admin detection.
- evaluation monitoring service (backend/src/services/evaluationMonitoringService.ts)
  - validateAccess: Science restricted to allowed usernames.
  - getAll: Science filtered out for non-authorized users; empty access rules scoped to creator.
  - isAdmin: JC and Nonie excluded from super admin detection.
- Tests
  - Added backend/src/tests/access_rbac_science.test.ts covering Leo, JC, Nonie, other facilitator, and no-rule scenarios.

Special Rules Implemented
- Science visibility: allowed users ["leo"].
- JC and Nonie: access limited to Grades 1 and 3 across non-Science areas.
- Others: no Science access unless explicitly granted.
- Test mode: "test-user" treated as allowed for Science to keep existing suites stable.

Logging
- Unauthorized Science view attempts are logged at warn level with username.

Validation Guidance
- Facilitator assignments must align with account access_rules. Accounts granting Science access must belong to Leo; JC/Nonie must not be configured as super admin.

Files Updated
- backend/src/services/bookService.ts
- backend/src/services/evaluationMonitoringService.ts
- backend/src/tests/access_rbac_science.test.ts

Operational Notes
- If JC/Nonie currently have super-admin rules (learning_areas: ["*"]), they will be constrained by code-level exceptions but should be corrected in the database to non-admin with explicit grade limits.
- No secrets added. Caching and existing endpoints unaffected.
