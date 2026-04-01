# Routine Tracker

A production-ready MVP for tracking daily routines with MongoDB Atlas, Mongoose, and a responsive Next.js dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- Mongoose
- Recharts

## Environment Variables

Copy `.env.example` to `.env.local`.

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=routine-tracker
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

What each one does:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `MONGODB_DB_NAME`: the database name used by the app
- `NEXT_PUBLIC_APP_URL`: app base URL for local and production setup

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. In Network Access, allow your local IP for development.
4. For Vercel deployment, either allow all IPs with `0.0.0.0/0` or use a tighter production rule that matches your deployment approach.
5. Use the connection string in `MONGODB_URI`.

The app creates the `routinelogs` collection automatically on first write and uses a unique compound index for `{ date, taskName }`.

## Deploy To Vercel

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. In Vercel Project Settings -> Environment Variables, add:

```bash
MONGODB_URI=your-atlas-uri
MONGODB_DB_NAME=routine-tracker
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

4. Redeploy after adding the variables.

## Production Notes

- MongoDB connection settings are centralized in [lib/mongodb.ts](/c:/Users/darsh/OneDrive/Desktop/Tracker/lib/mongodb.ts)
- Environment validation is in [lib/env.ts](/c:/Users/darsh/OneDrive/Desktop/Tracker/lib/env.ts)
- Security headers and standalone output are configured in [next.config.ts](/c:/Users/darsh/OneDrive/Desktop/Tracker/next.config.ts)
- Task updates go through [app/api/routine/route.ts](/c:/Users/darsh/OneDrive/Desktop/Tracker/app/api/routine/route.ts)
- Weekly streak success is defined as `>= 80%` completion for a day

## Pre-Deploy Checklist

1. Set the three environment variables locally and in Vercel.
2. Make sure MongoDB Atlas network access allows your deployment.
3. Run `npm install`.
4. Run `npm run build`.
5. Deploy to Vercel.
