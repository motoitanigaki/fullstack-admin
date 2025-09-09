# fullstack-admin

Minimal full‑stack admin starter with Refine, Hono, Drizzle, and Postgres.

## Demo

https://bef927c2.fullstack-admin-client.pages.dev/

## Tech Stack

- Monorepo: pnpm Workspaces, TypeScript
- Frontend: Refine, shadcn/ui
- Backend: Hono, Drizzle ORM, Valibot
- Database: Postgres
- Tooling: Biome

## Quick Start

- Install: `pnpm install`
- Build: `pnpm build`
- DB: `docker compose up -d db`
- Migrate: `pnpm -F @packages/schema migrate`
- API: `pnpm -F @apps/api dev` (http://localhost:4000)
- Client: `pnpm -F @apps/client dev` (http://localhost:3000)

## Features

- REST API with shared schema/types
- Data table: sort, filter, paginate
- Forms with validation
- Sidebar navigation & breadcrumb

## Not Implemented

- Auth & RBAC
- Import/Export
- i18n
- Testing
- CI/CD
