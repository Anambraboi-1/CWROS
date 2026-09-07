# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

CWROS implements the "CUDA Waste Disposal Route Optimization System" specification in `README.md` — a route-optimization dashboard for waste collection: JWT-authenticated, role-gated (`ADMIN`/`DISPATCHER`/`OPERATOR`), backed by an 18-node/24-edge road graph over which an explicit Dijkstra shortest-path service runs, with full CRUD administration of nodes/edges/settings/users and an audited operation log.

The implementation deliberately deviates from the README's §4 "Authoritative Technology Stack" in two ways, both called out in a note at the top of the README:

- **Backend is TypeScript/Express, not Python/Flask.** The build environment had no Python or Docker installed, so the stack was adapted to Node (which was available and testable) while keeping every functional/architectural requirement from the spec (roles, graph model, Dijkstra semantics, API shape, DB schema) intact.
- **Database is SQLite via Node's built-in `node:sqlite`, not PostgreSQL.** This is explicitly sanctioned by README §4.3 ("SQLite may be used for local development where PostgreSQL is unavailable"). Redis is dropped entirely in favor of an in-memory refresh-token map, per README §4.4's "Redis... optional... core... must not depend on it."

Everything else — the graph data, the API contract, the role model, the ten frontend views — follows the README spec directly. When extending this project, treat the numbered README sections as the source of truth for behavior (endpoint shapes, node/edge data, role permissions), and treat this file as the source of truth for how that behavior is actually implemented in code.

## Commands

Root workspace (npm workspaces: `apps/api`, `apps/web`). No Docker or external database needed for local dev.

```
npm install                  # install all workspace deps
npm run dev                   # run API (tsx watch, :4000) + web (vite, :5173) concurrently
npm run build                  # tsc build for api, tsc+vite build for web
npm run typecheck               # tsc --noEmit --workspaces
npm test -w @cwros/api            # node:test — Dijkstra + routing service (incl. the README §9 acceptance case)
```

Copy `.env.example` to `.env` at the repo root (`JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `DATABASE_PATH`). The API loads it via a path resolved relative to its own source location, so it works regardless of which workspace directory a script is run from.

The SQLite database (`apps/api/data/cwros.db` by default) is created and seeded automatically on first boot — admin user (`admin@cwros.com` / `password`), the 18 nodes and 24 edges from README §7–8, and the default `system_settings` from README §19. Seeding is idempotent (`seedIfEmpty` in `apps/api/src/seed.ts`) and safe to run against an existing database.

An optional `docker-compose.yml` builds just the `api` service (Node, SQLite file on a volume) for a containerized deployment; it is not required for local development.

## Architecture

### Backend (`apps/api`)

Structured Express app (not the single-file style of an earlier MVP version of this repo — see git history if curious):

- `src/config.ts` — zod-validated env.
- `src/db.ts` — opens `node:sqlite`'s `DatabaseSync`, runs `src/schema.sql` on boot (idempotent `CREATE TABLE IF NOT EXISTS`). `schema.sql` must be copied into `dist/` on build (`scripts/copy-schema.mjs`, wired into the `build` script) since `tsc` won't do it for a non-`.ts` file.
- `src/seed.ts` — seeds the graph/admin/settings data described above.
- `src/lib/dijkstra.ts` — an explicit binary-heap Dijkstra (`TL`/`Predecessor`/`Visited`, mirroring README §10's named variables), not a library call.
- `src/services/routing.ts` — builds the graph from the `nodes`/`edges` tables, runs Dijkstra, computes travel time (§12) and cost (§13) from `system_settings`, and writes an `operation_logs` row + refreshes `system_metrics` on every call (this is the "operation" concept from §11/§17 — there is no separate simulated-execution endpoint).
- `src/refreshStore.ts` — in-memory refresh-token map, replacing Redis.
- `src/routes/*.ts` — one router per resource (`auth`, `nodes`, `edges`, `routes` for shortest-path, `dashboard`, `operations`, `settings`, `users`), mounted under `/api/v1` in `src/server.ts`. `settings` and `users` routes aren't in the README's explicit §20–25 API list but are required by the admin frontend views (§26) and are admin-gated the same way nodes/edges are.
- IDs are `TEXT` UUIDs generated in application code (`crypto.randomUUID()`), not `gen_random_uuid()` — there's no Postgres/pgcrypto to generate them.

### Frontend (`apps/web`)

React Router–based SPA (routing wasn't in README's frontend stack list but is required for the ten distinct views in §26):

- `src/lib/session.ts` — zustand auth store (token/user in `localStorage`).
- `src/lib/api.ts` — axios instance with a bearer-token interceptor.
- `src/components/Guards.tsx` — `RequireAuth`/`RequireGuest`/`RequireAdmin` route guards. Admin-only pages are both nav-hidden and route-guarded client-side, *and* independently role-checked server-side (`allow('ADMIN')` in the relevant routers) — don't rely on the frontend guard alone when adding admin-only behavior.
- `src/pages/*.tsx` — one page per README §26 view (Login, Dashboard, RouteOptimization, MapView, OperationHistory, NodeManagement, EdgeManagement, SystemSettings, UserManagement, NotFound), wired up in `src/App.tsx`.
- `MapView.tsx` uses `react-leaflet` against real OpenStreetMap tiles, plotting nodes fetched live from `/nodes` (not a hardcoded list) plus a decorative edge overlay from `/edges`.
- No Socket.IO/WebSocket client — the dashboard and other live-ish views poll via TanStack Query `refetchInterval`.
- Visual style is the existing hand-rolled dark "command center" theme in `src/styles.css` (no Tailwind) — extend that file's conventions for new components rather than introducing a second styling system.

## Conventions when extending

- New API env vars go in the zod `env` schema in `apps/api/src/config.ts` (fails fast on boot if misconfigured) and should be mirrored in the root `.env.example`.
- Request validation is zod schemas inline at the route, matching the existing files; the shared error handler in `server.ts` turns `ZodError` into a 400.
- Role checks go through the `allow(...roles)` middleware, never ad-hoc `req.identity.role === '...'` checks.
- Schema changes go in `apps/api/src/schema.sql` (idempotent `CREATE TABLE IF NOT EXISTS`/`CREATE INDEX IF NOT EXISTS`) — there's no migration tool, so a breaking change to an existing column means either a manual `ALTER TABLE` addition or documenting that `apps/api/data/` needs to be deleted and reseeded.
- `node:sqlite` is still an experimental Node API (logs an `ExperimentalWarning` on boot) — that warning is expected, not a bug.
