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

- [ ] Consumes TMDB API
- [ ] Stores & syncs data in PostgreSQL (scalable / future-proof)
- [ ] Listing endpoint
- [ ] Search
- [ ] Pagination
- [ ] Filtering (incl. by genre)
- [ ] Caching mechanism (Redis) to reduce DB calls
- [ ] Rate a movie + average rating shown in movies list
- [ ] Add to watchlist / mark as favorite
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

- [ ] **Phase 0 — Repo & workflow setup** — `git init`, `main`+`develop`, public remote, `.gitignore`, `chore: init`
- [ ] **Phase 1 — NestJS scaffold + config** — `@nestjs/config`, **port 8080**, global `ValidationPipe` — `feature/scaffold`
- [ ] **Phase 2 — Docker & docker-compose** — Dockerfile (multi-stage), app/postgres/redis, healthchecks, migrate on start — `feature/docker`
- [ ] **Phase 3 — Prisma schema** — models + first migration + `PrismaService` — `feature/prisma-schema`
- [ ] **Phase 4 — TMDB integration + sync** — `TmdbService`, `npm run seed` (idempotent upsert), cron sync — `feature/tmdb-sync`
- [ ] **Phase 5 — Movies module** — `GET /movies` (pagination/search/genre filter + avg rating), `GET /movies/:id` — `feature/movies`
- [ ] **Phase 6 — Ratings** — `POST /movies/:id/rating`, recompute avg, invalidate cache — `feature/ratings`
- [ ] **Phase 7 — Watchlist / favorites** — add/list/delete by `type` — `feature/watchlist`
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
- Upcoming Milestones.
```