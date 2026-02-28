# 🏗️ Technical Architecture

This document breaks down the underlying logic, data models, and system architecture of Roommate Tasker. It is intended for developers who want to fork, contribute, or deeply understand the codebase.

---

## 💾 Firestore Data Model

The entire application relies on a single root collection called `houses`. Every household has exactly one document in this collection, identified by a unique Google-generated UUID.

### The `HouseData` Document
```typescript
interface HouseData {
    name: string;           // "88 Gardner St Apt 33"
    inviteCode: string;     // Unique 6-character string (e.g., "X7Y9ZA")
    members: MemberProfile[];
    tasks: Task[];
}
```

By storing everything in a single document per household, we can attach one single `onSnapshot` real-time listener on the frontend. When *anything* changes (a new task, someone checking off a chore, someone joining), the entire React tree recalculates instantly without complex local state management.

### The `Task` Object
Tasks come in two flavors: **scheduled** (recurring) and **manual** (when needed).

```typescript
interface Task {
    id: string;
    name: string;                       // "Take Out Trash"
    icon: string;                       // "🗑️"
    frequencyDays: number | null;       // 7 = weekly. null = manual task.
    orderOfAssignees: string[];         // Array of user IDs determining rotation order
    currentAssigneeIndex: number;       // Tracks who is currently "up"
    lastCompletedDate: string | null;   // ISO String
    lastCompletedBy: string | null;     // Display Name
    manualReminderSent: boolean;        // Prevents spamming manual tasks
    temporarySwap: { ... } | null;      // Onetime admin overrides
}
```

---

## 🔄 The Rotation Algorithm

A core feature of the app is predicting "who is next" and displaying the upcoming rotation schedule.

This is calculated actively on the frontend inside `src/lib/schedule.ts`.
1. It takes the `orderOfAssignees` array and shifts it based on the `currentAssigneeIndex` so the active person is index `0`.
2. It projects future dates by taking the `lastCompletedDate` and repeatedly adding `frequencyDays`.
3. If a task is skipped or completed early, the rotation naturally adjusts its projection dates.

When a user clicks **"Mark Done"**, the application sends an atomic transaction to Firestore:
- `lastCompletedDate` is updated to exactly `now`.
- `lastCompletedBy` is logged.
- `currentAssigneeIndex` increments by 1 (looping back to 0 if it hits the end).
- `manualReminderSent` resets to `false`.

---

## 🔔 The Push Notification Pipeline

Firebase Cloud Messaging (FCM) is notoriously complex to implement in Next.js PWAs. We use a hybrid approach combining client-side Service Workers and server-side Vercel APIs.

### 1. The PWA Service Worker
We register `firebase-messaging-sw.js` in the public directory. This file sits quietly in the background of the user's OS. When it detects a push payload from Google, it triggers the native `self.registration.showNotification()` API to drop an OS-level banner, even if the browser is entirely closed.

### 2. Device Registration
When a user clicks "Enable Notifications", the frontend calls `firebase/messaging` using our Public VAPID Key. This returns a secure device token. We append this token to the user's `fcmTokens` array inside the `HouseData` document. (We allow up to 5 tokens per user, enabling them to receive pushes on both their phone and laptop).

### 3. Server-Side Triggering
Client applications cannot securely send push notifications to other users.
When a task is checked off (triggering a rotation), or a scheduled task is overdue, we fire a `POST` request to our Next.js API route (`/api/notifications/trigger`).

Because this route runs on Vercel's secure backend, it has access to the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable. It initializes the `firebase-admin` SDK, bypasses Firestore security restrictions, looks up the target user's device tokens, and dispatches the payload to Google FCM.

### 4. The Daily Cron Job
We configure a Vercel Cron Job in `vercel.json` to hit the `/api/cron/reminders` endpoint daily at 10:00 AM UTC.
This serverless function scans all households. For every scheduled task:
If `Task.frequencyDays` has elapsed since `Task.lastCompletedDate`, it fires a push notification to the current assignee. It also resets `manualReminderSent` for all manual tasks.

---

## 🎨 UI & Styling Strategy

The project intentionally avoids excessive frontend frameworks like Tailwind or Material UI to maintain absolute control over the aesthetic.

We use **Vanilla CSS Modules** (`.module.css`). Every component's CSS is locally scoped. We utilize CSS custom properties (variables) defined in `globals.css` to build an extremely cohesive Dark Mode design system, consisting of deep slate backgrounds (`#0d0d14`), subtle bordering (`#2a2a35`), and vibrant gradient accents.
