# KIB Movies API

A production-ready RESTful CRUD API that consumes the [TMDB](https://www.themoviedb.org/) API, syncs movies & genres into PostgreSQL, and exposes endpoints for listing, search, pagination, genre filtering, rating, and watchlists/favorites — with Redis caching and JWT auth.

Built with **NestJS**, **PostgreSQL (Prisma 7)**, and **Redis**.

> Progress & roadmap: see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose (the only requirement to run it)
- A free [TMDB](https://www.themoviedb.org/) account → Settings → API → **API Read Access Token (v4)**
- For local (non-Docker) development: Node.js 20+

## Quick start

```bash
cp .env.example .env          # set TMDB_API_TOKEN (v4 read token) + JWT_SECRET
docker compose up --build     # app + postgres + redis; migrations run on boot
```

The API is then available at **http://localhost:8080** (root redirects to the docs).

Seed the database with TMDB data (genres + popular movies):

```bash
docker compose exec app node dist/seed     # or: npm run seed (locally)
```

> `docker compose` (v2) is the modern CLI. The legacy `docker-compose` (hyphen) works identically if you have it.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | – | HTTP port (default `8080`) |
| `DATABASE_URL` | ✓ | Postgres connection string |
| `REDIS_URL` | ✓ | Redis connection string |
| `TMDB_BASE_URL` | ✓ | TMDB API base (`https://api.themoviedb.org/3`) |
| `TMDB_API_TOKEN` | ✓ | TMDB v4 Read Access Token (Bearer) |
| `TMDB_API_KEY` | – | TMDB v3 key (optional) |
| `JWT_SECRET` | ✓ | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | – | Token lifetime (default `1d`) |
| `ADMIN_EMAILS` | – | Comma-separated emails granted the `ADMIN` role on register/login |

Validated on boot via Joi — the app refuses to start if a required var is missing.

## API documentation

Interactive Swagger UI: **http://localhost:8080/api/docs** (OpenAPI JSON at `/api/docs-json`).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | – | Register, returns a JWT |
| `POST` | `/api/auth/login` | – | Login, returns a JWT |
| `GET` | `/api/movies` | – | List movies — `?page`, `?limit`, `?search`, `?genre` |
| `GET` | `/api/movies/:id` | – | Movie detail with `averageRating` |
| `POST` | `/api/movies/:id/rating` | Bearer | Rate a movie (1–10) |
| `POST` | `/api/watchlist` | Bearer | Add to watchlist/favorites (`type`) |
| `GET` | `/api/watchlist` | Bearer | List your items — `?type` |
| `DELETE` | `/api/watchlist/:id` | Bearer | Remove an item |
| `POST` | `/api/admin/sync` | Bearer (ADMIN) | Trigger a full TMDB sync on demand |

Authenticated routes expect an `Authorization: Bearer <token>` header.

### Roles & the admin endpoint

Users have a role (`USER` by default). To grant `ADMIN`, list the email in
`ADMIN_EMAILS` (comma-separated) **before** that user registers/logs in — the
role is assigned from the allowlist and embedded in the JWT, then enforced by a
`RolesGuard`. Only `ADMIN`s can call `POST /api/admin/sync`. The seed command and
the daily cron are unchanged; the admin endpoint is just an on-demand trigger.

## Project structure

```
src/
├── auth/         JWT auth — strategy, guards (JWT + roles), @Roles decorator
├── admin/        Admin-only endpoints (ADMIN-gated TMDB sync trigger)
├── movies/       Movie listing/search/filter + average rating
├── ratings/      Rate a movie (guarded)
├── watchlist/    Watchlist & favorites (guarded)
├── tmdb/         TMDB HTTP client + sync service (seed + daily cron)
├── prisma/       Global PrismaService (pg driver adapter)
├── generated/    Generated Prisma client (gitignored)
├── app.module.ts Wiring: config validation, cache, throttler, schedule
├── main.ts       Bootstrap: helmet, validation, Swagger, /api prefix
└── seed.ts       Standalone seed entrypoint
prisma/           schema.prisma + migrations
```

## Architecture notes

- **Sync:** `TmdbService` fetches genres + popular movies; `SyncService` upserts them idempotently (by `tmdbId`) — safe to run on the daily cron or on demand.
- **Caching:** movie reads are cached in Redis (`@nestjs/cache-manager` + `@keyv/redis`) and invalidated whenever a rating or a sync changes the data.
- **Average rating** is computed from the app's own `Rating` rows (not TMDB's vote average) and surfaced in both list and detail responses.
- **Auth & roles:** passwords hashed with bcrypt; JWT guards protect rating and watchlist; the acting user is taken from the token, not the request body. Role-based access (`USER`/`ADMIN`) gates the admin sync endpoint via a `RolesGuard`.
- **Hardening:** `helmet` security headers, global rate limiting (`@nestjs/throttler`), env validation, and graceful shutdown hooks.

## Scripts

- `npm run start:dev` — local dev with watch
- `npm run build` — compile to `dist/`
- `npm run seed` — build + populate DB from TMDB
- `npm run test` / `npm run test:cov` — unit tests + coverage
- `npm run lint` — ESLint

## Tests

```bash
npm run test:cov
```

Unit tests cover services, controllers, and the JWT strategy — 100% statements/lines/functions.
