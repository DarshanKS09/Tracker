# Routine Tracker

A fast MVP for tracking a daily routine checklist with Supabase persistence and a weekly analytics dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Recharts

## 1. Create the Supabase table

Run this SQL in the Supabase SQL editor:

```sql
create extension if not exists "pgcrypto";

create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  task_name text not null,
  completed boolean not null default false,
  created_at timestamp not null default now()
);

create unique index if not exists routine_logs_date_task_name_key
  on public.routine_logs (date, task_name);
```

Recommended for a simple MVP without auth:

```sql
alter table public.routine_logs disable row level security;
```

If you want RLS enabled instead, create insert/select/update policies for your app before using it.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Install and run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Deploy to Vercel

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in Vercel.
4. Deploy.

## Notes

- Task toggles are written through `app/api/routine/route.ts`.
- The dashboard page is server-rendered and refreshed after each toggle.
- Weekly streak success is defined as `>= 80%` completion for a day.
