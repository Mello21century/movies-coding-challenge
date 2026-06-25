# KIB Movies API

A production-ready RESTful CRUD API that consumes the [TMDB](https://www.themoviedb.org/) API, syncs movies & genres into PostgreSQL, and exposes endpoints for listing, search, pagination, genre filtering, rating, and watchlists/favorites — with Redis caching and JWT auth.

Built with **NestJS**, **PostgreSQL (Prisma 7)**, and **Redis**.

> Progress & roadmap: see [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## Quick start

```bash
cp .env.example .env          # set TMDB_API_TOKEN (v4 read token) + JWT_SECRET
docker compose up --build     # app + postgres + redis; migrations run on boot
# → http://localhost:8080/api
```

Seed the database with TMDB data (genres + popular movies):

```bash
docker compose exec app node dist/seed     # or: npm run seed (locally)
```

## API documentation

Interactive Swagger UI: **http://localhost:8080/api/docs** (OpenAPI JSON at `/api/docs-json`).

### Endpoints

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

Authenticated routes expect an `Authorization: Bearer <token>` header.

## Tech & scripts

- `npm run start:dev` — local dev with watch
- `npm run build` — compile to `dist/`
- `npm run seed` — build + populate DB from TMDB
- `npm run test` / `npm run test:cov` — unit tests + coverage
- `npm run lint` — ESLint

Data refreshes automatically via a daily cron (`@nestjs/schedule`).
