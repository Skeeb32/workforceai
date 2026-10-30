# Deployment

## Vercel

1. Import the repository into Vercel.
2. Select the Next.js framework preset.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in server-side project environment variables.
4. Deploy a preview first and verify the workflow endpoint behavior with a test key.
5. Add Supabase environment variables only after auth and persistence are implemented.

The current route does not authenticate callers. Restrict deployment to a private preview until route authorization, rate limits, and usage budgets are implemented.

## Local production build

```sh
npm run build
npm start
```
