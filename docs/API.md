# API

## `POST /api/workflows`

Development workflow prototype. Accepts JSON `{ "objective": "...", "selectedAgents": ["product-manager", "qa-engineer"] }` where the objective is 8–1,200 characters and `selectedAgents` contains 1–8 unique IDs from the built-in agent catalog. Runs the selected roles in order, passes earlier draft reports to later roles, and returns `{ objective, agents, reports: [{ role, content }], requiresHumanReview: true }`.

Responses: `400` for invalid JSON/input, `502` for provider failure or empty output, `503` when `OPENAI_API_KEY` is not configured. The route has no authentication, persistence, rate limiting, or tenant context and must not be exposed publicly in production.
