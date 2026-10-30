# Security notes

## Implemented foundations

- The provider key is read only in the server route.
- Request objective is validated and bounded to 1,200 characters.
- The workflow has a fixed set of four roles and no external tools.
- Generated content is marked as draft output for human review.
- The migration uses tenant membership checks and RLS on all tenant-owned tables.
- `.env*` files are ignored by Git except `.env.example`.

## Required before production

- Authentication and authorization on every route, including `/api/workflows`.
- Server-verified organization membership and tenant context.
- Rate limits, request quotas, concurrency limits, and cost budgets.
- CSRF/origin protection as appropriate to the auth flow.
- Provider timeout, cancellation, redaction, and request tracing policies.
- Security review of RLS policies and tests proving one tenant cannot read another.
- Secrets management and key rotation.
- Audit logging for approval changes and integration actions.
- Data retention, export, deletion, and incident response procedures.

This repository is an MVP preview, not a production security certification.
