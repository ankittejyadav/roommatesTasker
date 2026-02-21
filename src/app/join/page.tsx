'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import { joinHouse, createHouse, findAllHousesByUser } from '@/lib/firestore';
import styles from './join.module.css';

export default function JoinPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [code, setCode] = useState('');
    const [houseName, setHouseName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [popularHouses, setPopularHouses] = useState<{ id: string; data: HouseData }[]>([]);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user) {
            findAllHousesByUser(user.uid).then(setPopularHouses).catch(() => { });
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading...</p></div>;
    }

    const handleJoin = async (inviteCode?: string) => {
        const codeToUse = inviteCode || code.trim();
        if (!codeToUse) { setError('Enter an invite code'); return; }
        setSubmitting(true);
        setError('');
        try {
            const houseId = await joinHouse(codeToUse, user.uid, user.displayName || 'User', user.email || '', user.photoURL);
            if (!houseId) { setError('House not found. Check the code.'); setSubmitting(false); return; }
            router.push('/');
        } catch { setError('Something went wrong.'); setSubmitting(false); }
    };

    const handleCreate = async () => {
        setSubmitting(true);
        setError('');
        try {
            await createHouse(user.uid, user.displayName || 'User', user.email || '', user.photoURL, houseName.trim());
            router.push('/');
        } catch { setError('Something went wrong.'); setSubmitting(false); }
    };

    return (
        <div className="pageWrapper">
            <header className="pageHeader">
                <h1 className="pageTitle">🏠 Get Started</h1>
                <p className="pageSubtitle">Join an existing house or create a new one</p>
            </header>

            {/* Mode toggle */}
            <div className={styles.toggle}>
                <button className={`${styles.toggleBtn} ${mode === 'join' ? styles.toggleActive : ''}`} onClick={() => { setMode('join'); setError(''); }}>
                    Join House
                </button>
                <button className={`${styles.toggleBtn} ${mode === 'create' ? styles.toggleActive : ''}`} onClick={() => { setMode('create'); setError(''); }}>
                    Create House
                </button>
            </div>

            {mode === 'join' ? (
                <div className="section">
                    <div className="inputGroup">
                        <label className="inputLabel">Invite Code</label>
                        <input
                            className="inputField"
                            placeholder="e.g. ABC123"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            maxLength={8}
                            style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className="btnPrimary" onClick={() => handleJoin()} disabled={submitting}>
                        {submitting ? 'Joining...' : '🚪 Join House'}
                    </button>

                    {/* My Houses */}
                    {popularHouses.length > 0 && (
                        <div className={styles.popular}>
                            <h3 className="sectionTitle">🏠 My Houses</h3>
                            <div className={styles.popularList}>
                                {popularHouses.map((h) => (
                                    <button
                                        key={h.id}
                                        className={styles.popularCard}
                                        onClick={() => router.push('/')}
                                        disabled={submitting}
                                    >
                                        <div className={styles.popularInfo}>
                                            <span className={styles.popularName}>{h.data.name}</span>
                                            <span className={styles.popularMembers}>{h.data.members.length} members</span>
                                        </div>
                                        <span className={styles.popularJoin}>Open →</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="section">
                    <div className="inputGroup">
                        <label className="inputLabel">House Name</label>
                        <input
                            className="inputField"
                            placeholder="Our Apartment"
                            value={houseName}
                            onChange={(e) => setHouseName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className="btnPrimary" onClick={handleCreate} disabled={submitting}>
                        {submitting ? 'Creating...' : '🏠 Create House'}
                    </button>
                </div>
            )}

            {/* Back to dashboard if already in a house */}
            <button className="btnGhost" onClick={() => router.push('/')} style={{ marginTop: 16, width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                ← Back to Dashboard
            </button>
        </div>
    );
}
