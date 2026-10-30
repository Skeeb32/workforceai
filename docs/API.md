# API

## `POST /api/workflows`

Development workflow prototype. Accepts JSON `{ "objective": "..." }` where the objective is 8–1,200 characters. Runs four fixed AI roles in sequence and returns `{ objective, reports: [{ role, content }], requiresHumanReview: true }`.

Responses: `400` for invalid JSON/input, `502` for provider failure or empty output, `503` when `OPENAI_API_KEY` is not configured. The route has no authentication, persistence, rate limiting, or tenant context and must not be exposed publicly in production.
