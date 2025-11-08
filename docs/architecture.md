# Architecture

## High-level layout

Fontbox is a PNPM/Turborepo monorepo that groups the API, web dashboard, and shared packages under a single workspace (`apps/*` and `packages/*`). The runtime consists of:

- **Next.js web app (`apps/web`)** – the user-facing dashboard built with the App Router, SWR, next-themes, and a shared component library.
- **Express API (`apps/api`)** – handles authentication, font ingestion, metadata management, and file delivery using controllers, services, and middleware modules.
- **Shared packages** – reusable UI primitives (`packages/ui`) and configuration presets (`packages/config`) consumed by both applications.

## Backend (apps/api)

The API is an Express application bootstrapped in `app.ts`, where security middleware, CORS, JSON parsing, and routers are mounted. Core capabilities are organized around routers under `src/routes` that delegate to service layers for business logic; for example, the font router exposes listing, upload, download, mutation, and duplicate detection endpoints backed by `fontService`.

Persistence is handled by Prisma (`prisma.ts`) against PostgreSQL, with Redis acting as a cache for expensive font list queries and session metadata. The API exposes a `/health` route that verifies both dependencies before declaring the service healthy, which is important for container orchestration and CI smoke checks. Authentication relies on JWT access/refresh tokens with cookie-based session management in `authController` and its associated services.

Font ingestion flows through `fontService`, which detects file formats, stores originals, generates preview images via the canvas-based preview service, and invalidates Redis caches to keep listings up to date. File persistence is abstracted behind the `StorageDriver` interface with local filesystem and S3 implementations selectable at runtime through environment variables.

## Frontend (apps/web)

The Next.js app uses the App Router with shared providers for theming, toast notifications, and SWR data fetching that points to the API base URL. Auth flows leverage server actions under `src/shared/auth`, while data hooks under `src/shared/api` consume the REST endpoints exposed by the API. Tailwind configuration and design tokens are imported from shared packages to ensure styling consistency across packages.

## Data flow

1. Users interact with the web app, which issues authenticated requests (bearing access tokens and cookies) to the Express API.
2. The API validates requests, persists or retrieves entities through Prisma, and manages Redis-backed caches for performance-sensitive queries.
3. Uploaded fonts are stored through the configured storage driver; preview PNGs are generated using the canvas helper before being stored alongside originals.
4. Docker Compose and CI pipelines provide PostgreSQL, Redis, and a shared `/storage` mount so the applications have consistent dependencies across environments.

This modular structure keeps the domain logic in the API, presentation in the web app, and cross-cutting styles/utilities in shared packages while enabling independent builds via Turborepo pipelines.
