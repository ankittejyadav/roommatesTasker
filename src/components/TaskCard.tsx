'use client';

import { Task, MemberProfile } from '@/lib/types';
import {
    getCurrentAssigneeUid,
    getUrgency,
    formatRelativeDate,
    getMemberByUid,
    getUpcomingRotation,
    Urgency,
} from '@/lib/schedule';
import styles from './TaskCard.module.css';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    members: MemberProfile[];
    currentUserUid: string;
    isAdmin: boolean;
    onComplete: (taskId: string) => void;
    onOverride: (taskId: string) => void;
    onRemind?: (taskId: string) => Promise<void>;
}

const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

export default function TaskCard({
    task, members, currentUserUid, isAdmin, onComplete, onOverride, onRemind
}: TaskCardProps) {
    const [completing, setCompleting] = useState(false);
    const [reminding, setReminding] = useState(false);
    const [showRotation, setShowRotation] = useState(false);

    const assigneeUid = getCurrentAssigneeUid(task);
    const assignee = assigneeUid ? getMemberByUid(members, assigneeUid) : null;
    const urgency = getUrgency(task);
    const relativeDate = formatRelativeDate(task);
    const isMyTurn = assigneeUid === currentUserUid;
    const upcoming = getUpcomingRotation(task, members, 6);
    const isSwapped = task.temporarySwap !== null;

    const canComplete = isMyTurn; // only assigned user can mark done

    const handleComplete = () => {
        if (!canComplete) return;
        setCompleting(true);
        setTimeout(() => {
            onComplete(task.id);
            setCompleting(false);
        }, 800);
    };

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    const getAvatarColor = (uid: string) => {
        const idx = members.findIndex((m) => m.uid === uid);
        return AVATAR_COLORS[idx % AVATAR_COLORS.length];
    };

    const urgencyConfig: Record<Urgency, { label: string; cls: string }> = {
        overdue: { label: 'Overdue', cls: styles.urgOverdue },
        'due-today': { label: 'Today', cls: styles.urgToday },
        upcoming: { label: 'Upcoming', cls: styles.urgUpcoming },
        manual: { label: 'When Needed', cls: styles.urgManual },
    };
    const urg = urgencyConfig[urgency];

    return (
        <div className={`${styles.card} ${isMyTurn ? styles.myTurn : ''} ${completing ? styles.celebrating : ''}`}>
            <div className={`${styles.accent} ${urg.cls}`} />

            {/* Header */}
            <div className={styles.header}>
                <span className={styles.icon}>{task.icon}</span>
                <div className={styles.titleGroup}>
                    <h3 className={styles.name}>{task.name}</h3>
                    <div className={styles.meta}>
                        <span className={`${styles.badge} ${urg.cls}`}>{urg.label}</span>
                        {isMyTurn && <span className={styles.yourTurn}>Your Turn</span>}
                        {isSwapped && <span className={styles.swapBadge}>Swapped</span>}
                    </div>
                </div>
            </div>

            {/* Assignee row */}
            <div className={styles.assigneeRow}>
                <div className={styles.assigneeLeft}>
                    {assignee?.photoURL ? (
                        <div className="avatar">
                            <img src={assignee.photoURL} alt={assignee.displayName} referrerPolicy="no-referrer" />
                        </div>
                    ) : (
                        <div className="avatar" style={{ backgroundColor: assigneeUid ? getAvatarColor(assigneeUid) : '#444' }}>
                            {assignee ? getInitials(assignee.displayName) : '?'}
                        </div>
                    )}
                    <div className={styles.assigneeText}>
                        <span className={styles.assigneeLabel}>Assigned to</span>
                        <span className={styles.assigneeName}>{assignee?.displayName || 'No one'}</span>
                    </div>
                </div>
                <span className={styles.dueTag}>📅 {relativeDate}</span>
            </div>

            {/* Rotation toggle */}
            <button className={styles.rotToggle} onClick={() => setShowRotation(!showRotation)}>
                <span className={styles.rotAvatars}>
                    {upcoming.slice(0, 4).map((r, i) => {
                        const m = getMemberByUid(members, r.uid);
                        return (
                            <span
                                key={i}
                                className={styles.miniAv}
                                style={{ backgroundColor: getAvatarColor(r.uid), zIndex: 4 - i }}
                            >
                                {m?.photoURL ? (
                                    <img src={m.photoURL} alt={r.name} referrerPolicy="no-referrer" />
                                ) : getInitials(r.name)}
                            </span>
                        );
                    })}
                </span>
                <span className={styles.rotLabel}>{showRotation ? 'Hide' : 'Rotation'}</span>
                <span className={styles.chevron}>{showRotation ? '▴' : '▾'}</span>
            </button>

            {showRotation && (
                <div className={styles.rotList}>
                    {upcoming.map((r, i) => (
                        <div key={i} className={`${styles.rotItem} ${i === 0 ? styles.rotCurrent : ''} ${r.uid === currentUserUid ? styles.rotMe : ''}`}>
                            <span className={styles.rotNum}>{i === 0 ? '→' : i + 1}</span>
                            <span className={styles.rotDot} style={{ backgroundColor: getAvatarColor(r.uid) }} />
                            <span className={styles.rotName}>{r.name}</span>
                            {r.tentativeDate && (
                                <span className={styles.rotDate}>
                                    {new Date(r.tentativeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={`${styles.doneBtn} ${completing ? styles.doneBtnActive : ''} ${!canComplete ? styles.doneBtnDisabled : ''}`}
                    onClick={handleComplete}
                    disabled={!canComplete || completing}
                    title={!canComplete ? `Only ${assignee?.displayName || 'the assigned person'} can mark this done` : ''}
                >
                    {completing ? '✅ Done!' : canComplete ? '✓ Mark Done' : `🔒 ${assignee?.displayName || 'Assigned'}'s task`}
                </button>
                {onRemind && !isMyTurn && (urgency === 'manual' || urgency === 'due-today' || urgency === 'overdue') && (
                    <button
                        className="btnGhost"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
                        onClick={async () => {
                            setReminding(true);
                            await onRemind(task.id);
                            setTimeout(() => setReminding(false), 2000);
                        }}
                        disabled={task.manualReminderSent || reminding}
                    >
                        {task.manualReminderSent ? 'Reminded Today' : reminding ? 'Sent!' : '🔔 Remind'}
                    </button>
                )}
                {isAdmin && (
                    <button className={styles.overrideBtn} onClick={() => onOverride(task.id)} title="Swap assignee (one-time)">
                        🔄
                    </button>
                )}
            </div>

            {task.lastCompletedBy && (
                <p className={styles.lastDone}>
                    Last done by <strong>{task.lastCompletedBy}</strong>
                </p>
            )}
        </div>
    );
}
