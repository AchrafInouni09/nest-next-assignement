# Next.js + Postgres + Better Auth 

Abstract
--------
This repository demonstrates a small full-stack setup where users sign up and sign in on a Next.js frontend. A session is stored in Postgres (via Prisma) and an independently deployed NestJS backend exposes a protected `/secret` endpoint. The frontend forwards the user's session cookie to the backend (through a local proxy endpoint) so the backend can validate the session and return a per-user secret message.

Architecture (high level)
-------------------------

Browser (user)
	• Visits frontend pages: `/signup`, `/signin`, `/dashboard`
	• Submits credentials → Frontend creates a `Session` record and sets an HttpOnly `session` cookie

Next.js Frontend (port 3000)
	• Pages + API routes
		- `POST /api/signup` and `POST /api/signin` — create users and sessions (Prisma)
		- `POST /api/signout` — deletes session cookie + server session
		- `GET /api/secret` — proxy that forwards the incoming cookie to the backend `/secret` endpoint
	• Server-side rendering reads the `session` cookie and loads the current user for pages such as `/dashboard`

NestJS Backend (port 3001)
	• Exposes `GET /secret` (protected)
	• Uses `BetterAuthGuard` to validate the incoming request by calling `betterAuth.api.getSession({ headers })` or falling back to a Prisma `Session` lookup

Postgres (container)
	• Stores `User` and `Session` tables (Prisma schema)

Flow diagram (simplified)

	[Browser]
		 |
		 | 1) POST /api/signin -> sets `session` cookie
		 v
	[Next.js Frontend] --(GET /api/secret forwards cookie)--> [NestJS Backend /secret]
																													 |
																													 v
																									Guard validates session (Prisma/BetterAuth)
																													 |
																													 v
																							 { message: "This is a protected message for [email]" }

Files of interest
-----------------
- `docker-compose.yml` — service definitions (db, frontend, backend)
- `frontend/prisma/schema.prisma` — Prisma schema for `User` and `Session`
- `frontend/lib/prisma.js` — Prisma client wrapper used by Next.js
- `frontend/lib/auth.js` — Better Auth initialization on the frontend
- `frontend/pages/api/secret.js` — proxy that forwards cookie to backend
- `frontend/pages/*` — `index`, `signin`, `signup`, `dashboard` pages
- `backend/src/auth.guard.ts` — `BetterAuthGuard` used to protect `/secret`
- `backend/src/app.controller.ts` — defines `GET /secret`

Quick start (dev)
-----------------
Note: the helper `./setup.sh` attempts to automate these steps. You can run it, or follow the manual steps below.

1) Ensure Docker is running.

2) Start only Postgres (so Prisma CLI can connect from host):

```bash
docker compose up -d db
```

3) Prepare the frontend (on your host):

```bash
cd frontend
npm install

npx prisma generate

npx prisma migrate dev --name init
```

4) Copy schema to backend and generate client there (setup script does this automatically):

```bash
mkdir -p ../backend/prisma
cp prisma/schema.prisma ../backend/prisma/schema.prisma
cd ../backend
npm install
npx prisma generate --schema prisma/schema.prisma
```

5) Build and start the full stack:

```bash
cd ..
docker compose up --build -d
```

6) Open http://localhost:3000 — sign up, sign in, then visit `/dashboard` to see the secret fetched from the backend.

Environment and secrets
-----------------------
- `BETTER_AUTH_SECRET` must be identical for frontend and backend.
- `DATABASE_URL` must point to the Postgres instance used by Prisma. The `setup.sh` script exports `DATABASE_URL` for host-side Prisma commands.

Troubleshooting
---------------
- Prisma CLI complains `Environment variable not found: DATABASE_URL`: export `DATABASE_URL` or run `npx prisma` from the service container where the env var is set.
- If the backend fails to build due to missing type declarations (TypeScript errors for `pg` or `cookie`), install the dev-type packages in `backend/package.json` (`@types/pg`, `@types/cookie`) and rebuild.
- If dashboard shows `Unauthorized` or cannot fetch the secret:
	- Ensure the browser is sending cookies (dashboard uses a same-origin proxy `/api/secret` so cookie forwarding works).
	- Confirm `BETTER_AUTH_SECRET` matches between frontend and backend and that the session cookie exists.

Commands for logs
-----------------
- Frontend logs: `docker compose logs -f frontend`
- Backend logs: `docker compose logs -f backend`
- Postgres logs: `docker compose logs -f db`

