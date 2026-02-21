'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import { findHouseByUser, subscribeToHouse } from '@/lib/firestore';
import { getUpcomingRotation, getMemberByUid } from '@/lib/schedule';
import styles from './schedule.module.css';

const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

export default function SchedulePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);

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
        return <div className="loadingPage"><div className="spinner" /><p>Loading schedule...</p></div>;
    }
    if (!data || !user) return null;

    const getAvatarColor = (uid: string) => {
        const idx = data.members.findIndex((m) => m.uid === uid);
        return AVATAR_COLORS[idx % AVATAR_COLORS.length];
    };

    return (
        <div className="pageWrapper">
            <header className="pageHeader">
                <h1 className="pageTitle">📅 Schedule</h1>
                <p className="pageSubtitle">Upcoming task rotation</p>
            </header>

            {data.tasks.map((task) => {
                const upcoming = getUpcomingRotation(task, data.members, 8);
                if (upcoming.length === 0) return null;

                return (
                    <div key={task.id} className="section">
                        <h2 className="sectionTitle">{task.icon} {task.name}</h2>
                        <div className={styles.timeline}>
                            {upcoming.map((r, i) => {
                                const isMe = r.uid === user.uid;
                                const isCurrent = i === 0;
                                return (
                                    <div key={i} className={`${styles.row} ${isCurrent ? styles.rowCurrent : ''} ${isMe ? styles.rowMe : ''}`}>
                                        <div className={styles.indicator}>
                                            <div className={styles.dot} style={{ backgroundColor: getAvatarColor(r.uid) }} />
                                            {i < upcoming.length - 1 && <div className={styles.line} />}
                                        </div>
                                        <div className={styles.content}>
                                            <div className={styles.rowHeader}>
                                                <span className={styles.name}>
                                                    {r.name}
                                                    {isMe && <span className={styles.youBadge}>You</span>}
                                                    {isCurrent && <span className={styles.currentBadge}>Now</span>}
                                                </span>
                                                {r.tentativeDate && (
                                                    <span className={styles.date}>
                                                        {new Date(r.tentativeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
