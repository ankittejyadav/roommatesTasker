# 📋 Current Application Specification & Inventory

This document provides a comprehensive inventory of all features, pages, components, data models, and backend services currently present in the **Roommate Tasker** repository prior to stripping down and minimalizing the application.

---

## 🏛️ Repository & Monorepo Overview

The workspace is configured as a `pnpm` monorepo containing frontend artifacts, backend services, and shared libraries:

- **Frontend Application (`artifacts/roommate-tasker`):** Svelte 5 + Vite PWA frontend using Cloud Firestore for real-time state and Firebase Auth.
- **Backend API Server (`artifacts/api-server`):** Express + TypeScript backend using `firebase-admin` for FCM push notification dispatching and scheduled cron reminders.
- **Mockup Sandbox (`artifacts/mockup-sandbox`):** Sandbox application / scratch workspace.
- **Shared Libraries (`lib/`):**
  - `@workspace/api-spec`: OpenAPI specifications and generated client bindings.
  - `@workspace/api-zod`: Shared Zod validation schemas.
  - `@workspace/api-client-react`: React query/fetch API bindings (unused by Svelte app).
  - `@workspace/db`: Drizzle ORM + PostgreSQL schema & migrations (currently unused; primary storage is Firestore).

---

## 📱 Frontend Application Pages (`src/pages/`)

1. **Dashboard (`Dashboard.svelte`)**
   - Displays chore tasks split into "My Turn", "Upcoming", and "Completed/Manual".
   - Chore status indicators (Urgent/Overdue, Due Today, Upcoming).
   - "Mark Done" and "Remind" action buttons per chore.
   - Quick house stats, invite code display, and temporary swap warnings.

2. **Login / Auth (`Login.svelte`)**
   - User Sign In and Sign Up using Firebase Auth (Email/Password).
   - Household creation (creating new house document + generating invite code).
   - Quick option to join an existing house via invite code.

3. **Join House (`Join.svelte`)**
   - Dedicated flow for searching and joining a household using a 6-character invite code.

4. **Personal Tasks (`Personal.svelte`)**
   - Private personal task/to-do list for individual roommates.
   - Adding, toggling, and deleting private personal task items.

5. **Shared Shopping List (`Shopping.svelte`)**
   - Household shared grocery/shopping list.
   - Item creation, quantity tracking, category filtering, checking off items, and clearing completed items.

6. **House Chat (`Chat.svelte`)**
   - Real-time room messaging / household chat board.
   - Text messaging, image attachments, reactions/emojis, and message timestamping.

7. **History Log (`History.svelte`)**
   - Complete historical audit log of all completed chores across the household.
   - Filtering by roommate or task type.

8. **House Admin (`Admin.svelte`)**
   - Admin control panel for managing members and house configurations.
   - Add/edit/delete chores, modify assignee rotation orders, assign admin privileges, remove members, and re-generate invite codes.
   - Manual override capabilities for chore assignments (`OverrideModal.svelte`).

9. **Settings & Profile (`Settings.svelte`)**
   - User profile settings (display name, avatar/emoji selection).
   - Push notification permission toggle and FCM token registration.
   - Household exit / leave house controls.

10. **Feedback & Bug Reporting (`Feedback.svelte`)**
    - Household feedback board / feature request / bug submission form.

---

## 🧩 Components & Services Summary

### Components (`src/components/` & `src/lib/components/`)
- `BottomNav.svelte`: Global tab bar navigation (Dashboard, Personal, Shopping, Chat, Settings).
- `TaskCard.svelte`: Chore representation card with rotation status, countdown, and completion triggers.
- `OverrideModal.svelte`: Admin modal for overriding task assignees or swapping turns.

### Core Frontend Services (`src/lib/`)
- `firestore.ts`: Real-time Firestore subscriptions (`onSnapshot`), transaction operations for task completion, house updates, shopping list mutations, and chat messages.
- `auth.ts`: Authentication state listener (`onAuthStateChanged`), login, signup, and signout functions.
- `schedule.ts`: Task rotation logic, upcoming assignee predictions, and overdue calculations.
- `notifications.ts`: FCM web push permission requesting and token synchronization with Firestore.

---

## 💾 Backend API Endpoints (`artifacts/api-server/src/routes/`)

- `POST /api/notifications/trigger`: Accepts task notification requests and uses `firebase-admin` to send push notifications to user device tokens.
- `GET/POST /api/notifications/cron-reminders`: Endpoint intended for Vercel Cron jobs to daily inspect overdue tasks and notify assignees.

---

## 🔍 Bloat Analysis & Simplification Targets

The application currently carries excess features and unused infrastructure beyond the core objective of **Roommate Chore Management**:

1. **Secondary/Feature Bloat:**
   - **House Chat (`Chat.svelte`)**: High complexity, image uploads, reactions; usually redundant with standard messaging apps (WhatsApp/iMessage).
   - **Feedback Board (`Feedback.svelte`)**: In-app feedback system unnecessary for a lean chore app.
   - **Personal Tasks (`Personal.svelte`)**: Dilutes focus away from shared roommate chore management.
   - **Shopping List (`Shopping.svelte`)**: Can be simplified or stripped if focus is strictly on chore rotations.

2. **Database & Monorepo Bloat:**
   - **Unused Drizzle/PostgreSQL (`lib/db`)**: Boilerplate code that is completely bypassed in favor of Firestore.
   - **React API Client (`lib/api-client-react`)**: React wrapper library in a Svelte-focused codebase.
   - **Mockup Sandbox (`artifacts/mockup-sandbox`)**: Development clutter.

3. **Core Essential Retainers (Proposed Minimal Scope):**
   - Core Authentication & Household Join/Create.
   - Task Dashboard with Smart Rotation & Mark Done.
   - Task Management / Admin Controls.
   - User Settings & Push Notification triggers.
