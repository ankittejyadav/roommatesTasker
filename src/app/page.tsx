'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData } from '@/lib/types';
import {
  findHouseByUser,
  findAllHousesByUser,
  subscribeToHouse,
  completeTaskInFirestore,
  overrideCurrentAssignee,
  triggerManualReminder,
} from '@/lib/firestore';
import { getCurrentAssigneeUid, getMemberByUid } from '@/lib/schedule';
import { requestNotificationPermission, notifyIfAssigned } from '@/lib/notifications';
import TaskCard from '@/components/TaskCard';
import OverrideModal from '@/components/OverrideModal';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [houseId, setHouseId] = useState<string | null>(null);
  const [data, setData] = useState<HouseData | null>(null);
  const [allHouses, setAllHouses] = useState<{ id: string; data: HouseData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [overrideTaskId, setOverrideTaskId] = useState<string | null>(null);
  const [showHousePicker, setShowHousePicker] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    let unsub: (() => void) | null = null;

    const init = async () => {
      try {
        const houses = await findAllHousesByUser(user.uid);
        setAllHouses(houses);

        if (houses.length === 0) { router.push('/join'); return; }

        const selectedId = houses[0].id;
        setHouseId(selectedId);
        unsub = subscribeToHouse(selectedId, (houseData) => {
          if (!houseData) {
            // House was deleted from Firebase
            setData(null);
            setLoading(false);
            router.push('/join');
            return;
          }
          setData(houseData);
          setLoading(false);

          (houseData.tasks || []).forEach((task) => {
            const assigneeUid = getCurrentAssigneeUid(task);
            if (assigneeUid) {
              const member = getMemberByUid(houseData.members || [], assigneeUid);
              if (member) notifyIfAssigned(user.uid, assigneeUid, task.name, member.displayName);
            }
          });
        });
        requestNotificationPermission();
      } catch (err) {
        console.error('Dashboard init error:', err);
        setLoading(false);
        router.push('/join');
      }
    };

    init();
    return () => { if (unsub) unsub(); };
  }, [user, authLoading, router]);

  const switchHouse = useCallback((newHouseId: string) => {
    setLoading(true);
    setHouseId(newHouseId);
    setShowHousePicker(false);
    const unsub = subscribeToHouse(newHouseId, (d) => { setData(d); setLoading(false); });
    return unsub;
  }, []);

  const handleComplete = useCallback(async (taskId: string) => {
    if (!houseId || !data || !user) return;
    const completedByName = getMemberByUid(data.members, user.uid)?.displayName || user.displayName || 'Unknown';
    await completeTaskInFirestore(houseId, taskId, data, user.uid, completedByName);

    const task = data.tasks.find((t) => t.id === taskId);
    if (task) {
      const nextIdx = (task.currentIndex + 1) % task.rotation.length;
      const nextUid = task.rotation[nextIdx];
      const nextMember = getMemberByUid(data.members, nextUid);
      if (nextMember) setToast(`✅ Done! ${nextMember.displayName} is next`);
    }
    setTimeout(() => setToast(null), 3000);
  }, [houseId, data, user]);

  const handleOverride = useCallback(async (swapWithUid: string) => {
    if (!houseId || !data || !overrideTaskId) return;
    await overrideCurrentAssignee(houseId, overrideTaskId, data, swapWithUid);
    setOverrideTaskId(null);
    setToast('🔄 Swapped for this turn only!');
    setTimeout(() => setToast(null), 3000);
  }, [houseId, data, overrideTaskId]);

  const handleRemind = async (taskId: string) => {
    if (!houseId || !data) return;
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const assigneeUid = getCurrentAssigneeUid(task);
    if (!assigneeUid) return;

    const member = data.members.find((m) => m.uid === assigneeUid);
    if (!member || !member.fcmTokens || member.fcmTokens.length === 0) {
      setToast('⚠️ Assignee has not enabled app notifications');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTokens: member.fcmTokens,
          title: `🔔 Reminder: ${task.name}`,
          message: `It's your turn to do the ${task.name}.`,
        }),
      });

      await triggerManualReminder(houseId, taskId, data);
      setToast('✅ Reminder sent to their phone!');
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast('⚠️ Failed to send reminder');
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (authLoading || loading) {
    return <div className="loadingPage"><div className="spinner" /><p>Finding your house...</p></div>;
  }
  if (!data || !user) return null;

  const isAdmin = data.adminUid === user.uid;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const myTasks = data.tasks.filter((t) => getCurrentAssigneeUid(t) === user.uid);
  const otherTasks = data.tasks.filter((t) => getCurrentAssigneeUid(t) !== user.uid);
  const overrideTask = overrideTaskId ? data.tasks.find((t) => t.id === overrideTaskId) : null;

  return (
    <div className="pageWrapper">
      {toast && <div className="toast">{toast}</div>}

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className="pageTitle">🏠 {data.name}</h1>
            <p className="pageSubtitle">{today}</p>
          </div>
          {allHouses.length > 1 && (
            <button
              className={styles.switchBtn}
              onClick={() => setShowHousePicker(!showHousePicker)}
            >
              ↔
            </button>
          )}
          <button className={styles.switchBtn} onClick={() => router.push('/join')}>
            +
          </button>
        </div>

        {showHousePicker && (
          <div className={styles.housePicker}>
            {allHouses.map((h) => (
              <button
                key={h.id}
                className={`${styles.houseOption} ${h.id === houseId ? styles.houseActive : ''}`}
                onClick={() => switchHouse(h.id)}
              >
                <span>{h.data.name}</span>
                <span className={styles.houseMembers}>{h.data.members.length} 👤</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {myTasks.length > 0 && (
        <div className="section">
          <h2 className="sectionTitle">⚡ Your Tasks</h2>
          <div className="cardGrid">
            {myTasks.map((task) => (
              <TaskCard
                key={task.id} task={task} members={data.members}
                currentUserUid={user.uid} isAdmin={isAdmin}
                onComplete={handleComplete} onOverride={setOverrideTaskId}
                onRemind={handleRemind}
              />
            ))}
          </div>
        </div>
      )}

      {otherTasks.length > 0 && (
        <div className="section">
          <h2 className="sectionTitle">📋 All Tasks</h2>
          <div className="cardGrid">
            {otherTasks.map((task) => (
              <TaskCard
                key={task.id} task={task} members={data.members}
                currentUserUid={user.uid} isAdmin={isAdmin}
                onComplete={handleComplete} onOverride={setOverrideTaskId}
                onRemind={handleRemind}
              />
            ))}
          </div>
        </div>
      )}

      {myTasks.length === 0 && otherTasks.length === 0 && (
        <div className="emptyState">
          <span className="emptyIcon">🎉</span>
          <p>{isAdmin ? 'No tasks yet. Go to Admin to configure rotations.' : 'No tasks yet. Ask your admin to set up rotations.'}</p>
        </div>
      )}

      {overrideTask && (
        <OverrideModal
          task={overrideTask} members={data.members}
          onSwap={handleOverride} onClose={() => setOverrideTaskId(null)}
        />
      )}
    </div>
  );
}
