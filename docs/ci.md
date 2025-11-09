# Continuous Integration

The CI pipeline defined in `.github/workflows/ci.yml` runs on pushes to `main` and all pull requests. It standardizes the developer workflow by installing dependencies with PNPM, restoring caches, and running the project tasks in distinct stages.

## Job topology

1. **Lint & Typecheck** – installs dependencies and runs `pnpm lint` followed by `pnpm typecheck` to enforce code quality gates before downstream jobs execute.
2. **Build** – depends on the quality checks and runs `pnpm build` to ensure every package compiles with the same configuration used in production.
3. **Unit & Playwright tests** – depends on the build job, provisions PostgreSQL and Redis service containers, prepares the `/storage` mount (mirroring production), installs Playwright browsers, generates Prisma clients, and executes `pnpm test` plus `pnpm dlx playwright test`.

## Caching strategy

- **PNPM store** – `actions/setup-node` is configured with `cache: 'pnpm'`, so the global PNPM store is automatically restored across jobs, accelerating installs.
- **Playwright browsers** – `~/.cache/ms-playwright` is cached with `actions/cache` to avoid re-downloading Chromium/WebKit/Firefox bundles on each run.
- **Prisma artifacts** – the generated client directories (`apps/api/node_modules/.prisma` and `node_modules/.prisma`) are cached, and the workflow re-runs `pnpm --filter api prisma generate` to ensure they stay in sync with the schema.

## Environment bootstrapping

- **Services** – Postgres 16 and Redis 7 containers are declared in the test job with health checks so integration tests can connect as soon as the services are ready.
- **Storage mount** – `/storage` is created and chmodded to be world-writable so the local storage driver can persist uploads in CI.
- **Playwright setup** – browsers are installed via `pnpm dlx playwright install --with-deps` before executing the Playwright test suite.
- **Test execution** – both `pnpm test` and the Playwright run inherit `DATABASE_URL`, `REDIS_URL`, and `STORAGE_DIR` environment variables pointing at the provisioned services.

This structure keeps the pipeline fast (through caching) while matching the dependencies required for real-world usage of the API and web application.
