#!/usr/bin/env sh
set -e

echo "Starting container: running migrations (if DATABASE_URL provided) then starting app"

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set, attempting to run migrations"
  pnpm db:migrate || {
    echo "Migration failed; attempting db:push to apply schema instead"
    pnpm db:push || echo "db:push also failed; continuing to build/start anyway"
  }
else
  echo "DATABASE_URL not set; skipping migrations"
fi

echo "Building app..."
pnpm build || true

echo "Starting app..."
pnpm start
