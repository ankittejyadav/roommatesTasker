'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData, Task } from '@/lib/types';
import { findHouseByUser, subscribeToHouse, overrideCurrentAssignee, completeTaskInFirestore } from '@/lib/firestore';
import { getCurrentAssigneeUid, getUrgency, getMemberByUid } from '@/lib/schedule';
import TaskCard from '@/components/TaskCard';
import OverrideModal from '@/components/OverrideModal';
import styles from './personal.module.css';

export default function PersonalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [houseId, setHouseId] = useState<string | null>(null);
  const [data, setData] = useState<HouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [overrideTaskId, setOverrideTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    let unsub: (() => void) | null = null;

    const init = async () => {
      try {
        const house = await findHouseByUser(user.uid);
        if (!house) { router.push('/join'); return; }

        setHouseId(house.id);
        unsub = subscribeToHouse(house.id, (houseData) => {
          if (houseData) {
            setData(houseData);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Personal init error:', err);
        setLoading(false);
      }
    };

    init();
    return () => { if (unsub) unsub(); };
  }, [user, authLoading, router]);

  const handleComplete = useCallback(async (taskId: string) => {
    if (!houseId || !data || !user) return;
    const completedByName = getMemberByUid(data.members, user.uid)?.displayName || user.displayName || 'Unknown';
    await completeTaskInFirestore(houseId, taskId, data, user.uid, completedByName);
    setToast('✅ Task Completed!');
    setTimeout(() => setToast(null), 3000);
  }, [houseId, data, user]);

  const handleOverride = useCallback(async (swapWithUid: string) => {
    if (!houseId || !data || !overrideTaskId) return;
    await overrideCurrentAssignee(houseId, overrideTaskId, data, swapWithUid);
    setOverrideTaskId(null);
  }, [houseId, data, overrideTaskId]);

  if (authLoading || loading) {
    return <div className="loadingPage"><div className="spinner" /><p>Loading My Tasks...</p></div>;
  }
  if (!data || !user) return null;

  const isAdmin = data.adminUid === user.uid;

  // Filter ONLY My Tasks
  const myTasks = data.tasks.filter((t) => getCurrentAssigneeUid(t) === user.uid);

  // Group by Urgency
  const overdueTasks = myTasks.filter((t) => getUrgency(t) === 'overdue');
  const todayTasks = myTasks.filter((t) => getUrgency(t) === 'due-today');
  const upcomingTasks = myTasks.filter((t) => getUrgency(t) === 'upcoming');

  // Pull History Completed Today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = data.tasks.flatMap(task => 
    (task.history || [])
      .filter(h => h.uid === user.uid && new Date(h.date) >= todayStart)
      .map(h => ({ ...task, completionDate: h.date }))
  );

  return (
    <div className="pageWrapper" style={{ maxWidth: '560px' }}> {/* Keep single column for mobile list mockup feel */}
      {toast && <div className="toast">{toast}</div>}

      <header className={styles.header}>
        <h1 className={styles.title}>Roommate Tasker</h1>
      </header>

      {overdueTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Overdue Task</h2>
          <div className={styles.list}>
            {overdueTasks.map(t => (
              <TaskCard key={t.id} task={t} members={data.members} currentUserUid={user.uid} isAdmin={isAdmin} onComplete={handleComplete} onOverride={setOverrideTaskId} />
            ))}
          </div>
        </div>
      )}

      {todayTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Today's Task (My Turn)</h2>
          <div className={styles.list}>
            {todayTasks.map(t => (
              <TaskCard key={t.id} task={t} members={data.members} currentUserUid={user.uid} isAdmin={isAdmin} onComplete={handleComplete} onOverride={setOverrideTaskId} />
            ))}
          </div>
        </div>
      )}

      {upcomingTasks.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Upcoming Task</h2>
          <div className={styles.list}>
            {upcomingTasks.map(t => (
              <TaskCard key={t.id} task={t} members={data.members} currentUserUid={user.uid} isAdmin={isAdmin} onComplete={handleComplete} onOverride={setOverrideTaskId} />
            ))}
          </div>
        </div>
      )}

      {completedToday.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Completed Task (Celebrating)</h2>
          <div className={styles.list}>
            {completedToday.map((t, idx) => (
              <div key={idx} className={styles.completedCard}>
                <div className={styles.checkCircle}>
                  <span>✓</span>
                </div>
                <div className={styles.completedInfo}>
                  <h3 className={styles.completedTitle}>{t.name}</h3>
                  <p className={styles.completedSubtitle}>Completed today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myTasks.length === 0 && completedToday.length === 0 && (
        <div className="emptyState">
          <span className="emptyIcon">🎉</span>
          <p>You are all caught up for today!</p>
        </div>
      )}

      {overrideTaskId && (
        <OverrideModal
          task={data.tasks.find((t) => t.id === overrideTaskId)!} members={data.members}
          onSwap={handleOverride} onClose={() => setOverrideTaskId(null)}
        />
      )}
    </div>
  );
}
