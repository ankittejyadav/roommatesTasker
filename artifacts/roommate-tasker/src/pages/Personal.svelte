<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { findHouseByUser, subscribeToHouse, overrideCurrentAssignee, completeTaskInFirestore } from '../lib/firestore';
  import { getCurrentAssigneeUid, getUrgency, getMemberByUid } from '../lib/schedule';
  import type { HouseData } from '../lib/types';
  import TaskCard from '../components/TaskCard.svelte';
  import OverrideModal from '../components/OverrideModal.svelte';

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let loading = true;
  let toast: string | null = null;
  let overrideTaskId: string | null = null;
  let unsub: (() => void) | null = null;

  $: {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); }
      else if (!initialized) { initialized = true; init(); }
    }
  }

  async function init() {
    try {
      const house = await findHouseByUser($user!.uid);
      if (!house) { navigate('/join'); return; }
      houseId = house.id;
      unsub = subscribeToHouse(house.id, (houseData) => {
        if (houseData) data = houseData;
        loading = false;
      });
    } catch (err) { console.error('Personal init error:', err); loading = false; }
  }

  function showToast(msg: string) { toast = msg; setTimeout(() => { toast = null; }, 3000); }

  async function handleComplete(taskId: string) {
    if (!houseId || !data || !$user) return;
    const completedByName = getMemberByUid(data.members, $user.uid)?.displayName || $user.displayName || 'Unknown';
    await completeTaskInFirestore(houseId, taskId, data, $user.uid, completedByName);
    showToast('✅ Task Completed!');
  }

  async function handleOverride(swapWithUid: string) {
    if (!houseId || !data || !overrideTaskId) return;
    await overrideCurrentAssignee(houseId, overrideTaskId, data, swapWithUid);
    overrideTaskId = null;
  }

  onDestroy(() => { if (unsub) unsub(); });

  $: isAdmin = data ? data.adminUid === $user?.uid : false;
  $: myTasks = (data && $user) ? data.tasks.filter((t) => getCurrentAssigneeUid(t) === $user!.uid) : [];
  $: overdueTasks = myTasks.filter((t) => getUrgency(t) === 'overdue');
  $: todayTasks = myTasks.filter((t) => getUrgency(t) === 'due-today');
  $: upcomingTasks = myTasks.filter((t) => getUrgency(t) === 'upcoming');
  $: completedToday = (() => {
    if (!data || !$user) return [];
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    return data.tasks.flatMap(task =>
      (task.history || [])
        .filter(h => h.uid === $user!.uid && new Date(h.date) >= todayStart)
        .map(h => ({ ...task, completionDate: h.date }))
    );
  })();
  $: overrideTask = overrideTaskId && data ? data.tasks.find((t) => t.id === overrideTaskId) : null;
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading My Tasks...</p></div>
{:else if data && $user}
  <div class="pageWrapper" style="max-width:560px">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="pageHeader">
      <h1 class="pageTitle">👤 My Tasks</h1>
    </header>

    {#if overdueTasks.length > 0}
      <div class="section">
        <h2 class="sectionTitle">Overdue Task</h2>
        <div class="cardGrid">
          {#each overdueTasks as task (task.id)}
            <TaskCard {task} members={data.members} currentUserUid={$user.uid} {isAdmin}
              onComplete={handleComplete} onOverride={(id) => { overrideTaskId = id; }} />
          {/each}
        </div>
      </div>
    {/if}

    {#if todayTasks.length > 0}
      <div class="section">
        <h2 class="sectionTitle">Today's Task (My Turn)</h2>
        <div class="cardGrid">
          {#each todayTasks as task (task.id)}
            <TaskCard {task} members={data.members} currentUserUid={$user.uid} {isAdmin}
              onComplete={handleComplete} onOverride={(id) => { overrideTaskId = id; }} />
          {/each}
        </div>
      </div>
    {/if}

    {#if upcomingTasks.length > 0}
      <div class="section">
        <h2 class="sectionTitle">Upcoming Task</h2>
        <div class="cardGrid">
          {#each upcomingTasks as task (task.id)}
            <TaskCard {task} members={data.members} currentUserUid={$user.uid} {isAdmin}
              onComplete={handleComplete} onOverride={(id) => { overrideTaskId = id; }} />
          {/each}
        </div>
      </div>
    {/if}

    {#if completedToday.length > 0}
      <div class="section">
        <h2 class="sectionTitle">Completed Task (Celebrating)</h2>
        <div class="completedList">
          {#each completedToday as t, idx (idx)}
            <div class="completedCard">
              <div class="checkCircle">✓</div>
              <div class="completedInfo">
                <h3 class="completedTitle">{t.name}</h3>
                <p class="completedSub">Completed today</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if myTasks.length === 0 && completedToday.length === 0}
      <div class="emptyState">
        <span class="emptyIcon">🎉</span>
        <p>You are all caught up for today!</p>
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
  .completedList { display: flex; flex-direction: column; gap: 8px; }

  .completedCard {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--r-md);
  }

  .checkCircle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #16a34a;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .completedTitle { font-weight: 700; font-size: 0.9rem; color: #15803d; }
  .completedSub { font-size: 0.75rem; color: #166534; margin-top: 2px; }
</style>
