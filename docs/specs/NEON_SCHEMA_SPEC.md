# 🗄️ Neon PostgreSQL & Drizzle ORM Schema Specification

This document defines the relational database schema for **Roommate Tasker** following the migration from Firestore to **Neon PostgreSQL** with **Drizzle ORM**.

---

## 🏛️ Schema Entity-Relationship (ER) Diagram

```
[ users ] 1 ──── N [ group_members ] N ──── 1 [ groups ]
                          │
                          └───── N [ tasks ] 1 ──── N [ task_history ]
```

---

## 📋 Justified Table Specifications

### 1. `users` Table
Stores registered user identities created via Google OAuth.
- **`id`** (`uuid`, Primary Key): Internal unique identifier for foreign key references across groups and tasks.
- **`google_id`** (`varchar(255)`, Unique, Not Null): Immutable Google subject ID returned during Google OAuth sign-in. Used for fast OAuth account lookup.
- **`email`** (`varchar(255)`, Not Null): User's primary email address.
- **`display_name`** (`varchar(255)`, Not Null): User's display name shown on task rotation cards and completion logs.
- **`avatar_url`** (`text`, Nullable): Google profile photo URL.
- **`created_at`** (`timestamp`, Default NOW): User account creation timestamp.

---

### 2. `groups` Table *(Renamed from `houses`)*
Stores group/household metadata.
- **`id`** (`uuid`, Primary Key): Unique group identifier.
- **`name`** (`varchar(255)`, Not Null): Name of the group (e.g. "88 Gardner St Apt 33").
- **`invite_code`** (`varchar(6)`, Unique, Not Null): 6-character alphanumeric code used by roommates to join the group.
- **`admin_user_id`** (`uuid`, FK -> `users.id`, Cascade Delete): Identifies the group creator/admin who has permissions to edit tasks and manage members.
- **`created_at`** (`timestamp`, Default NOW): Group creation timestamp.

---

### 3. `group_members` Table
Junction table tracking membership between users and groups.
- **`group_id`** (`uuid`, FK -> `groups.id`, Cascade Delete): Identifies the target group.
- **`user_id`** (`uuid`, FK -> `users.id`, Cascade Delete): Identifies the member user.
- **`joined_at`** (`timestamp`, Default NOW): Timestamp when the user joined the group.
- **Primary Key**: Composite `(group_id, user_id)` to guarantee a user cannot double-join the same group.

---

### 4. `tasks` Table
Manages chore rotation items and execution state.
- **`id`** (`uuid`, Primary Key): Unique task identifier.
- **`group_id`** (`uuid`, FK -> `groups.id`, Cascade Delete): Group context for the chore.
- **`name`** (`varchar(255)`, Not Null): Chore title (e.g. "Clean Bathroom").
- **`icon`** (`varchar(16)`, Default '📌'): Emoji/icon representation.
- **`frequency_days`** (`integer`, Nullable): Schedule cadence in days. Set to `NULL` for manual one-off tasks (e.g. "Take Out Trash").
- **`rotation_order`** (`jsonb`, Array of user UUIDs): Ordered array of user IDs defining the turn queue.
- **`current_index`** (`integer`, Default 0): Pointer tracking whose turn it is in `rotation_order`.
- **`last_completed_date`** (`timestamp`, Nullable): Exact timestamp when the chore was last marked done.
- **`last_completed_by_user_id`** (`uuid`, FK -> `users.id`, Set Null): User ID of the roommate who last completed the task.
- **`created_at`** (`timestamp`, Default NOW): Task creation timestamp.

---

### 5. `task_history` Table
Historical audit log of all completed chores.
- **`id`** (`uuid`, Primary Key): Unique log entry ID.
- **`task_id`** (`uuid`, FK -> `tasks.id`, Cascade Delete): Associated task ID.
- **`group_id`** (`uuid`, FK -> `groups.id`, Cascade Delete): Group context.
- **`completed_by_user_id`** (`uuid`, FK -> `users.id`, Cascade Delete): Roommate who completed the chore.
- **`completed_at`** (`timestamp`, Default NOW): Completion timestamp.
