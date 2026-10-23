# Reservet

[Español](README.md) · **English** · [Русский](README.ru.md)

Educational project: restaurant table and reservation management.

Start with the [junior guide](docs/en/JUNIOR_GUIDE.md),
[contribution guide](CONTRIBUTING.en.md) and [architecture conventions](docs/en/ARCHITECTURE.md).
Before submitting a change, run `npm run check` (lint, formatting, types, tests and build).

## Quick start (PowerShell)

Requirements: Node.js 22.13 or later, npm, and Docker Desktop running Linux containers.

```powershell
cd E:\reservet
npm ci
# First time only, if .env does not exist:
Copy-Item .env.example .env
npm run db:up
npm run db:migrate
npm run dev
```

Open **http://localhost:3000**. **Demo** mode works even without PostgreSQL and
lets you create, search, filter and change table statuses. Changes reset on reload.
Select **My local API** to test the junior's endpoints. This mode shows real errors
and never falls back to sample data. Login is a future exercise.

The interface supports **Spanish, English and Russian**. Use the header selector;
your preference is saved in the browser. Translations live in `public/i18n.js`.
User-entered names and the API contract are not translated.

In another terminal: `Invoke-RestMethod http://localhost:3000/health/db`.

Included: server, health checks, PostgreSQL Compose configuration, migration runner,
initial table schema and a connectable interface. Business endpoints remain exercises.
SQS is introduced in a later stage.

`npm run typecheck` checks types; `npm run build` compiles; `npm start` runs the
build; `npm run db:down` stops PostgreSQL while preserving data. Sample credentials
are for local development only. PostgreSQL is published on local port **5433**.
