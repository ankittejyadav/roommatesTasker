<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import {
    findHouseByUser, subscribeToHouse,
    updateTaskRotation, updateTaskFrequency, updateHouseName,
    removeMemberFromHouse, addTask, deleteTask,
  } from '../lib/firestore';
  import type { HouseData } from '../lib/types';

  const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let loading = true;
  let toast: string | null = null;
  let editingName = false;
  let newName = '';
  let confirmRemove: string | null = null;
  let confirmDeleteTask: string | null = null;
  let showAddTask = false;
  let newTaskName = '';
  let newTaskIcon = '';
  let newTaskFreq = '7';
  let newTaskNoFreq = false;
  let addingTask = false;
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
      if (house.data.adminUid !== $user!.uid) { navigate('/'); return; }
      houseId = house.id;
      newName = house.data.name;
      unsub = subscribeToHouse(house.id, (d) => { data = d; loading = false; });
    } catch (err) { console.error(err); loading = false; }
  }

  function showToast(msg: string) { toast = msg; setTimeout(() => { toast = null; }, 3000); }

  async function handleSaveName() {
    if (!newName.trim() || !houseId) return;
    await updateHouseName(houseId, newName.trim());
    editingName = false;
    showToast('✅ Name updated');
  }

  async function handleRemoveMember(uid: string) {
    if (!houseId || !data) return;
    await removeMemberFromHouse(houseId, data, uid);
    confirmRemove = null;
    showToast('✅ Member removed');
  }

  async function toggleInRotation(taskId: string, uid: string) {
    if (!houseId || !data) return;
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;
    let rotation = [...task.rotation];
    if (rotation.includes(uid)) {
      if (rotation.length <= 1) return;
      rotation = rotation.filter((r) => r !== uid);
    } else { rotation.push(uid); }
    await updateTaskRotation(houseId, taskId, data, rotation);
  }

  async function handleFrequencyChange(taskId: string, days: number) {
    if (!houseId || !data) return;
    await updateTaskFrequency(houseId, taskId, data, days);
    showToast('✅ Frequency updated');
  }

  async function handleAddTask() {
    if (!newTaskName.trim() || !houseId || !data) return;
    addingTask = true;
    try {
      const freq = newTaskNoFreq ? null : (parseInt(newTaskFreq) || 7);
      await addTask(houseId, data, newTaskName.trim(), newTaskIcon.trim() || '📋', freq);
      newTaskName = ''; newTaskIcon = ''; newTaskFreq = '7'; newTaskNoFreq = false;
      showAddTask = false;
      showToast('✅ Task added');
    } catch { showToast('❌ Failed to add task'); }
    finally { addingTask = false; }
  }

  async function handleDeleteTask(taskId: string) {
    if (!houseId || !data) return;
    try {
      await deleteTask(houseId, data, taskId);
      confirmDeleteTask = null;
      showToast('✅ Task deleted');
    } catch { showToast('❌ Failed to delete task'); }
  }

  onDestroy(() => { if (unsub) unsub(); });
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading admin...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="pageHeader">
      <h1 class="pageTitle">🔧 Admin Panel</h1>
      <p class="pageSubtitle">Manage your household</p>
    </header>

    <div class="section">
      <h2 class="sectionTitle">House Info</h2>
      <div class="glassCard">
        {#if editingName}
          <div class="editRow">
            <input class="inputField" bind:value={newName}
              on:keydown={(e) => e.key === 'Enter' && handleSaveName()} />
            <button class="btnPrimary btnSmall" on:click={handleSaveName}>Save</button>
          </div>
        {:else}
          <div class="infoRow" on:click={() => editingName = true} role="button" tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && (editingName = true)}>
            <span class="infoLabel">Name</span>
            <span class="infoValue">{data.name} ✏️</span>
          </div>
        {/if}
        <div class="infoRow">
          <span class="infoLabel">Invite Code</span>
          <span class="inviteCode">{data.inviteCode}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="sectionTitle">Members ({data.members.length})</h2>
      <div class="membersList">
        {#each data.members as member, i (member.uid)}
          <div class="memberCard">
            <div class="memberLeft">
              <div class="memberAvatar" style="background:{AVATAR_COLORS[i % AVATAR_COLORS.length]}">
                {#if member.photoURL}
                  <img src={member.photoURL} alt={member.displayName} referrerpolicy="no-referrer" />
                {:else}
                  {member.displayName[0].toUpperCase()}
                {/if}
              </div>
              <div class="memberInfo">
                <span class="memberName">
                  {member.displayName}
                  {#if member.uid === data.adminUid}<span class="adminBadge">Admin</span>{/if}
                </span>
                <span class="memberEmail">{member.email}</span>
              </div>
            </div>
            {#if member.uid !== $user.uid}
              {#if confirmRemove === member.uid}
                <div class="confirmActions">
                  <button class="confirmYes" on:click={() => handleRemoveMember(member.uid)}>Remove</button>
                  <button class="confirmNo" on:click={() => confirmRemove = null}>Cancel</button>
                </div>
              {:else}
                <button class="removeBtn" on:click={() => confirmRemove = member.uid}>✕</button>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <hr class="divider" />

    <div class="section">
      <div class="tasksSectionHeader">
        <h2 class="sectionTitle" style="margin-bottom:0">Chore Tasks</h2>
        <button class="addTaskBtn" on:click={() => showAddTask = !showAddTask}>
          {showAddTask ? '✕ Cancel' : '+ Add Task'}
        </button>
      </div>

      {#if showAddTask}
        <div class="addTaskForm">
          <div class="addTaskRow">
            <input class="inputField iconInput" placeholder="Icon (emoji)"
              bind:value={newTaskIcon} maxlength="4" />
            <input class="inputField nameInput" placeholder="Task name (e.g. Mop Floor)"
              bind:value={newTaskName}
              on:keydown={(e) => e.key === 'Enter' && handleAddTask()} />
          </div>
          <div class="freqRow">
            <span class="freqLabel">Frequency</span>
            {#if !newTaskNoFreq}
              <button class="freqBtn" on:click={() => newTaskFreq = String(Math.max(1, (parseInt(newTaskFreq) || 7) - 1))}>−</button>
              <span class="freqValue">{newTaskFreq} days</span>
              <button class="freqBtn" on:click={() => newTaskFreq = String((parseInt(newTaskFreq) || 7) + 1)}>+</button>
            {/if}
            <label class="noFreqLabel">
              <input type="checkbox" bind:checked={newTaskNoFreq} />
              On completion only
            </label>
          </div>
          <button class="btnPrimary btnSmall" on:click={handleAddTask}
            disabled={!newTaskName.trim() || addingTask}>
            {addingTask ? 'Adding…' : 'Add Task'}
          </button>
        </div>
      {/if}
    </div>

    {#each data.tasks as task (task.id)}
      <div class="section">
        <div class="taskHeader">
          <h2 class="sectionTitle" style="margin-bottom:0">{task.icon} {task.name}</h2>
          {#if confirmDeleteTask === task.id}
            <div class="confirmActions">
              <button class="confirmYes" on:click={() => handleDeleteTask(task.id)}>Delete</button>
              <button class="confirmNo" on:click={() => confirmDeleteTask = null}>Cancel</button>
            </div>
          {:else}
            <button class="removeBtn" on:click={() => confirmDeleteTask = task.id}>🗑</button>
          {/if}
        </div>

        {#if task.frequencyDays !== null}
          <div class="freqRow" style="margin-bottom:12px">
            <span class="freqLabel">Every</span>
            <button class="freqBtn" on:click={() => handleFrequencyChange(task.id, Math.max(1, (task.frequencyDays || 7) - 1))}>−</button>
            <span class="freqValue">{task.frequencyDays} days</span>
            <button class="freqBtn" on:click={() => handleFrequencyChange(task.id, (task.frequencyDays || 7) + 1)}>+</button>
          </div>
        {:else}
          <p class="note" style="margin-bottom:12px">No frequency — rotation advances on completion.</p>
        {/if}

        <div class="chipGrid">
          <p class="chipLabel">Tap to add/remove from rotation</p>
          <div class="chips">
            {#each data.members as member, i (member.uid)}
              {@const inRotation = task.rotation.includes(member.uid)}
              {@const position = task.rotation.indexOf(member.uid)}
              <button
                class="chip {inRotation ? 'chipActive' : ''}"
                on:click={() => toggleInRotation(task.id, member.uid)}
              >
                <span class="chipDot" style="background:{AVATAR_COLORS[i % AVATAR_COLORS.length]}"></span>
                <span>{member.displayName}</span>
                {#if inRotation}<span class="chipPos">#{position + 1}</span>{/if}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .editRow { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }

  .infoRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
  }

  .infoRow:last-child { border-bottom: none; }
  .infoLabel { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
  .infoValue { font-size: 0.85rem; color: var(--text-primary); font-weight: 600; }

  .inviteCode {
    font-family: monospace;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 4px 10px;
    border-radius: var(--r-xs);
  }

  .membersList { display: flex; flex-direction: column; gap: 8px; }

  .memberCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    gap: 12px;
  }

  .memberLeft { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }

  .memberAvatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.85rem; color: white;
    flex-shrink: 0; overflow: hidden;
  }

  .memberAvatar img { width: 100%; height: 100%; object-fit: cover; }

  .memberInfo { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .memberName { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
  .memberEmail { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .adminBadge {
    font-size: 0.6rem;
    background: var(--accent-bg);
    color: var(--accent-soft);
    padding: 2px 6px;
    border-radius: var(--r-full);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .confirmActions { display: flex; gap: 6px; }
  .confirmYes { padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: var(--r-xs); font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); }
  .confirmNo { padding: 5px 10px; background: var(--bg-surface-2); color: var(--text-muted); border: 1px solid var(--border); border-radius: var(--r-xs); font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: var(--font-sans); }

  .removeBtn { background: transparent; border: none; cursor: pointer; font-size: 1rem; padding: 4px 8px; color: var(--text-muted); border-radius: var(--r-xs); transition: background var(--duration-fast); }
  .removeBtn:hover { background: var(--danger-bg); color: #ef4444; }

  .tasksSectionHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }

  .addTaskBtn {
    padding: 7px 14px;
    border-radius: var(--r-sm);
    border: 1px solid var(--accent-border);
    background: var(--accent-bg);
    color: var(--accent-soft);
    font-size: 0.78rem;
    font-weight: 700;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast);
  }

  .addTaskForm {
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .addTaskRow { display: flex; gap: 8px; }
  .iconInput { width: 70px !important; flex-shrink: 0; text-align: center; }
  .nameInput { flex: 1; }

  .freqRow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .freqLabel { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; }
  .freqBtn { width: 28px; height: 28px; border: 1px solid var(--border); background: white; border-radius: var(--r-xs); cursor: pointer; font-size: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .freqValue { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); min-width: 52px; text-align: center; }
  .noFreqLabel { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-muted); cursor: pointer; }

  .taskHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }

  .note { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }

  .chipGrid { margin-top: 8px; }
  .chipLabel { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }

  .chipDot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .chipPos { font-size: 0.6rem; font-weight: 700; color: var(--accent-soft); }
</style>
