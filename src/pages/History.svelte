<script lang="ts">
  import { onMount } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { fetchTaskHistory } from '../lib/api';
  import type { TaskHistoryItem } from '../lib/types';

  let loading = true;
  let historyItems: TaskHistoryItem[] = [];

  onMount(async () => {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); return; }
      historyItems = await fetchTaskHistory();
      loading = false;
    }
  });

  $: if (!$authLoading && !$user) navigate('/login');
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading history...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    <header class="pageHeader">
      <h1 class="pageTitle">📋 History</h1>
      <p class="pageSubtitle">Past task completions</p>
    </header>

    <div class="filters">
      <button
        class="filterBtn {filterTask === 'all' ? 'filterActive' : ''}"
        on:click={() => filterTask = 'all'}
      >All</button>
      {#each data.tasks as task (task.id)}
        <button
          class="filterBtn {filterTask === task.id ? 'filterActive' : ''}"
          on:click={() => filterTask = task.id}
        >{task.icon} {task.name}</button>
      {/each}
    </div>

    {#if allEntries.length === 0}
      <div class="emptyState">
        <span class="emptyIcon">📋</span>
        <p>No completions logged yet.</p>
      </div>
    {:else}
      <div class="histList">
        {#each allEntries as entry, i (i)}
          <div class="histEntry">
            <div class="entryDot" style="background:{getAvatarColor(entry.uid)}"></div>
            <div class="entryContent">
              <div class="entryTop">
                <span class="entryTask">{entry.taskIcon} {entry.taskName}</span>
                <span class="entryDate">{formatDate(entry.date)}</span>
              </div>
              <span class="entryName">{entry.name}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <button class="btnGhost" on:click={() => navigate('/settings')} style="margin-top:20px;width:100%;display:flex;justify-content:center">
      ← Back to Settings
    </button>
  </div>
{/if}

<style>
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }

  .filterBtn {
    padding: 6px 14px;
    border-radius: var(--r-full);
    border: 1px solid var(--border);
    background: white;
    color: var(--text-secondary);
    font-size: 0.78rem;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .filterBtn:hover { border-color: var(--border-hover); background: var(--bg-surface-1); }

  .filterBtn.filterActive {
    background: var(--accent-bg);
    border-color: var(--accent-border);
    color: var(--accent-soft);
  }

  .histList { display: flex; flex-direction: column; gap: 0; }

  .histEntry {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }

  .histEntry:last-child { border-bottom: none; }

  .entryDot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  .entryContent { flex: 1; }

  .entryTop {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 3px;
  }

  .entryTask { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); }
  .entryDate { font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0; }
  .entryName { font-size: 0.78rem; color: var(--text-secondary); }
</style>
