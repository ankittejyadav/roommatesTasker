import { Task, MemberProfile } from './types';

/**
 * Get current assignee, respecting temporarySwap if set.
 */
export function getCurrentAssigneeUid(task: Task): string | null {
    if (task.rotation.length === 0) return null;

    // If there's a temporary swap, return the swapped user
    if (task.temporarySwap) {
        return task.temporarySwap.swappedUid;
    }

    return task.rotation[task.currentIndex % task.rotation.length];
}

export function getNextDueDate(
    lastCompleted: string | null,
    frequencyDays: number | null
): Date | null {
    if (frequencyDays === null) return null;
    if (!lastCompleted) return new Date();
    const last = new Date(lastCompleted);
    const next = new Date(last);
    next.setDate(next.getDate() + frequencyDays);
    return next;
}

export type Urgency = 'upcoming' | 'due-today' | 'overdue' | 'manual';

export function getUrgency(task: Task): Urgency {
    if (task.frequencyDays === null) return 'manual';
    const dueDate = getNextDueDate(task.lastCompletedDate, task.frequencyDays);
    if (!dueDate) return 'manual';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    const diffMs = due.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    return 'upcoming';
}

export function getDaysUntilDue(task: Task): number | null {
    if (task.frequencyDays === null) return null;
    const dueDate = getNextDueDate(task.lastCompletedDate, task.frequencyDays);
    if (!dueDate) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatRelativeDate(task: Task): string {
    if (task.frequencyDays === null) return 'When needed';
    const days = getDaysUntilDue(task);
    if (days === null) return 'When needed';
    if (days < -1) return `${Math.abs(days)} days overdue`;
    if (days === -1) return 'Yesterday';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
}

export function getMemberByUid(
    members: MemberProfile[],
    uid: string
): MemberProfile | undefined {
    return members.find((m) => m.uid === uid);
}

/**
 * Get upcoming rotation (ignores temporarySwap for schedule view).
 */
export function getUpcomingRotation(
    task: Task,
    members: MemberProfile[],
    count: number = 8
): { uid: string; name: string; tentativeDate: string | null }[] {
    if (task.rotation.length === 0) return [];

    const result = [];
    let currentDate = task.lastCompletedDate
        ? new Date(task.lastCompletedDate)
        : new Date();

    for (let i = 0; i < count; i++) {
        const idx = (task.currentIndex + i) % task.rotation.length;
        const uid = task.rotation[idx];
        const member = getMemberByUid(members, uid);

        let tentativeDate: string | null = null;
        if (task.frequencyDays !== null) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + task.frequencyDays * i);
            tentativeDate = date.toISOString();
        }

        result.push({
            uid,
            name: member?.displayName || 'Unknown',
            tentativeDate,
        });
    }

    return result;
}
