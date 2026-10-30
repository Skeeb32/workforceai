# Database

The initial migration creates organizations and memberships, agents, workflows, tasks, deliverables, approvals, and audit events. All business records include `organization_id`; RLS uses `is_org_member` to scope access. Role checks are centralized in `has_org_role`.

## Apply

Run `supabase/migrations/202610300001_initial_schema.sql` in a new Supabase project. Then configure authentication and implement organization creation/invitation flows. Do not accept a client-provided `organization_id` without verifying membership.

## Important policy choices

- Any member can view organization work, create tasks and workflows, and review pending approvals.
- Owner/admin membership controls agent configuration, organization settings, and membership changes.
- Only owner/admin can delete tasks. Audit history and deliverables have no client deletion policy.
- Approval updates must identify the reviewing user.

Before production, add stricter role rules for approval decisions, immutable audit-event writes through trusted server code, soft deletion/retention policy, indexes based on real query patterns, and tests for cross-tenant access.
