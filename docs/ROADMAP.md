# Roadmap

## Implemented in this MVP preview

- Responsive command center, employee directory, task list, workflow overview, approvals, and deliverables views.
- Create task, browser-local task persistence, text search, approve/return approval actions.
- Four-step AI workflow API with server-side key handling and human-review response.
- Initial PostgreSQL schema and tenant RLS policies.
- Setup, architecture, API, deployment, and security documentation.

## Next implementation phase

- Supabase authentication, organization onboarding, invitations, and role management.
- Replace localStorage with tenant-scoped database reads/writes.
- Persist workflow executions, tasks, reports, approval decisions, and audit events.
- Add auth, tenant checks, rate limits, and per-run cost budgets to AI routes.
- Move long-running orchestration to a durable job worker with retry and cancellation.
- Add automated unit, integration, RLS, and browser tests.

## Later

- Integration framework and individually authorized GitHub, Slack, Jira, and CRM connectors.
- Agent memory with data provenance and tenant-specific retrieval.
- Cost/performance analytics based on actual execution records.
- Subscription billing, organization administration, and third-party employee marketplace.
