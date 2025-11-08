#!/bin/sh
set -eu

cd /app

if [ -f "apps/api/prisma/schema.prisma" ]; then
  echo "Running Prisma migrations..."
  pnpm --filter api prisma:deploy
fi

echo "Starting API server..."
exec pnpm --filter api start
