<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import {
    findHouseByUser, subscribeToHouse,
    addShoppingItem, claimShoppingItem, unclaimShoppingItem,
    completeShoppingItem, removeShoppingItem,
  } from '../lib/firestore';
  import type { HouseData, ShoppingItem } from '../lib/types';

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let loading = true;
  let newItem = '';
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
    if (!newItem.trim() || !houseId || !data || !$user) return;
    await addShoppingItem(houseId, data, newItem.trim(), $user.uid, $user.displayName || 'Unknown');
    newItem = '';
    showToast('🛒 Item added!');
  }

  async function handleClaim(item: ShoppingItem) {
    if (!houseId || !data || !$user) return;
    if (item.claimedByUid === $user.uid) {
      await unclaimShoppingItem(houseId, data, item.id);
    } else if (!item.claimedByUid) {
      await claimShoppingItem(houseId, data, item.id, $user.uid, $user.displayName || 'Unknown');
      showToast(`👋 You'll get ${item.text}`);
    }
  }

  async function handleComplete(itemId: string) {
    if (!houseId || !data) return;
    await completeShoppingItem(houseId, data, itemId);
    showToast('✅ Item done!');
  }

  async function handleRemove(itemId: string) {
    if (!houseId || !data) return;
    await removeShoppingItem(houseId, data, itemId);
  }

  function handleKeydown(e: KeyboardEvent) { if (e.key === 'Enter') handleAdd(); }

  onDestroy(() => { if (unsub) unsub(); });

  $: list = data?.shoppingList || [];
  $: active = list.filter((s) => !s.completed);
  $: completed = list.filter((s) => s.completed);
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading list...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="pageHeader">
      <h1 class="pageTitle">🛒 Shopping List</h1>
      <p class="pageSubtitle">Request items for the apartment</p>
    </header>

    <div class="addRow">
      <input
        class="inputField"
        placeholder="Paper towels, trash bags, etc..."
        bind:value={newItem}
        on:keydown={handleKeydown}
      />
      <button class="btnPrimary btnSmall" on:click={handleAdd} disabled={!newItem.trim()}>Add</button>
    </div>

    {#if active.length > 0}
      <div class="section">
        <h2 class="sectionTitle">📝 To Buy ({active.length})</h2>
        <div class="shopList">
          {#each active as item (item.id)}
            {@const isMyClaim = item.claimedByUid === $user.uid}
            {@const isClaimed = !!item.claimedByUid}
            <div class="shopItem {isMyClaim ? 'itemMyClaim' : ''}">
              <div class="itemMain">
                <span class="itemText">{item.text}</span>
                <div class="itemMeta">
                  <span class="itemBy">Added by {item.addedByName}</span>
                  {#if isClaimed}
                    <span class="claimTag">{isMyClaim ? '🙋 You' : `🙋 ${item.claimedByName}`}</span>
                  {/if}
                </div>
              </div>
              <div class="itemActions">
                {#if isMyClaim}
                  <button class="actionBtn" on:click={() => handleComplete(item.id)} title="Done">✅</button>
                  <button class="actionBtn" on:click={() => handleClaim(item)} title="Unclaim">↩</button>
                {:else if !isClaimed}
                  <button class="claimBtn" on:click={() => handleClaim(item)}>I'll get it</button>
                {/if}
                {#if item.addedByUid === $user.uid || data.adminUid === $user.uid}
                  <button class="actionBtn" on:click={() => handleRemove(item.id)} title="Remove">✕</button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if completed.length > 0}
      <div class="section">
        <h2 class="sectionTitle">✅ Got It ({completed.length})</h2>
        <div class="shopList">
          {#each completed as item (item.id)}
            <div class="shopItem itemCompleted">
              <div class="itemMain">
                <span class="itemText itemTextDone">{item.text}</span>
                <span class="itemBy">{item.claimedByName || item.addedByName}</span>
              </div>
              {#if item.addedByUid === $user.uid || data.adminUid === $user.uid}
                <button class="actionBtn" on:click={() => handleRemove(item.id)}>✕</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if list.length === 0}
      <div class="emptyState">
        <span class="emptyIcon">🛍️</span>
        <p>No items needed right now. Add something!</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .addRow { display: flex; gap: 10px; align-items: center; margin-bottom: 24px; }

  .shopList { display: flex; flex-direction: column; gap: 8px; }

  .shopItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    transition: border-color var(--duration-fast) ease;
  }

  .shopItem.itemMyClaim { border-color: var(--accent-border); background: var(--accent-bg); }
  .shopItem.itemCompleted { opacity: 0.6; }

  .itemMain { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }

  .itemText { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
  .itemTextDone { text-decoration: line-through; color: var(--text-muted); }

  .itemMeta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .itemBy { font-size: 0.72rem; color: var(--text-muted); }

  .claimTag {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 8px;
    background: var(--accent-bg);
    color: var(--accent-soft);
    border-radius: var(--r-full);
  }

  .itemActions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }

  .actionBtn {
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    border-radius: var(--r-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--duration-fast) ease;
    color: var(--text-muted);
  }

  .actionBtn:hover { background: var(--bg-surface-2); }

  .claimBtn {
    padding: 6px 12px;
    border-radius: var(--r-sm);
    border: 1px solid var(--accent-border);
    background: var(--accent-bg);
    color: var(--accent-soft);
    font-size: 0.75rem;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
    white-space: nowrap;
  }

  .claimBtn:hover { background: rgba(51,65,85,0.1); }
</style>
