# Routine Tracker

A fast MVP for tracking a daily routine checklist with MongoDB persistence and a weekly analytics dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- Mongoose
- Recharts

## 1. Create the MongoDB Atlas database

Create a MongoDB Atlas cluster, then create or use a database named `routine-tracker`.

The app will automatically create the `routinelogs` collection through Mongoose on first write, along with a unique compound index for `{ date, taskName }`.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your MongoDB Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/routine-tracker?retryWrites=true&w=majority
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
3. Add the same `MONGODB_URI` environment variable in Vercel.
4. Deploy.

## Notes

- Task toggles are written through `app/api/routine/route.ts`.
- Dashboard reads can be fetched through `app/api/routine/summary/route.ts`, and the page uses the same server-side data source.
- The dashboard page is server-rendered and refreshed after each toggle.
- Weekly streak success is defined as `>= 80%` completion for a day.
