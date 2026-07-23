# 🎯 TurnSync Specification (Minimal Neon Architecture)

This document outlines the target architecture for **TurnSync** (`turnsync.vercel.app`), focusing purely on multi-user chore rotation tracking backed by **Neon PostgreSQL**, **Drizzle ORM**, and **Native Google OAuth**.

---

## 🎯 Minimal Product Vision

Focus strictly on core group task/chore orchestration:
1. **Google OAuth & Group Onboarding**: Native Google Sign-In, create group, join group via 6-character invite code.
2. **Task Dashboard**: View current assignee turn, mark chores done, advance rotation queue.
3. **Group Admin**: Add/edit/delete tasks, adjust member rotation sequence, manage group settings.
4. **History Log**: Simple audit trail of completed chores.

---

## ✂️ Removed Firebase & Bloat Features

- ❌ **Firebase & Push Notifications**: Completely removed in favor of Neon PostgreSQL (`@neondatabase/serverless` + Drizzle ORM).
- ❌ **House Chat / Shopping List / Feedback**: Stripped to keep app lightweight.
- ❌ **House Terminology**: All references renamed to **Group** (`groups`, `group_members`).

---

## 💾 Neon PostgreSQL Schema

- `users`: `id`, `google_id`, `email`, `display_name`, `avatar_url`, `created_at`
- `groups`: `id`, `name`, `invite_code`, `admin_user_id`, `created_at`
- `group_members`: `group_id`, `user_id`, `joined_at`
- `tasks`: `id`, `group_id`, `name`, `icon`, `frequency_days`, `rotation_order`, `current_index`, `last_completed_date`, `last_completed_by_user_id`, `created_at`
- `task_history`: `id`, `task_id`, `group_id`, `completed_by_user_id`, `completed_at`

---

## 📦 Migration Script

The ETL script [scripts/migrate-firestore-to-neon.ts](file:///C:/Users/ankit.yadav2/Documents/roommatesTasker/scripts/migrate-firestore-to-neon.ts) is ready to migrate existing Firestore house documents directly into Neon PostgreSQL tables.

