import { db, usersTable, groupsTable, groupMembersTable, tasksTable, taskHistoryTable } from '../../lib/db/src';
import { eq, and, desc } from 'drizzle-orm';
import type { GroupDetails, TaskInfo, TaskHistoryItem } from './types';
import { getStoredToken, activeGroup } from './auth';

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function fetchActiveGroup(): Promise<GroupDetails | null> {
  try {
    const res = await fetch('/api/groups/current', { headers: authHeaders() });
    if (res.ok) {
      const group: GroupDetails = await res.json();
      activeGroup.set(group);
      return group;
    }
  } catch (err) {
    console.error('Fetch active group error:', err);
  }
  return null;
}

export async function createGroup(name: string): Promise<GroupDetails | null> {
  const res = await fetch('/api/groups/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    const group: GroupDetails = await res.json();
    activeGroup.set(group);
    return group;
  }
  return null;
}

export async function joinGroup(inviteCode: string): Promise<GroupDetails | null> {
  const res = await fetch('/api/groups/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ inviteCode })
  });
  if (res.ok) {
    const group: GroupDetails = await res.json();
    activeGroup.set(group);
    return group;
  }
  return null;
}

export async function markTaskDone(taskId: string): Promise<boolean> {
  const res = await fetch(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (res.ok) {
    await fetchActiveGroup();
    return true;
  }
  return false;
}

export async function fetchTaskHistory(): Promise<TaskHistoryItem[]> {
  const res = await fetch('/api/groups/history', { headers: authHeaders() });
  if (res.ok) {
    return await res.json();
  }
  return [];
}
