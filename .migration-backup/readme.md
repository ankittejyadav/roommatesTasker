# 🏠 Roommate Tasker

> A beautifully designed, real-time Progressive Web App (PWA) built to safely and automatically orchestrate household chore management. Features automatic schedule rotation, native mobile push notifications, and a sleek premium UI.

---

## ✨ Features

- **🔄 Smart Rotations:** Automatically cycles through roommates for recurring chores (e.g., Bathroom Cleaning), with support for one-off manual tasks (e.g., Taking out the Trash).
- **🔔 Native Push Notifications:** "Your turn!" reminders delivered straight to iOS and Android lock screens via Firebase Cloud Messaging.
- **✨ Premium UI/UX:** Glassmorphism, tailored color palettes, subtle micro-animations, and a fully custom dark-mode design system.
- **📱 Progressive Web App (PWA):** Installable directly to your phone's home screen, behaving exactly like a native app.
- **🛡️ Household Management:** Admins can manage the household, override task assignees, and generate secure invite codes for new roommates.
- **⏰ Automated Cron Jobs:** Vercel Cron Jobs run daily to check schedules and automatically ping roommates with overdue tasks.

## 🛠️ Tech Stack

**Frontend Framework:** Next.js 15 (App Router), React, TypeScript  
**Styling:** Custom Vanilla CSS Modules (Zero external UI libraries)  
**Database & Authentication:** Firebase Auth, Cloud Firestore  
**Push Notifications:** Firebase Cloud Messaging (FCM), Service Workers  
**Backend & Automation:** Next.js Serverless API Routes, Vercel Cron Jobs  
**Deployment:** Vercel  

---

## 📸 Showcase
*(To fully set up this repository, please replace the placeholder images below with actual screenshots of your application)*

| Dashboard Flow | Settings & Notifications |
| :---: | :---: |
| <img src="docs/placeholder_dashboard.png" width="300" alt="Dashboard" /> | <img src="docs/placeholder_settings.png" width="300" alt="Settings" /> |
| *Real-time task synchronization and fluid rotation queues.* | *Native push notification management and user profiles.* |

---

## ⚙️ Architecture & How It Works

1. **Authentication:** Users join a specific household via a secure 6-character invite code. Firebase Auth manages session state securely.
2. **Real-time Sync:** The dashboard uses Firestore real-time listeners (`onSnapshot`) so that when one roommate checks off a task, it instantly updates on everyone else's phone without a page refresh.
3. **PWA & Service Workers:** The app registers a dual service worker system. One manages caching for the PWA manifest, and `firebase-messaging-sw.js` listens in the background for incoming push payloads from Google.
4. **The Notification Pipeline:**
   - A roommate clicks **"Remind"** (or the **Vercel Cron Job** notices a task is overdue).
   - The Next.js API Route (`/api/notifications/trigger`) is securely called.
   - The Next.js backend uses the `firebase-admin` SDK to authenticate with Google's servers.
   - Google FCM routes the push notification directly to the specific roommate's device token.

---

## 🚀 Getting Started (Local Setup)

Want to run this project yourself? Follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/roommates-tasker.git
cd roommates-tasker
npm install
```

### 2. Firebase Setup
You will need to create a free [Firebase Project](https://console.firebase.google.com/).
1. Enable **Authentication** (Email/Password).
2. Enable **Firestore Database** (Start in production mode, update rules as needed).
3. Under Project Settings -> Cloud Messaging, generate a **Web Push Certificate (VAPID key)**.
4. Under Project Settings -> Service Accounts, generate a new private key and download the `.json` file.

### 3. Environment Variables
Create a `.env.local` file in the root directory and populate it with your Firebase credentials:

```ini
# Client-side Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-app"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# VAPID Key for Frontend Push Permissions
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"

# Admin SDK for Backend Push Triggering (Paste the whole JSON object, minified)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...}'

# Optional: Security for Vercel Cron Jobs
CRON_SECRET="your-secure-random-string"
```

### 4. Service Worker Configuration
Open `public/firebase-messaging-sw.js` and replace the placeholder keys in the `firebase.initializeApp()` block with your actual Firebase Client keys.

### 5. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📦 Deployment

The easiest way to deploy this application is via **Vercel**.

1. Connect your GitHub repository to Vercel.
2. In the Vercel Dashboard, go to **Settings > Environment Variables** and paste all the variables from your `.env.local` file.
3. Deploy! Next.js and Vercel will automatically read the `vercel.json` file to configure the Daily Reminder Cron Job.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
