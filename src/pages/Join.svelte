<script lang="ts">
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { createGroup, joinGroup } from '../lib/api';

  let mode: 'join' | 'create' = 'join';
  let code = '';
  let groupName = '';
  let error = '';
  let submitting = false;

  $: if (!$authLoading && !$user) navigate('/login');

  async function handleJoin() {
    if (!code.trim()) { error = 'Please enter an invite code'; return; }
    submitting = true;
    error = '';
    const group = await joinGroup(code.trim());
    submitting = false;
    if (group) {
      navigate('/');
    } else {
      error = 'Invalid invite code or unable to join group.';
    }
  }

  async function handleCreate() {
    if (!groupName.trim()) { error = 'Please enter a group name'; return; }
    submitting = true;
    error = '';
    const group = await createGroup(groupName.trim());
    submitting = false;
    if (group) {
      navigate('/');
    } else {
      error = 'Failed to create group. Please try again.';
    }
  }
</script>

{#if $authLoading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading...</p></div>
{:else if $user}
  <div class="pageWrapper">
    <header class="pageHeader">
      <h1 class="pageTitle">🔄 Welcome to TaskSync</h1>
      <p class="pageSubtitle">Join an existing group or start a new one</p>
    </header>

    <div class="modeToggle">
      <button class="toggleBtn {mode === 'join' ? 'active' : ''}" on:click={() => { mode = 'join'; error = ''; }}>
        Join Group
      </button>
      <button class="toggleBtn {mode === 'create' ? 'active' : ''}" on:click={() => { mode = 'create'; error = ''; }}>
        Create Group
      </button>
    </div>

    {#if error}
      <div class="errorBanner">{error}</div>
    {/if}

    {#if mode === 'join'}
      <div class="card">
        <label for="code" class="inputLabel">6-Character Invite Code</label>
        <input
          id="code"
          type="text"
          bind:value={code}
          placeholder="e.g. VTSEGF"
          class="inputField"
          maxlength="6"
        />
        <button class="btnPrimary" on:click={handleJoin} disabled={submitting}>
          {submitting ? 'Joining...' : 'Join Group'}
        </button>
      </div>
    {:else}
      <div class="card">
        <label for="groupName" class="inputLabel">Group / Apartment Name</label>
        <input
          id="groupName"
          type="text"
          bind:value={groupName}
          placeholder="e.g. 88 Gardner St Apt 33"
          class="inputField"
        />
        <button class="btnPrimary" on:click={handleCreate} disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .modeToggle { display: flex; gap: 8px; margin-bottom: 20px; }
  .toggleBtn {
    flex: 1;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: white;
    font-weight: 700;
    cursor: pointer;
  }
  .toggleBtn.active { background: var(--accent-bg); color: var(--accent); border-color: var(--accent-border); }
  .card { background: white; border-radius: 16px; padding: 20px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 12px; }
  .inputLabel { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
  .inputField { padding: 12px; border-radius: 10px; border: 1px solid var(--border); font-size: 1rem; }
  .btnPrimary { padding: 12px; background: var(--accent); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
  .errorBanner { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
</style>
