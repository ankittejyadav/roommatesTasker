# TaskSync Architecture & Migration Log

This document aggregates all key engineering decisions, structural refactors, database schema transitions, and branding changes executed during the migration of the roommate chore tracking application.

---

## 1. Stack Transition: Firebase ➡️ Neon PostgreSQL & Drizzle ORM

### The Decision:
Replace Google Firebase (Firestore and Client-side SDKs) with a relational SQL database hosted on **Neon** using **Drizzle ORM** for schema definition, migrations, and query building.

### Rationale:
- Relational integrity was required to model groups, users, and tasks cleanly.
- Removing dependency on heavy client-side Firebase SDK libraries decreased the production JavaScript bundle size by over **150 KB**.
- Removed push notifications and FCM completely to strip out unnecessary background processes.

### Schema Design (`lib/db/src/schema/index.ts`):
- **`users`**: Stores authenticated profile records (`googleId`, `email`, `displayName`, `avatarUrl`).
- **`groups`**: Models unique households (`name`, `inviteCode`, `adminUserId`).
- **`group_members`**: Linking table associating users to groups (`joinedAt`).
- **`tasks`**: Tracks individual recurring chores, rotation orders, and current rotation queues.
- **`task_history`**: Immutable log entries capturing completions (`completedAt`).

---

## 2. Authentication: Direct Google Identity & JWT

### The Decision:
Migrate away from Firebase Auth. Use Google's modern Identity Services SDK (`gsi/client`) client-side, verified by the backend using JWT sessions.

### Key Details:
- **`ux_mode: 'redirect'`**: Configured the Google Sign-in button to authenticate in the same page tab to avoid multi-monitor popup scaling issues.
- **Client ID & JWT Storage**: Configured in `.env` (`VITE_GOOGLE_CLIENT_ID`, `JWT_SECRET`).
- **Storage Key**: Storage tokens saved locally under `tasksync_jwt_token`.

---

## 3. Brand Asset Consolidation: TurnSync ➡️ TaskSync

### The Decision:
Rename the application from **TurnSync** (formerly **Roommate Tasker**) to **TaskSync** across all metadata and pages, establishing a clean, unified icon asset.

### Branding Updates:
- Updated `<title>` and metadata in `index.html` and `public/manifest.json`.
- Designed a unified vector icon (`logo.svg`) featuring a interlocking circular sync loop.
- Compiled an identical pixel-perfect `logo.png` (512x512px) using `sharp` to serve as PWA icons and Apple Touch icons.
- Removed `favicon.svg` to avoid duplicate assets and set the browser icon to point directly to `logo.svg`.

---

## 4. Codebase Cleanup & Monorepo Flattening

### Structural Refactors:
- **Monorepo Flattening**: Moved Svelte 5 application source files out of deep directories directly to `/src`, `/public`, `index.html`, and `package.json` in the workspace root.
- **Port Restoration**: Changed the default Vite development server port to `5173`.
- **Legacy File Purge**: Deleted all template vectors (`next.svg`, `vercel.svg`, etc.), unused Firebase service workers (`firebase-messaging-sw.js`), and Replit configuration files (`.replit`, `.replitignore`, `.replit-artifact/`).
