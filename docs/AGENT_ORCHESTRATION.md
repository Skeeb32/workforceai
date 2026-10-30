# Agent orchestration

The current workflow prototype accepts one objective and invokes four distinct specialist prompts sequentially: Product Manager, Business Analyst, Software Engineer, and QA Engineer. Each specialist receives the preceding draft reports, returns a draft report, and has no tools or external side effects. The API has a fixed four-step bound.

## Durable production flow

1. Authenticate the requester and resolve organization membership server-side.
2. Persist a workflow run and its objective before execution.
3. Ask a planner to propose bounded subtasks and assigned agent IDs. Validate the plan against the enabled agents, budget, and maximum depth.
4. Persist each task and execution event before scheduling work.
5. Run specialist steps with checkpoints, deadlines, retries, idempotency keys, and per-run token/cost limits.
6. Validate each deliverable and mark the workflow `in_review`.
7. Require a human approval record before any sensitive integration action.
8. Save final outputs, reviewer decisions, costs, and audit events.

Never give agents unrestricted shell, network, production, or customer-data access. Treat model output as untrusted and keep tool authorization outside the model.
