<script lang="ts">
  import type { Task, MemberProfile } from '../lib/types';
  import {
    getCurrentAssigneeUid, getUrgency, formatRelativeDate,
    getMemberByUid, getUpcomingRotation,
  } from '../lib/schedule';

  export let task: Task;
  export let members: MemberProfile[];
  export let currentUserUid: string;
  export let isAdmin: boolean;
  export let onComplete: (taskId: string) => void;
  export let onOverride: (taskId: string) => void;
  export let onRemind: ((taskId: string) => Promise<void>) | undefined = undefined;

  const AVATAR_COLORS = ['#7c6aef', '#34d399', '#f97316', '#3b82f6', '#ec4899', '#eab308'];

  let completing = false;
  let reminding = false;
  let showRotation = false;

  $: assigneeUid = getCurrentAssigneeUid(task);
  $: assignee = assigneeUid ? getMemberByUid(members, assigneeUid) : null;
  $: urgency = getUrgency(task);
  $: relativeDate = formatRelativeDate(task);
  $: isMyTurn = assigneeUid === currentUserUid;
  $: upcoming = getUpcomingRotation(task, members, 6);
  $: isSwapped = task.temporarySwap !== null;
  $: canComplete = isMyTurn || isAdmin;

  $: urgCls = urgency === 'overdue' ? 'urgOverdue' : urgency === 'due-today' ? 'urgToday' : urgency === 'upcoming' ? 'urgUpcoming' : 'urgManual';
  $: urgLabel = urgency === 'overdue' ? 'Overdue' : urgency === 'due-today' ? 'Today' : urgency === 'upcoming' ? 'Upcoming' : 'When Needed';

  function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getAvatarColor(uid: string): string {
    const idx = members.findIndex((m) => m.uid === uid);
    return AVATAR_COLORS[Math.max(0, idx) % AVATAR_COLORS.length];
  }

  function handleComplete() {
    if (!canComplete || completing) return;
    completing = true;
    setTimeout(() => { onComplete(task.id); completing = false; }, 800);
  }

  async function handleRemind() {
    if (!onRemind) return;
    reminding = true;
    await onRemind(task.id);
    setTimeout(() => { reminding = false; }, 2000);
  }
</script>

