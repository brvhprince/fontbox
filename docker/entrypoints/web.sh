#!/bin/sh
set -eu

cd /app

echo "Starting web server..."
exec pnpm --filter @fontbox/web start -- --hostname 0.0.0.0 --port "${PORT:-3000}"
