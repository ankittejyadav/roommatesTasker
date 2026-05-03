<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import {
    findAllHousesByUser, subscribeToHouse,
    completeTaskInFirestore, overrideCurrentAssignee, triggerManualReminder,
  } from '../lib/firestore';
  import { getCurrentAssigneeUid, getMemberByUid } from '../lib/schedule';
  import { requestNotificationPermission, notifyIfAssigned } from '../lib/notifications';
  import type { HouseData } from '../lib/types';
  import TaskCard from '../components/TaskCard.svelte';
  import OverrideModal from '../components/OverrideModal.svelte';

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let allHouses: { id: string; data: HouseData }[] = [];
  let loading = true;
  let toast: string | null = null;
  let overrideTaskId: string | null = null;
  let showHousePicker = false;
  let unsub: (() => void) | null = null;
  let switchUnsub: (() => void) | null = null;

  $: {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); }
      else if (!initialized) { initialized = true; init(); }
    }
  }

  async function init() {
    try {
      const houses = await findAllHousesByUser($user!.uid);
      allHouses = houses;
      if (houses.length === 0) { navigate('/join'); return; }
      const selectedId = houses[0].id;
      houseId = selectedId;
      unsub = subscribeToHouse(selectedId, (houseData) => {
        if (!houseData) { data = null; loading = false; navigate('/join'); return; }
        data = houseData;
        loading = false;
        (houseData.tasks || []).forEach((task) => {
          const aUid = getCurrentAssigneeUid(task);
          if (aUid) {
            const m = getMemberByUid(houseData.members || [], aUid);
            if (m) notifyIfAssigned($user!.uid, aUid, task.name, m.displayName);
          }
        });
      });
      requestNotificationPermission();
    } catch (err) {
      console.error('Dashboard init error:', err);
      loading = false;
      navigate('/join');
    }
  }

  function switchHouse(newHouseId: string) {
    loading = true;
    houseId = newHouseId;
    showHousePicker = false;
    if (switchUnsub) switchUnsub();
    switchUnsub = subscribeToHouse(newHouseId, (d) => { data = d; loading = false; });
  }

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => { toast = null; }, 3000);
  }

  async function handleComplete(taskId: string) {
    if (!houseId || !data || !$user) return;
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const assigneeUid = getCurrentAssigneeUid(task);
    const isAdmin = data.adminUid === $user.uid;
    const creditUid = (isAdmin && assigneeUid && assigneeUid !== $user.uid) ? assigneeUid : $user.uid;
    const creditMember = getMemberByUid(data.members, creditUid);
    const completedByName = creditMember?.displayName || 'Unknown';
    await completeTaskInFirestore(houseId, taskId, data, creditUid, completedByName);
    if (task.rotation.length > 0) {
      const origUid = task.rotation[task.currentIndex % task.rotation.length];
      const isHelper = creditUid !== origUid && task.rotation.includes(creditUid);
      let nextRot: string[];
      if (isHelper) nextRot = [...task.rotation.filter(u => u !== creditUid), creditUid];
      else nextRot = [...task.rotation.filter(u => u !== origUid), origUid];
      const nextMember = getMemberByUid(data.members, nextRot[0]);
      if (nextMember) showToast(`✅ Done! ${nextMember.displayName} is next`);
    }
  }

  async function handleOverride(swapWithUid: string) {
    if (!houseId || !data || !overrideTaskId) return;
    await overrideCurrentAssignee(houseId, overrideTaskId, data, swapWithUid);
    overrideTaskId = null;
    showToast('🔄 Swapped for this turn only!');
  }

  async function handleRemind(taskId: string) {
    if (!houseId || !data || !$user) return;
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const aUid = getCurrentAssigneeUid(task);
    if (!aUid) return;
    const member = data.members.find((m) => m.uid === aUid);
    if (!member || !member.fcmTokens || member.fcmTokens.length === 0) {
      showToast('⚠️ Assignee has not enabled app notifications'); return;
    }
    try {
      const idToken = await $user.getIdToken();
      const apiBase = (import.meta.env.VITE_API_URL ?? window.location.origin).replace(/\/$/, '');
      await fetch(`${apiBase}/api/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ houseId, taskId }),
      });
      await triggerManualReminder(houseId, taskId, data);
      showToast('✅ Reminder sent to their phone!');
    } catch { showToast('⚠️ Failed to send reminder'); }
  }

  onDestroy(() => { if (unsub) unsub(); if (switchUnsub) switchUnsub(); });

  $: isAdmin = data ? data.adminUid === $user?.uid : false;
  $: today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  $: myTasks = data ? data.tasks.filter((t) => getCurrentAssigneeUid(t) === $user?.uid) : [];
  $: otherTasks = data ? data.tasks.filter((t) => getCurrentAssigneeUid(t) !== $user?.uid) : [];
  $: overrideTask = overrideTaskId && data ? data.tasks.find((t) => t.id === overrideTaskId) : null;
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Finding your house...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="dash-header">
      <div class="header-top">
        <div>
          <h1 class="pageTitle">🏠 {data.name}</h1>
          <p class="pageSubtitle">{today}</p>
        </div>
        <div class="header-actions">
          {#if allHouses.length > 1}
            <button class="switchBtn" on:click={() => showHousePicker = !showHousePicker}>↔</button>
          {/if}
          <button class="switchBtn" on:click={() => navigate('/join')}>+</button>
        </div>
      </div>

      {#if showHousePicker}
        <div class="housePicker">
          {#each allHouses as h (h.id)}
            <button
              class="houseOption {h.id === houseId ? 'houseActive' : ''}"
              on:click={() => switchHouse(h.id)}
            >
              <span>{h.data.name}</span>
              <span class="houseMembers">{h.data.members.length} 👤</span>
            </button>
          {/each}
        </div>
      {/if}
    </header>

    {#if myTasks.length > 0}
      <div class="section">
        <h2 class="sectionTitle">⚡ Your Tasks</h2>
        <div class="cardGrid">
          {#each myTasks as task (task.id)}
            <TaskCard
              {task} members={data.members}
              currentUserUid={$user.uid} {isAdmin}
              onComplete={handleComplete} onOverride={(id) => { overrideTaskId = id; }}
              onRemind={handleRemind}
            />
          {/each}
        </div>
      </div>
    {/if}

    {#if otherTasks.length > 0}
      <div class="section">
        <h2 class="sectionTitle">📋 All Tasks</h2>
        <div class="cardGrid">
          {#each otherTasks as task (task.id)}
            <TaskCard
              {task} members={data.members}
              currentUserUid={$user.uid} {isAdmin}
              onComplete={handleComplete} onOverride={(id) => { overrideTaskId = id; }}
              onRemind={handleRemind}
            />
          {/each}
        </div>
      </div>
    {/if}

    {#if myTasks.length === 0 && otherTasks.length === 0}
      <div class="emptyState">
        <span class="emptyIcon">🎉</span>
        <p>{isAdmin ? 'No tasks yet. Go to Admin to configure rotations.' : 'No tasks yet. Ask your admin to set up rotations.'}</p>
      </div>
    {/if}

    {#if overrideTask}
      <OverrideModal
        task={overrideTask} members={data.members}
        onSwap={handleOverride} onClose={() => { overrideTaskId = null; }}
      />
    {/if}
  </div>
{/if}

<style>
  .dash-header { margin-bottom: 28px; }

  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px 0;
  }

  .header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

  .switchBtn {
    width: 36px;
    height: 36px;
    border-radius: var(--r-sm);
    border: 1px solid var(--border);
    background: var(--bg-surface-1);
    color: var(--text-secondary);
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--duration-fast) ease;
  }

  .switchBtn:hover { background: var(--bg-surface-2); border-color: var(--border-hover); }

  .housePicker {
    margin-top: 8px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }

  .houseOption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: var(--text-primary);
    transition: background var(--duration-fast) ease;
    border-bottom: 1px solid var(--border);
    font-weight: 500;
  }

  .houseOption:last-child { border-bottom: none; }
  .houseOption:hover { background: var(--bg-surface-1); }
  .houseOption.houseActive { background: var(--accent-bg); color: var(--accent); font-weight: 700; }

  .houseMembers { font-size: 0.75rem; color: var(--text-muted); }
</style>
