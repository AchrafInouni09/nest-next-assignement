# Mini Auth App

A small example app demonstrating a Next.js frontend and a NestJS backend with a simple dev authentication flow.

This README explains how to run the project locally and with Docker, the expected API routes, and quick manual tests.

## Quick Start (Docker)

- Build and start both services with Docker Compose:

docker-compose up --build

- Frontend will be available at: `http://localhost:3000`
- Backend will be available at: `http://localhost:3001`

## Local Development (no Docker)

- Backend

```bash
cd backend
npm install


npm run build
npm run start:dev
```

- Frontend

```bash
cd frontend
npm install

npm run dev
```

## Environment Variables

- Root `.env` and `frontend/.env.local` are used in development. Key variables:
	- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:3001`)
	- `BETTERAUTH_API_KEY`, `BETTERAUTH_SECRET` — optional for real BetterAuth integration
	- `PORT` — backend port (default: `3001`)

## API Routes (backend)

- `GET /health` — simple health check (returns `{ ok: true }`).
- `POST /auth/signup` — create a local dev user and set an HttpOnly `dev_session` cookie.
	- Request JSON: `{ "email": "...", "name": "...", "password": "..." }`.
- `POST /auth/login` — verify credentials and set `dev_session` cookie.
	- Request JSON: `{ "email": "...", "password": "..." }`.
- `POST /auth/logout` — clear the `dev_session` cookie.
- `GET /secret` — protected route; returns `{ message: "This is a protected message for [User Name]" }` when authenticated.

See the backend controllers in `backend/src/auth` and `backend/src/secret` for implementation details.

## Manual Testing (curl)

- Sign up (creates cookie in `cookies.txt`):

```bash
curl -v -X POST http://localhost:3001/auth/signup \
	-H "Content-Type: application/json" \
	-d '{"email":"test@example.com","name":"Test","password":"pass"}' \
	-c cookies.txt
```

- Login (stores cookie):

```bash
curl -v -X POST http://localhost:3001/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"test@example.com","password":"pass"}' \
	-c cookies.txt
```

- Access protected secret using the cookie jar:

```bash
curl -v http://localhost:3001/secret -b cookies.txt
```

- Logout:

```bash
curl -v -X POST http://localhost:3001/auth/logout -b cookies.txt
```

## Browser Test

1. Open `http://localhost:3000`.
2. Use the **Sign Up** page to create an account (or the **Login** page if you've already created one).
3. Visit `/dashboard` — it should display the protected message fetched from the backend.

## Troubleshooting

- Frontend hitting `http://localhost:3000` for API calls (404):
	- Make sure `NEXT_PUBLIC_API_URL` is set to `http://localhost:3001` in `frontend/.env.local` or root `.env`, then restart Next dev server.

- Cookies / CORS issues:
	- Backend enables CORS with credentials and uses `cookie-parser`. Ensure fetches use `credentials: 'include'` (frontend already does).

- Check logs:

```bash
docker-compose logs backend
cd backend && npm run start:dev
```

## Files to Inspect

- Frontend: `frontend/pages/*`, `frontend/components/AuthForm.tsx`, `frontend/.env.local`
- Backend: `backend/src/auth/*`, `backend/src/secret/*`, `backend/src/main.ts`

---

If you want, I can add a small `/auth/status` endpoint that returns the authenticated user JSON (useful for the frontend session probe).

