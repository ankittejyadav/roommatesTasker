'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import { findHouseByUser, subscribeToHouse } from '@/lib/firestore';
import { requestNotificationPermission, isNotificationSupported } from '@/lib/notifications';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [houseId, setHouseId] = useState<string | null>(null);
    const [data, setData] = useState<HouseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifStatus, setNotifStatus] = useState<string>('unknown');
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

            if (isNotificationSupported()) {
                setNotifStatus(Notification.permission);
            } else {
                setNotifStatus('unsupported');
            }
        };
        init();
        return () => { if (unsub) unsub(); };
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading settings...</p></div>;
    }
    if (!data || !user || !houseId) return null;

    const isAdmin = data.adminUid === user.uid;
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleEnableNotif = async () => {
        const granted = await requestNotificationPermission();
        setNotifStatus(granted ? 'granted' : 'denied');
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <div className="pageWrapper">
            {toast && <div className="toast">{toast}</div>}

            <header className="pageHeader">
                <h1 className="pageTitle">⚙ Settings</h1>
                <p className="pageSubtitle">Your profile & preferences</p>
            </header>

            {/* Profile */}
            <div className="section">
                <h2 className="sectionTitle">Profile</h2>
                <div className="glassCard">
                    <div className={styles.profileRow}>
                        <div className={styles.avatar}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
                            ) : (user.displayName || 'U')[0].toUpperCase()}
                        </div>
                        <div className={styles.profileInfo}>
                            <span className={styles.profileName}>{user.displayName}</span>
                            <span className={styles.profileEmail}>{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Household */}
            <div className="section">
                <h2 className="sectionTitle">Household</h2>
                <div className="glassCard">
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>House</span>
                        <span className={styles.infoValue}>{data.name}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Invite Code</span>
                        <span className={styles.inviteCode}>{data.inviteCode}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Members</span>
                        <span className={styles.infoValue}>{data.members.map((m) => m.displayName).join(', ')}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Role</span>
                        <span className={styles.infoValue}>{isAdmin ? '👑 Admin' : 'Member'}</span>
                    </div>
                </div>
            </div>

            {/* Quick links */}
            <div className="section">
                <h2 className="sectionTitle">Quick Links</h2>
                <div className={styles.links}>
                    <Link href="/history" className={styles.link}>📋 Task History</Link>
                    {isAdmin && <Link href="/admin" className={styles.link}>🔧 Admin Panel</Link>}
                </div>
            </div>

            <hr className="divider" />

            {/* Notifications */}
            <div className="section">
                <h2 className="sectionTitle">Notifications</h2>
                {notifStatus === 'granted' ? (
                    <p className={styles.statusGood}>✅ Browser notifications enabled</p>
                ) : notifStatus === 'denied' ? (
                    <p className={styles.statusWarn}>🚫 Blocked — enable in browser settings</p>
                ) : notifStatus === 'unsupported' ? (
                    <p className={styles.statusWarn}>⚠️ Not supported in this browser</p>
                ) : (
                    <button className="btnSecondary" onClick={handleEnableNotif}>🔔 Enable Notifications</button>
                )}
            </div>

            <hr className="divider" />

            <button className="btnDanger" onClick={handleSignOut}>🚪 Sign Out</button>
        </div>
    );
}
