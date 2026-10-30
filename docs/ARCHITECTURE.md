# Architecture

## Current request path

```text
Browser UI ── POST /api/workflows ── Next.js server ── OpenAI API
    │                                      │
    └─ localStorage preview                └─ role-specific draft reports
```

The client currently stores task edits in localStorage. The API route validates one objective and runs four role prompts in a bounded, sequential loop. It returns drafts for human review. It has no tool registry and performs no external actions.

## Intended product shape

- Next.js handles web UI, authentication callbacks, and authenticated application endpoints.
- Supabase Auth provides identity; PostgreSQL provides tenant-scoped tasks, agent definitions, workflow runs, approvals, deliverables, and audit events.
- RLS policies enforce organization access at the database boundary.
- A durable worker/orchestrator should own long-running workflows, retries, checkpoints, budgets, and cancellation. Do not use an unbounded loop in a request handler.
- Integrations should be isolated behind scoped connectors and explicit action permissions.
- Any external or sensitive operation must create an approval record before execution.

## Trust boundaries

1. Browser input is untrusted; validate server-side.
2. Provider credentials remain server-only.
3. Model output is untrusted text and must not become an executable tool call without policy validation.
4. Tenant IDs must be checked against authenticated membership on every server path; client-supplied organization IDs are not authority.
5. Approval state and the eventual external side effect should be linked by an auditable, idempotent execution record.

## Current limitations

The API route has no authentication, persistent run history, streaming, budget enforcement, retry queue, or rate limit. It is a development prototype and should not be exposed as a production endpoint until these controls are implemented.
