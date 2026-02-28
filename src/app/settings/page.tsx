'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import { findHouseByUser, subscribeToHouse, saveFcmToken } from '@/lib/firestore';
import { requestFcmToken, isNotificationSupported } from '@/lib/notifications';
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
                // If permission was already granted previously, automatically grab the token and save it
                if (Notification.permission === 'granted') {
                    requestFcmToken().then((token) => {
                        if (token) saveFcmToken(house.id, house.data, user.uid, token).catch(console.error);
                    }).catch(console.error);
                }
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
        try {
            setNotifStatus('requesting');
            const token = await requestFcmToken();

            if (token) {
                if (houseId && data) await saveFcmToken(houseId, data, user.uid, token);
                setNotifStatus('granted');
                showToast('🔔 Native push notifications enabled!');
            } else {
                setNotifStatus(Notification.permission === 'denied' ? 'denied' : 'unknown');
                if (Notification.permission === 'default') showToast('Notification permission was dismissed');
            }
        } catch (err: any) {
            console.error('FCM Token Error:', err);
            setNotifStatus('unknown');
            showToast(`⚠️ Error: ${err.message?.substring(0, 50) || 'Failed to get token'}`);
        }
    };

    const handleTestPush = async () => {
        if (!houseId || !data) return;
        const member = data.members.find((m) => m.uid === user.uid);
        if (!member || !member.fcmTokens || member.fcmTokens.length === 0) {
            showToast('⚠️ Please enable notifications first');
            return;
        }

        try {
            showToast('⏳ Sending test push...');
            await fetch('/api/notifications/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetTokens: member.fcmTokens,
                    title: `🧪 Test Notification`,
                    message: `Push notifications are working perfectly on this device!`,
                }),
            });
            showToast('✅ Test push sent! Check your notification bar.');
        } catch {
            showToast('⚠️ Failed to send test push');
        }
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p className={styles.statusGood}>✅ App push notifications active</p>
                        <button className="btnGhost" onClick={handleEnableNotif} style={{ borderColor: 'var(--border)' }}>
                            🔄 Refresh Device Registration
                        </button>
                        <button className="btnSecondary" onClick={handleTestPush}>
                            🧪 Test Notification Delivery
                        </button>
                    </div>
                ) : notifStatus === 'denied' ? (
                    <p className={styles.statusWarn}>🚫 Blocked — enable in device settings</p>
                ) : notifStatus === 'unsupported' ? (
                    <p className={styles.statusWarn}>⚠️ Not supported in this browser</p>
                ) : notifStatus === 'requesting' ? (
                    <p className={styles.statusWait}>⏳ Requesting permission...</p>
                ) : (
                    <button className="btnSecondary" onClick={handleEnableNotif}>🔔 Enable App Notifications</button>
                )}
            </div>

            <hr className="divider" />

            <button className="btnDanger" onClick={handleSignOut}>🚪 Sign Out</button>
        </div>
    );
}
