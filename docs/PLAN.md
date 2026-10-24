# Product plan

Goal: turn the AI SQL Assistant into a deployed, secure, measurable product that works as a strong portfolio/CV project.

We work through the phases in order. Each task has a **Done when** line; tick the box only when that's true. Small commits per task.

**Current state (2026-10-24):** monorepo with `make dev`; NL→SQL with AST validation and read-only execution; external Postgres connections work and read all schemas; real errors shown in the UI. No auth, no tests, no CI, not deployed.

---

## Phase 0 — Foundation (1–2 days)

So every later change is checked automatically.

- [ ] **Commit the external-DB fixes** (all schemas, real errors, no fake fallback data).
  Done when: committed on `main`.
- [ ] **Fix existing lint and type errors** — 8 ESLint errors in `pg-qualified-alias-rewrite.service.ts` / `query-validation.service.ts`, 1 type error in `sql-code-block.tsx` (`variant="outline"`).
  Done when: `npm run lint` and `npm run typecheck` pass.
- [ ] **Add Vitest to the backend** with first tests for the SQL validator: allowed SELECTs, and a list of attacks it must reject (`DELETE`, `SELECT … INTO`, multi-statement, `pg_sleep`, writable CTEs).
  Done when: `npm test` runs and passes.
- [ ] **GitHub Actions CI** — typecheck, lint, test on every push/PR, with a Postgres service container.
  Done when: green check on GitHub.

## Phase 1 — Security for a public deploy (week 1)

Nothing goes public before this phase is done.

- [ ] **User accounts** — `users` table migration; sign up / log in / log out; passwords hashed with argon2; session as JWT in an httpOnly cookie.
  Done when: API routes except `/health` and auth routes return 401 without a session.
- [ ] **Login UI** in the web app; redirect to login when the session is missing/expired.
  Done when: full flow works in the browser.
- [ ] **Block private-network targets** (SSRF guard) — resolve the database host and reject loopback, private, link-local and cloud-metadata addresses. `ALLOW_PRIVATE_DB_HOSTS=true` for local dev.
  Done when: tests cover `127.0.0.1`, `10.x`, `169.254.169.254`, `localhost`, and a hostname resolving to a private IP.
- [ ] **Saved connections** — `connections` table per user; URLs encrypted at rest (AES-256-GCM, key from env); requests send a connection id, never the raw URL after saving. UI: list / add / delete / test connection, plus a "use a read-only role" hint.
  Done when: connections survive refresh and the URL is never returned to the browser after saving.
- [ ] **Per-user rate limits and audit log** — limit `/query` and `/execute` per user; log who ran what SQL against which connection (no passwords).
  Done when: limits enforced in tests; audit rows written.

## Phase 2 — AI accuracy (week 2)

This phase produces the numbers for the CV.

- [ ] **Demo database** — load Pagila (Postgres sample DB: films, customers, rentals, payments) via a migration/script for dev and CI.
  Done when: `make dev` has it available.
- [ ] **Evaluation harness** — 50 questions with reference SQL against Pagila; script runs each through `/query`, executes both, and compares result sets. Reports: % valid SQL, % runs without error, % correct result.
  Done when: `npm run eval` prints a score table and saves results to a file.
- [ ] **Baseline** — run the eval with the current setup; record the numbers in this file.
  Done when: baseline table filled in below.
- [ ] **Foreign keys in the schema** — introspect FK relationships and include them in the prompt so the model knows how tables join.
  Done when: eval re-run; result recorded.
- [ ] **Self-correction retry** — when generated SQL fails validation or execution, send the error back to the model and retry once (max 2 attempts).
  Done when: eval re-run; result recorded.
- [ ] **Configurable model/provider** — pick the hosted model for production (cost vs accuracy from the eval).
  Done when: decision recorded below.

| Setup | Valid SQL | Runs | Correct |
|---|---|---|---|
| Baseline (llama3.2, no FKs, no retry) | | | |
| + foreign keys | | | |
| + retry loop | | | |
| Production model | | | |

## Phase 3 — Deploy (week 3)

- [ ] **Production builds** — backend Dockerfile; web production build; env validation fails fast on missing secrets.
  Done when: both run locally from production builds.
- [ ] **Hosting** — web, API, managed Postgres for app data (users, connections, audit).
  Done when: public URL works end to end over HTTPS.
- [ ] **Read-only demo database** — hosted Pagila with a read-only role; "Try with demo database" button that needs no setup.
  Done when: a new visitor can sign up and get a result in under a minute.
- [ ] **Monitoring** — error tracking (e.g. Sentry) and uptime check on `/health`.
  Done when: a thrown test error shows up in the dashboard.

## Phase 4 — Showcase (2–3 days)

- [ ] **README rewrite** — live demo link, 30-second GIF, architecture flowchart, "Security model" section, "Design decisions" section, eval results table, `make dev` quick start.
- [ ] **CV entry** — final bullets using real eval numbers (draft below).
- [ ] **Short write-up** (optional) — blog post or LinkedIn post on the safety pipeline or the eval results.

Draft CV entry (update numbers after Phase 2):

> **AI SQL Assistant** — Natural language → PostgreSQL analytics · [live demo] · [GitHub]
> *TypeScript, Fastify, Next.js, PostgreSQL, Turborepo, Docker, LLMs*
> - Built a full-stack NL→SQL assistant that generates, validates and executes queries against any PostgreSQL database, including user-supplied connections.
> - Designed a multi-layer safety pipeline: AST-based statement allow-listing, read-only transactions, statement timeouts, SSRF protection and encrypted credential storage.
> - Scaled schema handling to 290+ table databases with relevance-based schema selection to fit small-model context limits.
> - Raised query accuracy from X% to Y% on a 50-question benchmark using foreign-key-aware prompts and an error-feedback retry loop.

## Phase 5 — Extra features (optional, pick 1–2)

- [ ] Auto charts from result rows
- [ ] `EXPLAIN` cost warning before running expensive queries
- [ ] Shareable query links
- [ ] Plain-English explanation of any SQL

---

## Decisions

Recommended defaults; change here if we decide otherwise.

| Decision | Recommendation | Status |
|---|---|---|
| Auth | Own implementation (argon2 + JWT cookie) — shows more on a CV than a hosted auth service | open |
| Hosting | Vercel (web) + Railway or Fly.io (API + Postgres) | open |
| Production LLM | Decide from Phase 2 eval results (cost vs accuracy) | open |
| Demo database | Pagila | open |
