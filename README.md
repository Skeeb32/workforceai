# WorkforceAI

WorkforceAI is an early SaaS MVP concept for coordinating specialized AI employees around business outcomes. This repository contains a polished, interactive command center and a server-side, four-role AI workflow prototype.

> **Current implementation status:** the dashboard currently runs in a clearly labeled browser preview. Tasks persist in the current browser only. The Supabase tenant schema is included, but authentication and shared database access are not wired into the UI yet. AI workflow execution works when a server-side `OPENAI_API_KEY` is configured. No external integrations or production actions are enabled.

## Features in this MVP

- Command center with workforce, task, project, and approval summaries.
- Eight sample AI employee profiles and employee marketplace-style directory.
- Customer controls to enable or pause each of eight specialist agents, with those preferences saved in the browser preview.
- Workflow-level agent selection so customers choose which enabled specialists handle each objective.
- Task creation, search, task queue, and browser-local persistence.
- Approval queue with approve and return-for-changes decisions.
- Workflow runner that calls the selected specialist roles in sequence and passes each draft to the next specialist.
- Human review required for generated output. The workflow endpoint cannot publish, deploy, send messages, or change external systems.
- Supabase/PostgreSQL schema with organization membership, tenant-scoped records, and row-level security policies.
- Responsive layout and keyboard accessible buttons, forms, and dialogs.

The included sample metrics and employees are illustrative preview content, not measured production results.

## Technology

- Next.js 14 App Router, React 18, TypeScript, CSS.
- OpenAI Chat Completions API called server-side through a small workflow route.
- Supabase Auth and PostgreSQL are the intended persistence layer; the migration defines the tenant-safe data model.

## Requirements

- Node.js 20 or newer and npm.
- Optional: an OpenAI API key for the workflow runner.
- Optional: a Supabase project for the next authentication and shared-persistence phase.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `OPENAI_API_KEY`, the dashboard and task/approval interactions still work; attempting to run a workflow shows a clear configuration message instead of fabricated output.

To enable role-by-role AI execution, add a key to `.env.local`:

```dotenv
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=gpt-4o-mini
```

Keep API keys server-side. Never prefix the provider key with `NEXT_PUBLIC_` or commit `.env.local`.

## Database setup

1. Create a Supabase project.
2. Apply `supabase/migrations/202610300001_initial_schema.sql` using the Supabase SQL editor or Supabase CLI.
3. Configure email auth and create an organization onboarding flow before connecting the UI.
4. Add the project URL and anon key to `.env.local` when client auth is implemented.

The migration enables RLS on every tenant-owned table and scopes reads/writes through organization membership. Review policies before production use, especially membership provisioning and approval transitions. Do not use a service role key in browser code.

## Project map

```text
src/app/page.tsx                  Command center and preview interactions
src/app/api/workflows/route.ts    Server-side sequential role execution
src/app/globals.css               Responsive interface styles
supabase/migrations/              PostgreSQL schema and RLS policies
docs/                             Architecture, security, deployment, API, roadmap
```

## Verification

```sh
npm run build
npx tsc --noEmit
```

The workflow route rejects malformed objectives, returns a configuration error when no key exists, limits objective size, and reports provider failures without exposing provider response bodies or credentials.

## Deployment

Deploy the Next.js app to Vercel or another Node.js host. Add `OPENAI_API_KEY` and `OPENAI_MODEL` as server-side environment variables. The current preview does not require Supabase. Do not expose workflow execution publicly until authentication, organization membership checks, rate limits, and usage budgets are connected to the route.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for completed, in-progress, and planned work. Authentication, connected tenant persistence, durable background execution, provider cost metering, and real external integrations remain future implementation work.

## License

MIT. See [LICENSE](LICENSE).
