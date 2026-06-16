# Skivori Backend

REST API built with [NestJS](https://nestjs.com/) for an online casino platform. It serves a game catalog with search, a slot machine spin endpoint, and a currency conversion endpoint. See [`docs/instructions.md`](docs/instructions.md) for the original requirements.

## Tech stack

- **NestJS 11** + **TypeScript**
- **PostgreSQL** with **Prisma 7** (schema / migrations)
- **Redis** (via `cache-manager`) for response caching and idempotency
- **Swagger** for API documentation
- **Helmet**, **class-validator**, and **@nestjs/throttler** for hardening

## Requirements

- Node.js 20+
- Yarn
- Docker (for PostgreSQL and Redis)

## Getting started

1. Install dependencies:

```bash
yarn install
```

2. Create your environment file from the sample and fill in the values (at minimum `SECRET` and `EXCHANGE_RATE_API_KEY`):

```bash
cp .env.sample .env
```

3. Start PostgreSQL and Redis:

```bash
docker compose up -d
```

4. Apply database migrations:

```bash
yarn prisma:deploy
```

5. (Optional) Seed the database:

```bash
yarn prisma:seed
```

## Running the app

```bash
# development
yarn start

# watch mode
yarn start:dev

# production
yarn build && yarn start:prod
```

The server runs on `http://localhost:3333` by default (configurable via `HOST` / `PORT`).

### API documentation

- **Deployed:** [http://35.159.189.10:3333/docs](http://35.159.189.10:3333/docs)
- **Local:** `http://localhost:3333/docs`

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_HOST` / `POSTGRES_PORT` | yes | — | Used to build `DATABASE_URL` and by `docker compose` |
| `SECRET` | yes | — | Bearer token for API auth (`openssl rand -base64 32`) |
| `EXCHANGE_RATE_API_KEY` | yes | — | Key for [exchangerate-api.com](https://www.exchangerate-api.com/docs/standard-requests) |
| `HOST` | no | `localhost` | Bind host |
| `PORT` | no | `3333` | Bind port |
| `CORS_ORIGIN` | no | allow all | Comma-separated allowed origins (e.g. `http://localhost:5173`) |
| `CACHE_TTL` | no | `500` | Cache TTL in milliseconds |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_USERNAME` / `REDIS_PASSWORD` | no | `localhost` / `6379` | Redis connection |

## Authentication

All endpoints require a Bearer token matching the `SECRET` env variable:

```http
Authorization: Bearer <SECRET>
```

## API endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/games` | List all games. Optional `?search=` query filters by title or provider on the backend. |
| `GET` | `/games/:id` | Get a single game by id. |
| `GET` | `/games/exchange-currency` | Convert an amount from a base currency. Query: `?currency=EUR&amount=10` (`amount` is optional, defaults to `1`). Returns an array of `{ currency, amount }`. |
| `POST` | `/games/spin` | Spin the slot machine. Body: `{ "balance": number }`. Requires an `X-Idempotency-Key` header. Returns `{ reels, win, cost, coins }` with the updated balance. |

### Slot machine rules

Each spin costs `1` coin. Matches are valid only left-to-right:

- 3 cherries: 50 / 2 cherries: 40
- 3 apples: 20 / 2 apples: 10
- 3 bananas: 15 / 2 bananas: 5
- 3 lemons: 3

Only consecutive matches from reel 1 count (e.g. `apple, apple, cherry` wins; `apple, cherry, apple` does not). The balance is sent and returned in the request (not persisted), as required.

## Robustness & performance

- **Authentication**: global `AuthGuard` validates the `Authorization: Bearer` header.
- **Validation**: global `ValidationPipe` (`transform`, `whitelist`).
- **Security headers**: `helmet`.
- **Rate limiting**: `@nestjs/throttler` (10 requests / second).
- **Caching**: `CacheInterceptor` backed by Redis reduces repeated search hits.
- **Idempotency**: `IdempotencyInterceptor` on `/games/spin` prevents duplicate spins via the `X-Idempotency-Key` header.

## Database

The Prisma schema (`prisma/schema.prisma`) models the casino domain: users, games (unique `type`), the countries a game is available in, user favorite games, and a record of every spin (`GamePlay`) with the amount won/lost. Generated SQL lives under `prisma/migrations/`.

### Prisma commands

```bash
yarn prisma:studio          # open Prisma Studio
yarn prisma:generate        # generate the client
yarn prisma:deploy          # apply migrations
yarn prisma:migrate:new <name>           # create a new migration (with down script)
yarn prisma:migrate:new <name> --apply   # create the migration and apply it immediately
```

## Tests

```bash
yarn test          # unit tests
yarn test:e2e      # e2e tests
yarn test:cov      # coverage
```

## AI-assisted development

This project was built with [Cursor](https://cursor.com/) as the AI code editor/assistant. Beyond the chat modes below, **Tab autocomplete** was used throughout daily coding to speed up boilerplate, complete method bodies, and suggest imports. The workflow followed a consistent loop across three modes:

| Mode | Purpose |
| --- | --- |
| **Plan** | Break down requirements, compare approaches, and define what to implement before writing code |
| **Ask** | Clarify doubts about the codebase, challenge requirements, and review gaps without making changes |
| **Agent** | Execute planned tasks: implement features, apply fixes, and update configuration |

### Where AI was used

- **Autocomplete (Tab)** — inline code completion while writing services, DTOs, tests, and configuration files
- **Comments** — generating and refining inline comments (e.g. `[Q4 - Robustness]` / `[Q5 - Performance]` markers in controllers and bootstrap code)
- **Planning** — mapping each challenge question (Q1–Q7) to endpoints, middleware, and schema decisions before implementation
- **Q&A** — validating implementation against `docs/instructions.md`, reviewing missing items, and discussing trade-offs (e.g. idempotency, cache strategy, spin reward rules)
- **Implementation** — scaffolding modules, DTOs, guards, interceptors, Prisma schema, Docker setup, and incremental fixes
- **Tests** — generating and adjusting unit specs (`*.spec.ts`) and e2e coverage for game endpoints
- **Bug fixes** — diagnosing and correcting issues found during development (e.g. spin left-to-right logic, Redis connection in Docker, idempotency lock on failure, production entry path)
- **Commits** — drafting conventional commit messages and splitting the history into logical, atomic commits as the project evolved

All AI-generated code was reviewed and validated manually before being committed.
