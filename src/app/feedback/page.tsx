'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData, FeedbackItem } from '@/lib/types';
import { findHouseByUser, subscribeToHouse, addFeedback, updateFeedbackStatus } from '@/lib/firestore';
import styles from './feedback.module.css';

type Status = FeedbackItem['status'];
const STATUS_LABELS: Record<Status, string> = { 'new': '💡 New', 'in-progress': '🔨 In Progress', 'done': '✅ Done' };
const STATUS_ORDER: Status[] = ['new', 'in-progress', 'done'];

export default function FeedbackPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [houseId, setHouseId] = useState<string | null>(null);
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newText, setNewText] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }
        let unsub: (() => void) | null = null;
        const init = async () => {
            const house = await findHouseByUser(user.uid);
            if (!house) { router.push('/join'); return; }
            setHouseId(house.id);
            unsub = subscribeToHouse(house.id, (d) => { setData(d); setLoading(false); });
        };
        init();
        return () => { if (unsub) unsub(); };
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading feedback...</p></div>;
    }
    if (!data || !user || !houseId) return null;

    const isAdmin = data.adminUid === user.uid;
    const feedback = data.feedback || [];
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleAdd = async () => {
        if (!newText.trim()) return;
        await addFeedback(houseId, data, newText.trim(), user.uid, user.displayName || 'Unknown');
        setNewText('');
        showToast('💡 Feedback submitted!');
    };

    const cycleStatus = async (item: FeedbackItem) => {
        if (!isAdmin) return;
        const idx = STATUS_ORDER.indexOf(item.status);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        await updateFeedbackStatus(houseId, data, item.id, next);
    };

    return (
        <div className="pageWrapper">
            {toast && <div className="toast">{toast}</div>}

            <header className="pageHeader">
                <h1 className="pageTitle">💬 Feedback</h1>
                <p className="pageSubtitle">Suggest improvements for the house</p>
            </header>

            {/* Add feedback */}
            <div className={styles.addRow}>
                <input
                    className="inputField"
                    placeholder="Suggest an idea or report an issue..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button className="btnPrimary btnSmall" onClick={handleAdd} disabled={!newText.trim()}>
                    Send
                </button>
            </div>

            {/* Kanban columns */}
            {STATUS_ORDER.map((status) => {
                const items = feedback.filter((f) => f.status === status);
                if (items.length === 0 && status === 'done') return null; // hide empty done column

                return (
                    <div key={status} className="section">
                        <h2 className="sectionTitle">{STATUS_LABELS[status]} ({items.length})</h2>
                        <div className={styles.column}>
                            {items.length === 0 ? (
                                <p className={styles.emptyCol}>No items</p>
                            ) : (
                                items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`${styles.card} ${status === 'done' ? styles.cardDone : ''} ${isAdmin ? styles.cardClickable : ''}`}
                                        onClick={() => cycleStatus(item)}
                                    >
                                        <p className={styles.cardText}>{item.text}</p>
                                        <div className={styles.cardMeta}>
                                            <span className={styles.cardAuthor}>{item.authorName}</span>
                                            <span className={styles.cardDate}>
                                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <span className={styles.statusHint}>
                                                {status === 'new' ? 'Click → In Progress' : status === 'in-progress' ? 'Click → Done' : 'Click → Reopen'}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}

            {feedback.length === 0 && (
                <div className="emptyState">
                    <span className="emptyIcon">💬</span>
                    <p>No feedback yet. Be the first to share an idea!</p>
                </div>
            )}
        </div>
    );
}
