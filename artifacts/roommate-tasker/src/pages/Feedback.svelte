<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { findHouseByUser, subscribeToHouse, addFeedback, updateFeedbackStatus } from '../lib/firestore';
  import type { HouseData, FeedbackItem } from '../lib/types';

  type Status = FeedbackItem['status'];
  const STATUS_LABELS: Record<Status, string> = { 'new': '💡 New', 'in-progress': '🔨 In Progress', 'done': '✅ Done' };
  const STATUS_ORDER: Status[] = ['new', 'in-progress', 'done'];

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let loading = true;
  let newText = '';
  let toast: string | null = null;
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
      unsub = subscribeToHouse(house.id, (d) => { data = d; loading = false; });
    } catch (err) { console.error(err); loading = false; }
  }

  function showToast(msg: string) { toast = msg; setTimeout(() => { toast = null; }, 3000); }

  async function handleAdd() {
    if (!newText.trim() || !houseId || !data || !$user) return;
    await addFeedback(houseId, data, newText.trim(), $user.uid, $user.displayName || 'Unknown');
    newText = '';
    showToast('💡 Feedback submitted!');
  }

  async function cycleStatus(item: FeedbackItem) {
    if (!data || !$user || data.adminUid !== $user.uid || !houseId) return;
    const idx = STATUS_ORDER.indexOf(item.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    await updateFeedbackStatus(houseId, data, item.id, next);
  }

  onDestroy(() => { if (unsub) unsub(); });

  $: feedback = data?.feedback || [];
  $: isAdmin = data ? data.adminUid === $user?.uid : false;
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading feedback...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="pageHeader">
      <h1 class="pageTitle">💬 Feedback</h1>
      <p class="pageSubtitle">Suggest improvements for the house</p>
    </header>

    <div class="addRow">
      <input
        class="inputField"
        placeholder="Suggest an idea or report an issue..."
        bind:value={newText}
        on:keydown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button class="btnPrimary btnSmall" on:click={handleAdd} disabled={!newText.trim()}>Send</button>
    </div>

    {#each STATUS_ORDER as status}
      {@const items = feedback.filter((f) => f.status === status)}
      {#if !(items.length === 0 && status === 'done')}
        <div class="section">
          <h2 class="sectionTitle">{STATUS_LABELS[status]} ({items.length})</h2>
          <div class="fbColumn">
            {#if items.length === 0}
              <p class="emptyCol">No items</p>
            {:else}
              {#each items as item (item.id)}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <div
                  class="fbCard {status === 'done' ? 'cardDone' : ''} {isAdmin ? 'cardClickable' : ''}"
                  on:click={() => cycleStatus(item)}
                  role="article"
                  on:keydown={(e) => e.key === 'Enter' && cycleStatus(item)}
                >
                  <p class="cardText">{item.text}</p>
                  <div class="cardMeta">
                    <span class="cardAuthor">{item.authorName}</span>
                    <span class="cardDate">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {#if isAdmin}
                    <span class="statusHint">
                      {status === 'new' ? 'Click → In Progress' : status === 'in-progress' ? 'Click → Done' : 'Click → Reopen'}
                    </span>
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    {#if feedback.length === 0}
      <div class="emptyState">
        <span class="emptyIcon">💬</span>
        <p>No feedback yet. Be the first to share an idea!</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .addRow { display: flex; gap: 10px; align-items: center; margin-bottom: 24px; }

  .fbColumn { display: flex; flex-direction: column; gap: 8px; }

  .emptyCol { font-size: 0.8rem; color: var(--text-muted); padding: 12px 0; }

  .fbCard {
    padding: 14px 16px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    transition: all var(--duration-fast) ease;
  }

  .fbCard.cardDone { opacity: 0.65; }
  .fbCard.cardClickable { cursor: pointer; }
  .fbCard.cardClickable:hover { background: var(--bg-surface-1); border-color: var(--border-hover); }

  .cardText { font-size: 0.88rem; color: var(--text-primary); margin-bottom: 8px; line-height: 1.45; }

  .cardMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .cardAuthor { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); }
  .cardDate { font-size: 0.7rem; color: var(--text-muted); }

  .statusHint {
    display: block;
    font-size: 0.65rem;
    color: var(--text-muted);
    font-style: italic;
    margin-top: 6px;
  }
</style>