<div class="card" class:myTurn={isMyTurn} class:celebrating={completing}>
  <div class="accent {urgCls}"></div>

  <div class="cardBody">
    <div class="cardHeader">
      <span class="taskIcon">{task.icon}</span>
      <div class="titleGroup">
        <h3 class="taskName">{task.name}</h3>
        <div class="taskMeta">
          <span class="badge {urgCls}">{urgLabel}</span>
          {#if isSwapped}<span class="swapBadge">Swapped</span>{/if}
        </div>
      </div>
      {#if isMyTurn}<span class="yourTurn">YOUR TURN</span>{/if}
    </div>

    <div class="assigneeRow">
      <div class="assigneeLeft">
        {#if assignee?.photoURL}
          <div class="miniAvatar"><img src={assignee.photoURL} alt={assignee.displayName} referrerpolicy="no-referrer" /></div>
        {:else}
          <div class="miniAvatar" style="background:{assigneeUid ? getAvatarColor(assigneeUid) : '#94a3b8'}">
            {assignee ? getInitials(assignee.displayName) : '?'}
          </div>
        {/if}
        <div class="assigneeText">
          <span class="assigneeLabel">Assigned to</span>
          <span class="assigneeName">{assignee?.displayName || 'No one'}</span>
        </div>
      </div>
      <span class="dueTag">📅 {relativeDate}</span>
    </div>

    <button class="rotToggle" on:click={() => showRotation = !showRotation}>
      <span class="rotAvatars">
        {#each upcoming.slice(0, 4) as r, i}
          {@const m = getMemberByUid(members, r.uid)}
          <span class="miniAv" style="background:{getAvatarColor(r.uid)};z-index:{4 - i}">
            {#if m?.photoURL}
              <img src={m.photoURL} alt={r.name} referrerpolicy="no-referrer" />
            {:else}
              {getInitials(r.name)}
            {/if}
          </span>
        {/each}
      </span>
      <span class="rotLabel">{showRotation ? 'Hide' : 'Rotation'}</span>
      <span class="chevron">{showRotation ? '▴' : '▾'}</span>
    </button>

    {#if showRotation}
      <div class="rotList">
        {#each upcoming as r, i}
          <div class="rotItem" class:rotCurrent={i === 0} class:rotMe={r.uid === currentUserUid}>
            <span class="rotNum">{i === 0 ? '→' : i + 1}</span>
            <span class="rotDot" style="background:{getAvatarColor(r.uid)}"></span>
            <span class="rotName">{r.name}</span>
            {#if r.tentativeDate}
              <span class="rotDate">{new Date(r.tentativeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div class="actions">
      <button
        class="doneBtn"
        class:doneBtnActive={completing}
        class:doneBtnDisabled={!canComplete}
        on:click={handleComplete}
        disabled={!canComplete || completing}
        title={!canComplete ? `Only ${assignee?.displayName || 'the assigned person'} can mark this done` : ''}
      >
        {#if completing}✅ Done!
        {:else if isMyTurn}✓ Mark Done
        {:else if isAdmin}⚡ Admin Mark Done
        {:else}🔒 {assignee?.displayName || 'Assigned'}'s task
        {/if}
      </button>

      {#if onRemind && !isMyTurn && (urgency === 'manual' || urgency === 'due-today' || urgency === 'overdue')}
        <button
          class="remindBtn"
          on:click={handleRemind}
          disabled={task.manualReminderSent || reminding}
        >
          {task.manualReminderSent ? 'Reminded Today' : reminding ? 'Sent!' : '🔔 Remind'}
        </button>
      {/if}

      {#if isAdmin}
        <button class="overrideBtn" on:click={() => onOverride(task.id)} title="Swap assignee (one-time)">🔄</button>
      {/if}
    </div>

    {#if task.lastCompletedBy}
      <p class="lastDone">Last done by <strong>{task.lastCompletedBy}</strong></p>
    {/if}
  </div>
</div>

<style>
  .card {
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    overflow: hidden;
    transition: all var(--duration-md) var(--ease-out);
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  .card.myTurn {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 2px rgba(51,65,85,0.06), 0 2px 8px rgba(0,0,0,0.06);
  }

  @keyframes celebrate {
    0% { transform: scale(1); }
    40% { transform: scale(1.03) rotate(1deg); }
    100% { transform: scale(1); }
  }

  .card.celebrating { animation: celebrate 0.8s var(--ease-spring); }

  .accent { height: 4px; width: 100%; }
  .accent.urgOverdue { background: #ef4444; }
  .accent.urgToday { background: #eab308; }
  .accent.urgUpcoming { background: #22c55e; }
  .accent.urgManual { background: var(--text-muted); }

  .cardBody { padding: 14px; }

  .cardHeader {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
  }

  .taskIcon { font-size: 1.4rem; flex-shrink: 0; line-height: 1.2; }

  .titleGroup { flex: 1; min-width: 0; }
  .taskName { font-size: 0.92rem; font-weight: 700; color: var(--text-primary); margin-bottom: 5px; line-height: 1.2; }

  .taskMeta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

  .badge { padding: 2px 8px; border-radius: 6px; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  .badge.urgOverdue { background: #fee2e2; color: #ef4444; }
  .badge.urgToday { background: #fef9c3; color: #ca8a04; }
  .badge.urgUpcoming { background: #dcfce7; color: #16a34a; }
  .badge.urgManual { background: var(--bg-surface-2); color: var(--text-muted); }

  .swapBadge { padding: 2px 8px; border-radius: 6px; font-size: 0.62rem; font-weight: 700; background: #fef3c7; color: #d97706; }

  .yourTurn {
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 3px 8px;
    border-radius: var(--r-full);
    flex-shrink: 0;
    align-self: flex-start;
  }

  .assigneeRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    padding: 8px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .assigneeLeft { display: flex; align-items: center; gap: 8px; }

  .miniAvatar {
    width: 32px; height: 32px;
    border-radius: var(--r-xs);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.65rem; color: white;
    flex-shrink: 0; overflow: hidden;
  }

  .miniAvatar img { width: 100%; height: 100%; object-fit: cover; }

  .assigneeText { display: flex; flex-direction: column; gap: 1px; }
  .assigneeLabel { font-size: 0.62rem; color: var(--text-muted); }
  .assigneeName { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }

  .dueTag { font-size: 0.72rem; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

  .rotToggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 6px 10px;
    cursor: pointer;
    width: 100%;
    margin-bottom: 8px;
    transition: background var(--duration-fast);
    font-family: var(--font-sans);
  }

  .rotToggle:hover { background: var(--bg-surface-2); }

  .rotAvatars { display: flex; }

  .miniAv {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.55rem; color: white;
    margin-left: -4px;
    border: 1.5px solid white;
    overflow: hidden;
    flex-shrink: 0;
  }

  .miniAv:first-child { margin-left: 0; }
  .miniAv img { width: 100%; height: 100%; object-fit: cover; }

  .rotLabel { font-size: 0.72rem; color: var(--text-secondary); font-weight: 500; flex: 1; text-align: left; }
  .chevron { font-size: 0.65rem; color: var(--text-muted); }

  .rotList {
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: var(--r-sm);
    padding: 6px 0;
    margin-bottom: 8px;
  }

  .rotItem {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    font-size: 0.78rem;
    transition: background var(--duration-fast);
  }

  .rotItem.rotCurrent { background: var(--accent-bg); font-weight: 700; }
  .rotItem.rotMe { color: var(--accent-soft); }

  .rotNum { width: 18px; font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-align: center; flex-shrink: 0; }
  .rotDot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rotName { flex: 1; color: var(--text-primary); }
  .rotDate { font-size: 0.7rem; color: var(--text-muted); }

  .actions { display: flex; gap: 6px; align-items: center; }

  .doneBtn {
    flex: 1;
    padding: 9px 14px;
    border-radius: var(--r-sm);
    border: none;
    background: var(--gradient-primary);
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast);
    text-align: center;
  }

  .doneBtn:hover { opacity: 0.9; transform: translateY(-1px); }
  .doneBtn.doneBtnActive { background: linear-gradient(135deg, #16a34a, #22c55e); }
  .doneBtn.doneBtnDisabled { background: var(--bg-surface-2); color: var(--text-muted); cursor: default; transform: none; }
  .doneBtn:disabled { cursor: default; }

  .remindBtn {
    padding: 9px 12px;
    border-radius: var(--r-sm);
    border: 1px solid var(--border);
    background: white;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast);
    flex: 1;
    white-space: nowrap;
  }

  .remindBtn:hover { background: var(--bg-surface-1); }
  .remindBtn:disabled { opacity: 0.5; cursor: default; }

  .overrideBtn {
    width: 36px; height: 36px;
    border-radius: var(--r-sm);
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background var(--duration-fast);
  }

  .overrideBtn:hover { background: var(--bg-surface-2); }

  .lastDone {
    margin-top: 8px;
    font-size: 0.72rem;
    color: var(--text-muted);
    text-align: right;
  }
</style>
