# Project Status — KIB Coding Challenge (TMDB Restful CRUD App)

> Project progress tracker. Updated at each milestone.

Last updated: 2026-06-25

---

## Stack at a glance

| Concern | Choice |
|---------|--------|
| Framework | NestJS (Node.js, TypeScript) |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (`@nestjs/cache-manager` + `cache-manager-redis-yet`) |
| Auth | JWT (register/login, `passport-jwt`, `bcrypt`) |
| HTTP client | `@nestjs/axios` (TMDB) |
| Data sync | Seed CLI (`npm run seed`) + `@nestjs/schedule` cron |
| Docs | Swagger (`@nestjs/swagger`) at `/api/docs` |
| Tests | Jest + Supertest, coverage ≥ 85% |
| Hardening | `helmet`, `@nestjs/throttler` |
| Run | `docker-compose up` → http://localhost:8080 |

---

## Repository layout

```
kib-movies-api/
├── src/
├── prisma/
├── test/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── PROJECT_STATUS.md   <- this file
└── README.md
```

---

## Challenge requirement checklist

- [x] Consumes TMDB API
- [x] Stores & syncs data in PostgreSQL (scalable / future-proof)
- [x] Listing endpoint
- [x] Search
- [x] Pagination
- [x] Filtering (incl. by genre)
- [ ] Caching mechanism (Redis) to reduce DB calls
- [x] Rate a movie + average rating shown in movies list
- [x] Add to watchlist / mark as favorite
- [ ] Runs via `docker-compose up`
- [ ] Accessible at http://localhost:8080
- [ ] API documentation (Swagger + README)
- [ ] Unit tests ≥ 85% coverage
- [ ] Markdown docs (structure, setup, prerequisites)
- [ ] Clean branch/commit workflow
- [ ] Production ready (helmet, throttler, env validation, graceful shutdown)
- [ ] SOLID / KISS / YAGNI / DRY
- [ ] (Nice-to-have) Secure APIs — JWT auth

---

## Phase tracker

Each phase = one feature branch off `develop`, conventional commits, merged via PR.

- [x] **Phase 0 — Repo & workflow setup** — `git init`, `main`+`develop`, public remote, `.gitignore`, `chore: init`
- [x] **Phase 1 — NestJS scaffold + config** — `@nestjs/config`, **port 8080**, global `ValidationPipe` — `feature/base`
- [x] **Phase 2 — Docker & docker-compose** — Dockerfile (multi-stage), app/postgres/redis, healthchecks, migrate on start — `feature/docker`
- [x] **Phase 3 — Prisma schema** — models + first migration + `PrismaService` — `feature/prisma`
- [x] **Phase 4 — TMDB integration + sync** — `TmdbService`, `npm run seed` (idempotent upsert), cron sync — `tmdb`
- [x] **Phase 5 — Movies module** — `GET /movies` (pagination/search/genre filter + avg rating), `GET /movies/:id` — `movies`
- [x] **Phase 6 — Ratings** — `POST /movies/:id/rating`, recompute avg, invalidate cache — `ratings`
- [x] **Phase 7 — Watchlist / favorites** — add/list/delete by `type` — `watchlist`
- [ ] **Phase 8 — Redis caching** — cache list + averages, invalidate on writes, `CacheInterceptor` — `feature/caching`
- [ ] **Phase 9 — JWT auth** — register/login, `JwtStrategy`+guard, protect rate/watchlist — `feature/auth`
- [ ] **Phase 10 — API docs** — Swagger at `/api/docs`, README endpoints — `feature/swagger-docs`
- [ ] **Phase 11 — Testing ≥ 85%** — service/controller/guard units + e2e, coverage thresholds — `feature/tests`
- [ ] **Phase 12 — Production hardening + docs** — helmet, throttler, env validation, logging, README — `feature/hardening`
- [ ] **Phase 13 — Release** — merge to `main`, tag, fresh-clone sanity check

---

## Data model (first cut)

| Model | Key fields | Notes |
|-------|-----------|-------|
| `Movie` | tmdbId (unique), title, overview, releaseDate, posterPath, popularity, voteAverage, voteCount | From TMDB |
| `Genre` | tmdbId (unique), name | From TMDB |
| `MovieGenre` | movieId, genreId | M:N join (genre filter) |
| `User` | email (unique), passwordHash, name | JWT auth |
| `Rating` | userId, movieId, value (1–10), unique(userId, movieId) | App rating; avg aggregated from here |
| `WatchlistItem` | userId, movieId, type (WATCHLIST\|FAVORITE), unique(userId, movieId, type) | One model, both features |

---

## Verification (do before submitting)

1. [ ] `cp .env.example .env` + set `TMDB_API_KEY`
2. [ ] `docker-compose up --build` starts app + postgres + redis, migrations run
3. [ ] `npm run seed` populates DB
4. [ ] http://localhost:8080/api/docs loads Swagger
5. [ ] `GET /movies?page=1&limit=10&genre=Action&search=batman` → paginated, filtered, with `averageRating`
6. [ ] Register/login → rate a movie → average updates (cache invalidated)
7. [ ] Add to watchlist/favorite → list it back
8. [ ] `npm run test:cov` → ≥ 85%

---

## Milestone log

- 2026-06-25 — Project planned. Stack locked: NestJS + Prisma/Postgres + Redis + JWT, seed+cron sync.
- 2026-06-25 — Phase 3 done: Prisma 7 schema, migrations, PrismaService (pg driver adapter).
- 2026-06-25 — Phase 4 done: TMDB client + idempotent sync, `npm run seed`, daily cron. Seeded 60 movies / 19 genres.
- 2026-06-25 — Phase 5 done: `GET /movies` with pagination, search, genre filter, averageRating, and `GET /movies/:id`.
- 2026-06-25 — Phase 6 done: `POST /movies/:id/rating` (upsert, 1–10), recomputes average shown in movies endpoints.
- 2026-06-25 — Phase 7 done: watchlist/favorites add, list (filter by type), delete via `WatchlistItem` model.
```