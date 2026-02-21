'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData, Task } from '@/lib/types';
import { findHouseByUser, subscribeToHouse } from '@/lib/firestore';
import { formatDate, getMemberByUid } from '@/lib/schedule';
import styles from './history.module.css';

const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterTask, setFilterTask] = useState<string>('all');

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        let unsub: (() => void) | null = null;
        const init = async () => {
            const house = await findHouseByUser(user.uid);
            if (!house) { router.push('/join'); return; }
            unsub = subscribeToHouse(house.id, (d) => { setData(d); setLoading(false); });
        };
        init();
        return () => { if (unsub) unsub(); };
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading history...</p></div>;
    }
    if (!data || !user) return null;

    const getAvatarColor = (uid: string) => {
        const idx = data.members.findIndex((m) => m.uid === uid);
        return AVATAR_COLORS[idx >= 0 ? idx % AVATAR_COLORS.length : 0];
    };

    interface HistoryRow {
        taskName: string;
        taskIcon: string;
        uid: string;
        name: string;
        date: string;
    }

    let allEntries: HistoryRow[] = [];
    data.tasks.forEach((task) => {
        if (filterTask !== 'all' && task.id !== filterTask) return;
        task.history.forEach((h) => {
            allEntries.push({
                taskName: task.name,
                taskIcon: task.icon,
                uid: h.uid,
                name: h.name,
                date: h.date,
            });
        });
    });

    allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="pageWrapper">
            <header className="pageHeader">
                <h1 className="pageTitle">📋 History</h1>
                <p className="pageSubtitle">Past task completions</p>
            </header>

            {/* Filter */}
            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filterTask === 'all' ? styles.filterActive : ''}`}
                    onClick={() => setFilterTask('all')}
                >
                    All
                </button>
                {data.tasks.map((task) => (
                    <button
                        key={task.id}
                        className={`${styles.filterBtn} ${filterTask === task.id ? styles.filterActive : ''}`}
                        onClick={() => setFilterTask(task.id)}
                    >
                        {task.icon} {task.name}
                    </button>
                ))}
            </div>

            {allEntries.length === 0 ? (
                <div className="emptyState">
                    <span className="emptyIcon">📋</span>
                    <p>No completions logged yet.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {allEntries.map((entry, i) => (
                        <div key={i} className={styles.entry}>
                            <div className={styles.entryDot} style={{ backgroundColor: getAvatarColor(entry.uid) }} />
                            <div className={styles.entryContent}>
                                <div className={styles.entryTop}>
                                    <span className={styles.entryTask}>{entry.taskIcon} {entry.taskName}</span>
                                    <span className={styles.entryDate}>{formatDate(entry.date)}</span>
                                </div>
                                <span className={styles.entryName}>{entry.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="btnGhost" onClick={() => router.push('/settings')} style={{ marginTop: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>← Back to Settings</button>
        </div>
    );
}
