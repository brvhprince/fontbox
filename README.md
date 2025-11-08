# Fontbox

Fontbox is a monorepo for managing font collections that combines a Next.js dashboard with an Express-based API, PostgreSQL persistence, Redis caching, and pluggable storage drivers. The repository is orchestrated with Turborepo and PNPM so the web, API, and shared packages can be developed and deployed together.

## Architecture overview

```mermaid
flowchart TD
    Browser((Browser)) --> Web["Next.js web app<br/>(apps/web)"]
    Web -->|REST & cookies| API["Express API<br/>(apps/api)"]
    API --> Prisma[(PostgreSQL via Prisma)]
    API --> Redis[(Redis cache)]
    API --> Storage{{Storage drivers<br/>Local / S3}}
    subgraph Shared packages
      UI[UI component library<br/>(packages/ui)]
      Config[Build & styling config<br/>(packages/config)]
    end
    Web <--> UI
    Web <--> Config
    API --> Preview[Canvas preview service]
    Preview --> Storage
```

A deeper discussion of module boundaries, data flow, and shared libraries is available in [`docs/architecture.md`](docs/architecture.md).

## Prerequisites

- Node.js 20 (the workflow uses Node 20 as the baseline runtime).
- PNPM 8.15 (enabled via Corepack in scripts and the CI pipeline).
- PostgreSQL 16 and Redis 7 (either local services or provided by Docker Compose).
- Optional: AWS credentials if you plan to use the S3 storage driver.

## Local setup

1. **Install dependencies**
   ```bash
   corepack enable
   pnpm install
   ```
2. **Provision environment variables**
   ```bash
   cp .env.example .env
   ```
   Adjust secrets (JWT keys, database URLs, etc.) to match your environment. All runtime configuration is validated through the schema in `apps/api/src/config/env.ts`.
3. **Prepare the database**
   ```bash
   pnpm --filter api prisma migrate dev
   pnpm --filter api prisma:seed
   ```
   The seed script populates demo data such as users, tags, categories, and projects so the dashboard renders meaningful content out of the box.
4. **Start the development servers**
   ```bash
   pnpm dev
   ```
   Turborepo runs the API (`apps/api`) and web (`apps/web`) apps concurrently using each package's `dev` script.

### Running with Docker Compose

A production-like stack can be spun up with the Compose file under `docker/compose.yml`. It provisions PostgreSQL, Redis, the API, the web app, and a shared `/storage` volume for uploaded fonts and previews.

```bash
cd docker
docker compose up --build
```

The Compose file exposes the API on port 4000 and the web UI on port 3000 while persisting state in named Docker volumes.

## Storage driver guide

Fontbox supports both a local filesystem driver and an S3-backed driver via the storage abstraction in `apps/api/src/storage`.

- **Local driver** (`STORAGE_DRIVER=local`): Files are written relative to `STORAGE_DIR` (defaults to `uploads` inside the repo) and are served under the `/storage` route. Ensure the configured directory exists and is writable when running locally or in CI.
- **S3 driver** (`STORAGE_DRIVER=s3`): Requires `S3_BUCKET` and `S3_REGION`, with optional credentials for non-instance roles. Objects are stored using the bucket's public URL and can generate signed download URLs.

Switch drivers by updating the `.env` file or environment variables before starting the API. The helper in `apps/api/src/storage/index.ts` reads the `STORAGE_DRIVER` flag once per process and instantiates the appropriate implementation.

When running the API outside Docker, create and chmod a `/storage` mount (or adjust `STORAGE_DIR`) so uploads succeed, mirroring the CI workflow.

## Environment variables

| Variable | Description | Default / Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode for the API server. | `development` |
| `PORT` | API port binding. | `3001` (overridden to 4000 in `.env.example`.) |
| `DATABASE_URL` | Prisma connection string for PostgreSQL. | `postgresql://fontbox:fontbox@localhost:5432/fontbox?schema=public` |
| `REDIS_URL` | Redis connection URI used for caching and sessions. | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets for issuing access and refresh tokens. | Populate with secure values. |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Lifetimes for issued tokens. | `15m` / `30d` |
| `BCRYPT_SALT_ROUNDS` | Cost factor for password hashing. | `12` |
| `WEB_ORIGIN` | Allowed origin for CORS and cookies. | `http://localhost:3000` |
| `SESSION_COOKIE_NAME` / `REFRESH_COOKIE_NAME` | Cookie names for session handling. | `fontbox_session` / `fontbox_refresh` |
| `COOKIE_DOMAIN` / `COOKIE_SECURE` | Cookie scoping and transport security flags. | Empty / `false` |
| `STORAGE_DRIVER` | Selects `local` or `s3` storage. | `local` |
| `STORAGE_DIR` | Root directory for the local storage driver. | `storage` |
| `S3_*` | Bucket, region, and credentials for S3 storage. | Empty in local `.env`. |
| `WEB_PORT`, `WEB_NODE_ENV`, `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL` | Next.js runtime configuration for the web app. | Provided in `.env.example`. |

The complete list (with validation rules) lives in `apps/api/src/config/env.ts`.

## Testing

- **Linting:** `pnpm lint`
- **Type checks:** `pnpm typecheck`
- **Unit tests:** `pnpm test` (runs Vitest across workspaces, with API tests exercising Prisma and Redis logic).
- **Integration / Playwright:** `pnpm dlx playwright test` after installing browsers with `pnpm dlx playwright install --with-deps`. The CI pipeline caches browser binaries and Prisma artifacts so subsequent runs start quickly.
- **End-to-end API smoke tests:** `pnpm e2e` (delegates to Vitest to execute the API integration suite).

Ensure PostgreSQL, Redis, and the `/storage` directory are available before running integration suites—the CI workflow demonstrates the required setup sequence.

## Troubleshooting

- **Playwright missing browsers:** Re-run `pnpm dlx playwright install --with-deps` (or remove the cache at `~/.cache/ms-playwright`) before executing tests.
- **Prisma client mismatch:** Regenerate the client after dependency updates with `pnpm --filter api prisma generate` to refresh cached binaries.
- **File permission errors:** Confirm the directory referenced by `STORAGE_DIR` exists and is writable; the default driver writes under `apps/uploads` when running locally and `/storage` in containers.
- **Stale Redis cache data:** Flush Redis (`redis-cli FLUSHALL`) when testing cache-invalidation logic because the API aggressively caches font listings.

More operational notes (including CI caching strategy and environment bootstrapping) are captured in [`docs/ci.md`](docs/ci.md).

## Contributing

1. Fork and clone the repository.
2. Create a feature branch and commit changes with descriptive messages.
3. Run the lint, type-check, build, and test commands before opening a PR.
4. Submit the pull request with context about the change and screenshots for UI updates when applicable.

The monorepo uses Turborepo task pipelines defined in `turbo.json`, so commands automatically respect package dependency ordering.

## License

Fontbox is distributed under the GNU Affero General Public License v3.0. See [`LICENSE`](LICENSE) for the full text.
