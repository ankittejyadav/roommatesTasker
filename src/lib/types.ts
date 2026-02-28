// Roommate Tasker V2.1 — Data Types

export interface MemberProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  fcmTokens?: string[]; // Array of device tokens for push notifications
}

export interface TaskHistoryEntry {
  uid: string;
  name: string;
  date: string; // ISO string
}

export interface TemporarySwap {
  originalUid: string;
  swappedUid: string;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
  rotation: string[]; // ordered UIDs
  currentIndex: number;
  frequencyDays: number | null; // null = no schedule (trash)
  lastCompletedDate: string | null; // ISO string
  lastCompletedBy: string | null; // display name
  history: TaskHistoryEntry[];
  temporarySwap: TemporarySwap | null; // one-time override
  manualReminderSent?: boolean; // track if a manual reminder was sent today
}

export interface FeedbackItem {
  id: string;
  text: string;
  authorUid: string;
  authorName: string;
  status: 'new' | 'in-progress' | 'done';
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  text: string;
  addedByUid: string;
  addedByName: string;
  claimedByUid: string | null;
  claimedByName: string | null;
  completed: boolean;
  createdAt: string;
}

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

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'trash',
    name: 'Take Out Trash',
    icon: '🗑️',
    rotation: [],
    currentIndex: 0,
    frequencyDays: null,
    lastCompletedDate: null,
    lastCompletedBy: null,
    history: [],
    temporarySwap: null,
  },
  {
    id: 'bathroom',
    name: 'Clean Bathroom',
    icon: '🚿',
    rotation: [],
    currentIndex: 0,
    frequencyDays: 7,
    lastCompletedDate: null,
    lastCompletedBy: null,
    history: [],
    temporarySwap: null,
  },
];
