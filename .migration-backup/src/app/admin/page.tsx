'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import {
    findHouseByUser,
    subscribeToHouse,
    updateTaskRotation,
    updateTaskFrequency,
    updateHouseName,
    removeMemberFromHouse,
} from '@/lib/firestore';
import styles from './admin.module.css';

const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [houseId, setHouseId] = useState<string | null>(null);
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }

        let unsub: (() => void) | null = null;
        const init = async () => {
            const house = await findHouseByUser(user.uid);
            if (!house) { router.push('/join'); return; }
            if (house.data.adminUid !== user.uid) { router.push('/'); return; }
            setHouseId(house.id);
            setNewName(house.data.name);
            unsub = subscribeToHouse(house.id, (d) => { setData(d); setLoading(false); });
        };
        init();
        return () => { if (unsub) unsub(); };
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading admin...</p></div>;
    }
    if (!data || !user || !houseId) return null;

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleSaveName = async () => {
        if (newName.trim()) {
            await updateHouseName(houseId, newName.trim());
            setEditingName(false);
            showToast('✅ Name updated');
        }
    };

    const handleRemoveMember = async (uid: string) => {
        await removeMemberFromHouse(houseId, data, uid);
        setConfirmRemove(null);
        showToast('✅ Member removed');
    };

    const toggleInRotation = async (taskId: string, uid: string) => {
        const task = data.tasks.find((t) => t.id === taskId);
        if (!task) return;
        let rotation = [...task.rotation];
        if (rotation.includes(uid)) {
            if (rotation.length <= 1) return;
            rotation = rotation.filter((r) => r !== uid);
        } else {
            rotation.push(uid);
        }
        await updateTaskRotation(houseId, taskId, data, rotation);
    };

    const handleFrequencyChange = async (taskId: string, days: number) => {
        await updateTaskFrequency(houseId, taskId, data, days);
        showToast('✅ Frequency updated');
    };

    return (
        <div className="pageWrapper">
            {toast && <div className="toast">{toast}</div>}

            <header className="pageHeader">
                <h1 className="pageTitle">🔧 Admin Panel</h1>
                <p className="pageSubtitle">Manage your household</p>
            </header>

            {/* House Info */}
            <div className="section">
                <h2 className="sectionTitle">House Info</h2>
                <div className="glassCard">
                    {editingName ? (
                        <div className={styles.editRow}>
                            <input className="inputField" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} autoFocus />
                            <button className="btnPrimary btnSmall" onClick={handleSaveName}>Save</button>
                        </div>
                    ) : (
                        <div className={styles.infoRow} onClick={() => setEditingName(true)}>
                            <span className={styles.infoLabel}>Name</span>
                            <span className={styles.infoValue}>{data.name} ✏️</span>
                        </div>
                    )}
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Invite Code</span>
                        <span className={styles.inviteCode}>{data.inviteCode}</span>
                    </div>
                </div>
            </div>

            {/* Members */}
            <div className="section">
                <h2 className="sectionTitle">Members ({data.members.length})</h2>
                <div className={styles.membersList}>
                    {data.members.map((member, i) => (
                        <div key={member.uid} className={styles.memberCard}>
                            <div className={styles.memberLeft}>
                                <div className={styles.memberAvatar} style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                    {member.photoURL ? (
                                        <img src={member.photoURL} alt={member.displayName} referrerPolicy="no-referrer" />
                                    ) : member.displayName[0].toUpperCase()}
                                </div>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>
                                        {member.displayName}
                                        {member.uid === data.adminUid && <span className={styles.adminBadge}>Admin</span>}
                                    </span>
                                    <span className={styles.memberEmail}>{member.email}</span>
                                </div>
                            </div>
                            {member.uid !== user.uid && (
                                <>
                                    {confirmRemove === member.uid ? (
                                        <div className={styles.confirmActions}>
                                            <button className={styles.confirmYes} onClick={() => handleRemoveMember(member.uid)}>Remove</button>
                                            <button className={styles.confirmNo} onClick={() => setConfirmRemove(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <button className={styles.removeBtn} onClick={() => setConfirmRemove(member.uid)}>✕</button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* Task Rotations */}
            {data.tasks.map((task) => (
                <div key={task.id} className="section">
                    <h2 className="sectionTitle">{task.icon} {task.name}</h2>

                    {task.frequencyDays !== null && (
                        <div className={styles.freqRow}>
                            <span className={styles.freqLabel}>Every</span>
                            <button className={styles.freqBtn} onClick={() => handleFrequencyChange(task.id, Math.max(1, (task.frequencyDays || 7) - 1))}>−</button>
                            <span className={styles.freqValue}>{task.frequencyDays} days</span>
                            <button className={styles.freqBtn} onClick={() => handleFrequencyChange(task.id, (task.frequencyDays || 7) + 1)}>+</button>
                        </div>
                    )}

                    {task.frequencyDays === null && (
                        <p className={styles.note}>No frequency — rotation advances on completion.</p>
                    )}

                    <div className={styles.chipGrid}>
                        <p className={styles.chipLabel}>Tap to add/remove from rotation</p>
                        <div className={styles.chips}>
                            {data.members.map((member, i) => {
                                const inRotation = task.rotation.includes(member.uid);
                                const position = task.rotation.indexOf(member.uid);
                                return (
                                    <button
                                        key={member.uid}
                                        className={`${styles.chip} ${inRotation ? styles.chipActive : ''}`}
                                        onClick={() => toggleInRotation(task.id, member.uid)}
                                    >
                                        <span className={styles.chipDot} style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
                                        <span>{member.displayName}</span>
                                        {inRotation && <span className={styles.chipPos}>#{position + 1}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
