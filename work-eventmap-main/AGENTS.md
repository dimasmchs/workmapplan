# Event Map

Keep changes focused on the request and follow existing project conventions.

## Layout

- `src/api/client.js`: the single backend client (Supabase). All data, auth and upload calls go through `api`.
- `supabase/migrations/001_init.sql`: database schema, row level security and storage setup.
- `src/pages/`: routed pages. `src/components/`: shared components (`ui/` is shadcn).

## Commands

- `npm run dev`, `npm run build`, `npm run lint`
