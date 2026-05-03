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
- **Kind**: Svelte 5 + Vite web app (fully rewritten from React)
- **Port**: 18299, preview path `/`
- **Stack**: Svelte 5, `@sveltejs/vite-plugin-svelte` 5.x, Firebase client SDK (Auth + Firestore + FCM messaging), plain CSS (no Tailwind/Radix/Lucide)
- **Routing**: Custom store-based router (`src/lib/router.ts`) — `router` writable store + `navigate()` helper
- **Auth**: Svelte store-based (`src/lib/auth.ts`) — `user` + `authLoading` writables, `initAuth()`, `signInWithGoogle()`, `signOut()`
- **Entry**: `src/main.ts` → `mount(App, { target: ... })` (Svelte 5 API)
- **Design system**: `src/styles/global.css` (CSS vars, utility classes — no Tailwind)
- **Login design**: "Warm Home" — cream `#fdfbf7`, terracotta `#e07a5f`, DM Sans font
- **Pages**: `/` dashboard, `/login`, `/join`, `/admin`, `/settings`, `/history`, `/chat`, `/shopping`, `/personal`, `/feedback`
- **Components**: `BottomNav.svelte`, `TaskCard.svelte`, `OverrideModal.svelte`
- **Firebase env vars** (all stored as Replit secrets):
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_VAPID_KEY` (for FCM push notifications)
- **Backend lib files kept as-is**: `src/lib/firebase.ts`, `src/lib/firestore.ts`, `src/lib/types.ts`, `src/lib/schedule.ts`, `src/lib/notifications.ts`

### API Server (`artifacts/api-server`)
- **Kind**: Express API
- **Port**: 8080
- **Routes**:
  - `POST /api/notifications/trigger` — sends FCM push via firebase-admin; requires `Authorization: Bearer <NOTIFY_SECRET>` in production
  - `GET /api/cron/reminders` — sends overdue task reminders to all houses; requires `Authorization: Bearer <CRON_SECRET>` in production
- **Firebase env vars**: `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string), `VITE_FIREBASE_PROJECT_ID`

## Deployment Checklist

Before deploying to production, ensure the following secrets are configured in Replit:

### Required Firebase secrets (frontend + SW)
| Secret | Description |
|--------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `yourapp.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `yourapp.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID (numeric) |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_VAPID_KEY` | Web push VAPID key (from Firebase Console → Cloud Messaging) |

### Required server-side secrets
| Secret | Description |
|--------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full JSON string of a Firebase service account key |
| `NOTIFY_SECRET` | Shared secret to authorize `POST /api/notifications/trigger` |
| `CRON_SECRET` | Shared secret to authorize `GET /api/cron/reminders` |

### Required Firebase Console setup
1. **Authorized Domains**: Go to [Firebase Console](https://console.firebase.google.com) → Project `roommatestasker` → Authentication → Settings → Authorized Domains and add **both** of the following:
   - Dev domain: `97e938ed-e754-4e19-a780-69aa5c859f82-00-gljeal1uselc-n8d5r2g9.kirk.replit.dev`
   - Production domain: add after first deploy (shown in Replit's Publish panel as the `.replit.app` URL)
   
   Without these entries Google Sign-In will be blocked with an `auth/unauthorized-domain` error.
2. **Service Worker**: `public/firebase-messaging-sw.js` is generated automatically at build/dev time from `src/firebase-messaging-sw.template.js` — do not edit the generated file directly.
