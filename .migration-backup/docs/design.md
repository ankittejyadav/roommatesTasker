# 📐 System Design & Rotation Logic

This document details the current implementation design of the Roommate Tasker application, highlighting the data structures and the dynamic rotation algorithm used for managing chores.

---

## 💾 Firestore Data Model

The application uses a **Single Document State** architecture. Each household is represented by one document in the `houses` collection. This allows real-time synchronization using a single `onSnapshot` listener on the frontend.

### Primary Interface: `HouseData`
```typescript
export interface HouseData {
  name: string;
  members: MemberProfile[];
  tasks: Task[];
  inviteCode: string;
  adminUid: string;
  createdAt: string; // ISO string
  feedback: FeedbackItem[];
  shoppingList: ShoppingItem[];
}
```

### Chore Object: `Task`
```typescript
export interface Task {
  id: string;
  name: string;
  icon: string;
  rotation: string[];          // Ordered array of user UIDs
  currentIndex: number;       // Position in the rotation array
  frequencyDays: number | null; // null = manual list (trash/shopping)
  lastCompletedDate: string | null;
  lastCompletedBy: string | null;
  history: TaskHistoryEntry[];
  temporarySwap: TemporarySwap | null; 
  manualReminderSent?: boolean;
}
```

---

## 🔄 Dynamic Rotation Algorithm

Unlike simple incrementing queues, the application uses a **Permanent Shift** strategy on task completion. This keeps the active assignee always predictable (usually index `0`) and guarantees skips or overrides are handled without breaking accountability.

### Standard state vs Shift
*   **Who is current**: Calculated using `rotation[currentIndex % rotation.length]`.
*   **Completion event**: Modifies the `rotation` array order and resets `currentIndex` to `0`.

### Reordering Rules (`completeTaskInFirestore`)

The system differentiates between who completed the task (`completedByUid`) and who was supposed to do it (`originalAssigneeUid`).

#### 1. Normal Completion (`completedByUid === originalAssigneeUid`)
If the assignee completes their own task:
- **Action**: The assignee is moved from their current slot to the **absolute end** of the array.
- **Example**: `[Alice, Bob, Charlie]` ➡️ `[Bob, Charlie, Alice]`

#### 2. Helper Completion (`completedByUid !== originalAssigneeUid`)
If another roommate helps and completes the task:
- **Action**: The **helper** is moved to the **absolute end** of the array. The original assignee stays at the **front** (index 0) to do the chore next time.
- **Example**: `[Alice, Bob, Charlie]` (Bob helps Alice) ➡️ `[Alice, Charlie, Bob]`

#### 3. Admin "On Behalf" Completion
When an Admin uses the high-level override, the triggering event attributes completion to the **assigned user** (treating it as if the assignee did it).
- **Behavior**: Uses **Rule 1** (Normal Completion) moving the assignee to the back of the line.

---

## 🎨 Component Design

### `TaskCard.tsx`
Handles displaying individual task state and executing completions.
*   **Permissioning**: `const canComplete = isMyTurn || isAdmin;`
    *   Allows Assigned user or Admin to submit actions.
*   **Smart Labels**:
    *   Assignee sees: `✓ Mark Done`
    *   Admin sees: `⚡ Admin Mark Done` (if guarding someone else's slot)

---

## 🔔 Reminders & Notifications
*   **Manual Trigger**: Overdue tasks trigger standard trigger pipelines.
*   **Safety logic**: Reset `manualReminderSent` to false upon advances to avoid double triggers.
