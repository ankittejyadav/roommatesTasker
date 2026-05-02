# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (unused by Roommate Tasker — uses Firebase/Firestore instead)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Roommate Tasker (`artifacts/roommate-tasker`)
- **Kind**: React + Vite web app
- **Port**: 18299, preview path `/`
- **Stack**: React 19, Wouter (routing), Firebase client SDK (Auth + Firestore + FCM messaging), CSS Modules
- **Pages**: `/` dashboard, `/login`, `/join`, `/admin`, `/settings`, `/history`, `/chat`, `/shopping`, `/personal`, `/feedback`
- **Firebase env vars** (all stored as Replit secrets):
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_VAPID_KEY` (for FCM push notifications)
- **Migrated from**: Vercel/Next.js (replaced `useRouter`/`next/navigation` → wouter, `next/link` → wouter Link, removed `'use client'` directives, `NEXT_PUBLIC_*` → `VITE_*`)

### API Server (`artifacts/api-server`)
- **Kind**: Express API
- **Port**: 8080
- **Routes**:
  - `POST /api/notifications/trigger` — sends FCM push via firebase-admin
  - `GET /api/cron/reminders` — sends overdue task reminders to all houses
- **Firebase env vars**: `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string), `FIREBASE_PROJECT_ID`
