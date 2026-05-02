'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData, ShoppingItem } from '@/lib/types';
import {
    findHouseByUser, subscribeToHouse,
    addShoppingItem, claimShoppingItem, unclaimShoppingItem,
    completeShoppingItem, removeShoppingItem,
} from '@/lib/firestore';
import styles from './shopping.module.css';

export default function ShoppingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [houseId, setHouseId] = useState<string | null>(null);
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState('');
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
        return <div className="loadingPage"><div className="spinner" /><p>Loading list...</p></div>;
    }
    if (!data || !user || !houseId) return null;

    const list = data.shoppingList || [];
    const active = list.filter((s) => !s.completed);
    const completed = list.filter((s) => s.completed);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        await addShoppingItem(houseId, data, newItem.trim(), user.uid, user.displayName || 'Unknown');
        setNewItem('');
        showToast('🛒 Item added!');
    };

    const handleClaim = async (item: ShoppingItem) => {
        if (item.claimedByUid === user.uid) {
            await unclaimShoppingItem(houseId, data, item.id);
        } else if (!item.claimedByUid) {
            await claimShoppingItem(houseId, data, item.id, user.uid, user.displayName || 'Unknown');
            showToast(`👋 You'll get ${item.text}`);
        }
    };

    const handleComplete = async (itemId: string) => {
        await completeShoppingItem(houseId, data, itemId);
        showToast('✅ Item done!');
    };

    const handleRemove = async (itemId: string) => {
        await removeShoppingItem(houseId, data, itemId);
    };

    return (
        <div className="pageWrapper">
            {toast && <div className="toast">{toast}</div>}

            <header className="pageHeader">
                <h1 className="pageTitle">🛒 Shopping List</h1>
                <p className="pageSubtitle">Request items for the apartment</p>
            </header>

            {/* Add item */}
            <div className={styles.addRow}>
                <input
                    className="inputField"
                    placeholder="Paper towels, trash bags, etc..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button className="btnPrimary btnSmall" onClick={handleAdd} disabled={!newItem.trim()}>
                    Add
                </button>
            </div>

            {/* Active items */}
            {active.length > 0 && (
                <div className="section">
                    <h2 className="sectionTitle">📝 To Buy ({active.length})</h2>
                    <div className={styles.list}>
                        {active.map((item) => {
                            const isMyClaim = item.claimedByUid === user.uid;
                            const isClaimed = !!item.claimedByUid;
                            return (
                                <div key={item.id} className={`${styles.item} ${isMyClaim ? styles.itemMyClaim : ''}`}>
                                    <div className={styles.itemMain}>
                                        <span className={styles.itemText}>{item.text}</span>
                                        <div className={styles.itemMeta}>
                                            <span className={styles.itemBy}>Added by {item.addedByName}</span>
                                            {isClaimed && (
                                                <span className={styles.claimTag}>
                                                    {isMyClaim ? '🙋 You' : `🙋 ${item.claimedByName}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        {isMyClaim ? (
                                            <>
                                                <button className={styles.actionBtn} onClick={() => handleComplete(item.id)} title="Done">✅</button>
                                                <button className={styles.actionBtn} onClick={() => handleClaim(item)} title="Unclaim">↩</button>
                                            </>
                                        ) : !isClaimed ? (
                                            <button className={styles.claimBtn} onClick={() => handleClaim(item)}>
                                                I'll get it
                                            </button>
                                        ) : null}
                                        {(item.addedByUid === user.uid || data.adminUid === user.uid) && (
                                            <button className={styles.actionBtn} onClick={() => handleRemove(item.id)} title="Remove">✕</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
                <div className="section">
                    <h2 className="sectionTitle">✅ Got It ({completed.length})</h2>
                    <div className={styles.list}>
                        {completed.map((item) => (
                            <div key={item.id} className={`${styles.item} ${styles.itemCompleted}`}>
                                <div className={styles.itemMain}>
                                    <span className={`${styles.itemText} ${styles.itemTextDone}`}>{item.text}</span>
                                    <span className={styles.itemBy}>{item.claimedByName || item.addedByName}</span>
                                </div>
                                {(item.addedByUid === user.uid || data.adminUid === user.uid) && (
                                    <button className={styles.actionBtn} onClick={() => handleRemove(item.id)}>✕</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {list.length === 0 && (
                <div className="emptyState">
                    <span className="emptyIcon">🛍️</span>
                    <p>No items needed right now. Add something!</p>
                </div>
            )}
        </div>
    );
}
