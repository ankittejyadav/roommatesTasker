'use client';

import { Task, MemberProfile } from '@/lib/types';
import styles from './OverrideModal.module.css';

interface Props {
    task: Task;
    members: MemberProfile[];
    onSwap: (swapWithUid: string) => void;
    onClose: () => void;
}

export default function OverrideModal({ task, members, onSwap, onClose }: Props) {
    const currentUid = task.temporarySwap
        ? task.temporarySwap.swappedUid
        : task.rotation[task.currentIndex % task.rotation.length];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Swap Assignee</h3>
                    <p className={styles.subtitle}>This only affects the current turn. The regular rotation stays the same.</p>
                </div>
                <div className={styles.list}>
                    {members
                        .filter((m) => m.uid !== currentUid)
                        .map((m) => (
                            <button
                                key={m.uid}
                                className={styles.memberBtn}
                                onClick={() => onSwap(m.uid)}
                            >
                                <div className={styles.memberAvatar}>
                                    {m.photoURL ? (
                                        <img src={m.photoURL} alt={m.displayName} referrerPolicy="no-referrer" />
                                    ) : (
                                        m.displayName[0].toUpperCase()
                                    )}
                                </div>
                                <span className={styles.memberName}>{m.displayName}</span>
                                <span className={styles.arrow}>→</span>
                            </button>
                        ))}
                </div>
                <button className={styles.closeBtn} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}
