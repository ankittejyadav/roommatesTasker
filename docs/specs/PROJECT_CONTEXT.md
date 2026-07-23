# 📘 Project Specifications & Agent Context

This document merges and replaces legacy `replit.md` and `GEMINI.md` files to serve as the unified reference for project architecture, environment setup, and development instructions.

---

## 📖 Project Overview

**Roommate Tasker** is a streamlined real-time Progressive Web App (PWA) designed to automate household chore management. It features smart task rotations, native push notifications, and a dark-mode UI.

---

## 🏗️ Architecture & Stack

### Frontend App (`/src` & root)
- **Framework:** Svelte 5 + Vite (Port `5173`).
- **State & DB:** Firebase Auth + Cloud Firestore real-time listeners (`onSnapshot`).
- **Routing:** Store-based custom router (`src/lib/router.ts`).
- **Styling:** Vanilla CSS Modules / custom global design system (`src/styles/global.css`).
- **Pages:** `/` (Dashboard), `/login`, `/join`, `/history`, `/admin`, `/settings`.

### Backend API Server (`artifacts/api-server`)
- **Framework:** Express (TypeScript).
- **Function:** FCM push notification dispatching & Vercel daily cron reminder schedules.

---

## ⚙️ Environment Variables & Deployment

### Required Environment Variables (`.env` / `.env.local`)

```ini
# Client-side Firebase Config
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_VAPID_KEY="your-vapid-key"

# Backend Firebase Service Account (JSON string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Notification / Cron Authorization Secrets
NOTIFY_SECRET="shared-secret-key"
CRON_SECRET="shared-cron-secret-key"
```

---

## 🚀 Key Commands

- `pnpm dev` (or `npm run dev`) — Runs the main Svelte 5 app on `http://localhost:5173`
- `pnpm build` — Compiles production bundle to `dist/`
- `pnpm typecheck` — Type-checks project with TypeScript & `svelte-check`
- `pnpm --filter @workspace/api-server dev` — Runs the Express push notification backend
