import type { User, Group, Task, TaskHistory } from '../../lib/db/src/schema';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface GroupMemberInfo {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface TaskInfo {
  id: string;
  name: string;
  icon: string;
  frequencyDays: number | null;
  rotationOrder: string[]; // member userIds
  currentIndex: number;
  lastCompletedDate: string | null;
  lastCompletedByUserId: string | null;
  lastCompletedByName: string | null;
}

export interface GroupDetails {
  id: string;
  name: string;
  inviteCode: string;
  adminUserId: string;
  members: GroupMemberInfo[];
  tasks: TaskInfo[];
  createdAt: string;
}

export interface TaskHistoryItem {
  id: string;
  taskId: string;
  taskName: string;
  completedByUserId: string;
  completedByName: string;
  completedAt: string;
}
