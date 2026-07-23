<script lang="ts">
  import { onMount } from 'svelte';
  import { user, activeGroup, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { fetchActiveGroup, markTaskDone } from '../lib/api';

  let loading = true;
  let toast: string | null = null;

  onMount(async () => {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); return; }
      const group = await fetchActiveGroup();
      if (!group) { navigate('/join'); }
      loading = false;
    }
  });

  $: if (!$authLoading && !$user) navigate('/login');

  async function handleComplete(taskId: string) {
    const success = await markTaskDone(taskId);
    if (success) {
      toast = 'Task marked as done!';
      setTimeout(() => { toast = null; }, 3000);
    }
  }
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading Dashboard...</p></div>
{:else if $activeGroup && $user}
  <div class="pageWrapper">
    {#if toast}
      <div class="toastBanner">{toast}</div>
    {/if}

    <header class="pageHeader">
      <div>
        <h1 class="pageTitle">{$activeGroup.name}</h1>
        <p class="pageSubtitle">Invite Code: <strong>{$activeGroup.inviteCode}</strong></p>
      </div>
    </header>

    <section class="taskSection">
      <h2 class="sectionTitle">Current Tasks</h2>
      {#if $activeGroup.tasks.length === 0}
        <div class="emptyCard">
          <p>No tasks added to this group yet.</p>
        </div>
      {:else}
        <div class="taskList">
          {#each $activeGroup.tasks as task (task.id)}
            <div class="taskCard">
              <div class="taskHeader">
                <span class="taskIcon">{task.icon}</span>
                <div class="taskInfo">
                  <h3>{task.name}</h3>
                  <p class="taskSub">
                    {#if task.frequencyDays}
                      Every {task.frequencyDays} days
                    {:else}
                      Manual / When needed
                    {/if}
                  </p>
                </div>
              </div>
              <div class="taskFooter">
                <button class="btnPrimary" on:click={() => handleComplete(task.id)}>
                  ✓ Mark Done
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>
{/if}

<style>
  .toastBanner {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #34d399;
    color: #064e3b;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 700;
    z-index: 100;
  }
  .taskSection { margin-top: 24px; }
  .sectionTitle { font-size: 1.1rem; margin-bottom: 12px; color: var(--text-secondary); }
  .taskList { display: flex; flex-direction: column; gap: 12px; }
  .taskCard {
    background: white;
    border-radius: 16px;
    padding: 16px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .taskHeader { display: flex; align-items: center; gap: 12px; }
  .taskIcon { font-size: 1.8rem; }
  .taskInfo h3 { font-size: 1rem; font-weight: 700; margin-bottom: 2px; }
  .taskInfo p { font-size: 0.75rem; color: var(--text-muted); }
  .btnPrimary {
    background: var(--accent);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
  }
  .emptyCard {
    background: white;
    padding: 24px;
    border-radius: 16px;
    text-align: center;
    color: var(--text-muted);
  }
</style>
