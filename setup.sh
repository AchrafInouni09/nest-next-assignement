#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
echo "[setup] root=$ROOT_DIR"

echo "[setup] Starting services needed (Postgres)"
docker compose up -d db

echo "[setup] Waiting for Postgres on localhost:5432..."
ready=false
for i in {1..30}; do
  if (</dev/tcp/127.0.0.1/5432) >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if [ "$ready" != true ]; then
  echo "[setup] Warning: Postgres did not become available on localhost:5432 after 30s"
fi

echo "[setup] Frontend: install deps, generate Prisma client, push schema"
cd "$ROOT_DIR/frontend"

export DATABASE_URL="postgresql://user:password@localhost:5432/appdb"
echo "[setup] exported DATABASE_URL=$DATABASE_URL"
npm install --no-audit --no-fund
npx prisma generate

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "[setup] Applying migrations (frontend)"
  DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
else
  echo "[setup] No migrations found, running prisma db push (frontend)"
  DATABASE_URL="$DATABASE_URL" npx prisma db push
fi

echo "[setup] Backend: ensure schema available, install deps, generate Prisma client"
mkdir -p "$ROOT_DIR/backend/prisma"
cp "$ROOT_DIR/frontend/prisma/schema.prisma" "$ROOT_DIR/backend/prisma/schema.prisma"
cd "$ROOT_DIR/backend"
npm install --no-audit --no-fund || true

DATABASE_URL="$DATABASE_URL" npx prisma generate --schema prisma/schema.prisma || true

echo "[setup] Building and starting services"
cd "$ROOT_DIR"
docker compose up -d --build

echo "[setup] Done. Frontend: http://localhost:3000 Backend: http://localhost:3001"
