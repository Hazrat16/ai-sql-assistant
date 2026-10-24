# AI SQL Assistant

Monorepo for the AI SQL Assistant: natural language → PostgreSQL, with a compile/validate step and a results UI.

## Layout

```
apps/
  backend/     Fastify API (NL→SQL, compile, execute, schema)   → see apps/backend/README.md
  web/         Next.js UI                                       → see apps/web/README.md
packages/
  shared/      API request/response types used by both apps
docker-compose.yml   Postgres 16 + Ollama for local development
```

npm workspaces manage dependencies (one `package-lock.json` at the root), and [Turborepo](https://turborepo.com) runs the tasks.

## Quick start

```bash
make dev
```

This installs dependencies and creates the `.env` files if they're missing, then starts Postgres and Ollama in Docker, pulls the Ollama model if it isn't already there, and runs the backend on :8000 and the web app on :3000. Press Ctrl+C to stop the apps and run `docker compose down`. Database and model volumes are kept between runs.

Run `make` on its own to list the other targets.

To do the same steps by hand:

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
npm run dev:deps      # Postgres + Ollama in Docker
npm run dev           # backend on :8000 and web on :3000
```

## Scripts (run from the repo root)

| Script | What it does |
| --- | --- |
| `npm run dev` | Start backend and web in watch mode |
| `npm run dev:backend` / `npm run dev:web` | Start only one app |
| `npm run build` | Build every package |
| `npm run typecheck` | `tsc --noEmit` in every package |
| `npm run lint` | ESLint in every package |
| `npm run dev:deps` / `npm run dev:deps:down` | Start / stop Docker services |
| `npm run db:migrate` | Apply SQL migrations from `apps/backend/db/migrations` |

To run any app script directly: `npm run <script> -w @ai-sql-assistant/backend` (or `@ai-sql-assistant/web`).

## Adding a dependency

```bash
npm install <pkg> -w @ai-sql-assistant/web
```

## History

This repo merges the earlier `ai-sql-assistant-backend` and `ai-sql-assistant-frontend` repositories, and keeps all their commits. `git log -- apps/backend` and `git log -- apps/web` show each app's original history.
