<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { findAllHousesByUser, joinHouse, createHouse } from '../lib/firestore';
  import type { HouseData } from '../lib/types';

  let mode: 'join' | 'create' = 'join';
  let code = '';
  let houseName = '';
  let error = '';
  let submitting = false;
  let popularHouses: { id: string; data: HouseData }[] = [];
  let initialized = false;

  $: {
    if (!$authLoading) {
      if (!$user) {
        navigate('/login');
      } else if (!initialized) {
        initialized = true;
        findAllHousesByUser($user.uid).then(h => { popularHouses = h; }).catch(() => {});
      }
    }
  }

  async function handleJoin(inviteCode?: string) {
    const codeToUse = inviteCode || code.trim();
    if (!codeToUse) { error = 'Enter an invite code'; return; }
    submitting = true;
    error = '';
    try {
      const houseId = await joinHouse(codeToUse, $user!.uid, $user!.displayName || 'User', $user!.email || '', $user!.photoURL);
      if (!houseId) { error = 'House not found. Check the code.'; submitting = false; return; }
      navigate('/');
    } catch { error = 'Something went wrong.'; submitting = false; }
  }

  async function handleCreate() {
    submitting = true;
    error = '';
    try {
      await createHouse($user!.uid, $user!.displayName || 'User', $user!.email || '', $user!.photoURL, houseName.trim());
      navigate('/');
    } catch { error = 'Something went wrong.'; submitting = false; }
  }

  function handleCodeKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleJoin();
  }

  function handleNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleCreate();
  }
</script>

{#if $authLoading || !$user}
  <div class="loadingPage"><div class="spinner"></div><p>Loading...</p></div>
{:else}
  <div class="pageWrapper">
    <header class="pageHeader">
      <h1 class="pageTitle">🏠 Get Started</h1>
      <p class="pageSubtitle">Join an existing house or create a new one</p>
    </header>

    <div class="toggle">
      <button class="toggleBtn {mode === 'join' ? 'toggleActive' : ''}" on:click={() => { mode = 'join'; error = ''; }}>
        Join House
      </button>
      <button class="toggleBtn {mode === 'create' ? 'toggleActive' : ''}" on:click={() => { mode = 'create'; error = ''; }}>
        Create House
      </button>
    </div>

    {#if mode === 'join'}
      <div class="section">
        <div class="inputGroup">
          <label class="inputLabel" for="invite-code">Invite Code</label>
          <input
            id="invite-code"
            class="inputField"
            placeholder="e.g. ABC123"
            bind:value={code}
            on:input={() => code = code.toUpperCase()}
            on:keydown={handleCodeKeydown}
            maxlength="8"
            style="text-transform:uppercase;letter-spacing:0.15em;font-weight:700"
          />
        </div>
        {#if error}<p class="errMsg">{error}</p>{/if}
        <button class="btnPrimary" on:click={() => handleJoin()} disabled={submitting}>
          {submitting ? 'Joining...' : '🚪 Join House'}
        </button>

        {#if popularHouses.length > 0}
          <div class="popular">
            <h3 class="sectionTitle">🏠 My Houses</h3>
            <div class="popularList">
              {#each popularHouses as h (h.id)}
                <button class="popularCard" on:click={() => navigate('/')} disabled={submitting}>
                  <div class="popularInfo">
                    <span class="popularName">{h.data.name}</span>
                    <span class="popularMembers">{h.data.members.length} members</span>
                  </div>
                  <span class="popularJoin">Open →</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="section">
        <div class="inputGroup">
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="inputLabel" for="house-name">House Name</label>
          <input
            id="house-name"
            class="inputField"
            placeholder="Our Apartment"
            bind:value={houseName}
            on:keydown={handleNameKeydown}
          />
        </div>
        {#if error}<p class="errMsg">{error}</p>{/if}
        <button class="btnPrimary" on:click={handleCreate} disabled={submitting}>
          {submitting ? 'Creating...' : '🏠 Create House'}
        </button>
      </div>
    {/if}

    <button class="btnGhost" on:click={() => navigate('/')} style="margin-top:16px;width:100%;display:flex;justify-content:center">
      ← Back to Dashboard
    </button>
  </div>
{/if}

<style>
  .toggle {
    display: flex;
    background: rgba(0,0,0,0.04);
    border-radius: var(--r-md);
    padding: 4px;
    margin-bottom: 24px;
    gap: 4px;
  }

  .toggleBtn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: var(--r-sm);
    font-size: 0.85rem;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    background: transparent;
    color: var(--text-muted);
    transition: all var(--duration-fast) ease;
  }

  .toggleBtn.toggleActive {
    background: white;
    color: var(--text-primary);
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  .errMsg {
    color: #ef4444;
    font-size: 0.8rem;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .popular { margin-top: 28px; }

  .popularList { display: flex; flex-direction: column; gap: 8px; }

  .popularCard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: all var(--duration-fast) ease;
    font-family: var(--font-sans);
    width: 100%;
  }

  .popularCard:hover { background: var(--bg-surface-2); border-color: var(--border-hover); }

  .popularInfo { display: flex; flex-direction: column; gap: 2px; text-align: left; }
  .popularName { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
  .popularMembers { font-size: 0.75rem; color: var(--text-muted); }
  .popularJoin { font-size: 0.82rem; font-weight: 600; color: var(--accent-soft); }
</style>
