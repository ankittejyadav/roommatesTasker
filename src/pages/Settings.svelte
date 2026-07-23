<script lang="ts">
  import { user, activeGroup, authLoading, signOut } from '../lib/auth';
  import { navigate } from '../lib/router';

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  $: isAdmin = ($activeGroup && $user) ? $activeGroup.adminUserId === $user.id : false;
</script>

{#if $authLoading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading settings...</p></div>
{:else if $user}
  <div class="pageWrapper">
    <header class="pageHeader">
      <h1 class="pageTitle">⚙ Settings</h1>
      <p class="pageSubtitle">Your profile &amp; group preferences</p>
    </header>

    <div class="section">
      <h2 class="sectionTitle">Profile</h2>
      <div class="glassCard">
        <div class="profileRow">
          <div class="profileInfo">
            <span class="profileName">{$user.displayName}</span>
            <span class="profileEmail">{$user.email}</span>
          </div>
        </div>
      </div>
    </div>

    {#if $activeGroup}
      <div class="section">
        <h2 class="sectionTitle">Group</h2>
        <div class="glassCard">
          <div class="infoItem"><span class="infoLabel">Group Name</span><span class="infoValue">{$activeGroup.name}</span></div>
          <div class="infoItem"><span class="infoLabel">Invite Code</span><span class="inviteCode">{$activeGroup.inviteCode}</span></div>
          <div class="infoItem"><span class="infoLabel">Members</span><span class="infoValue">{$activeGroup.members.map((m) => m.displayName).join(', ')}</span></div>
          <div class="infoItem"><span class="infoLabel">Role</span><span class="infoValue">{isAdmin ? '👑 Admin' : 'Member'}</span></div>
        </div>
      </div>
    {/if}

    <div class="section">
      <h2 class="sectionTitle">Quick Links</h2>
      <div class="links">
        <button class="link" on:click={() => navigate('/history')}>📋 Task History</button>
        {#if isAdmin}
          <button class="link" on:click={() => navigate('/admin')}>🔧 Admin Panel</button>
        {/if}
      </div>
    </div>

    <hr class="divider" />

    <button class="btnDanger" on:click={handleSignOut}>🚪 Sign Out</button>
  </div>
{/if}

<style>
  .profileInfo { display: flex; flex-direction: column; gap: 2px; }
  .profileName { display: block; font-weight: 700; font-size: 1rem; color: var(--text-primary); }
  .profileEmail { display: block; font-size: 0.8rem; color: var(--text-muted); }

  .infoItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }

  .infoItem:last-child { border-bottom: none; }
  .infoLabel { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
  .infoValue { font-size: 0.85rem; color: var(--text-primary); font-weight: 600; text-align: right; }

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

  .links { display: flex; flex-direction: column; gap: 8px; }

  .link {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-surface-1);
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    font-family: var(--font-sans);
    transition: all var(--duration-fast) ease;
    text-align: left;
    width: 100%;
  }

  .btnDanger {
    width: 100%;
    padding: 12px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
  }
</style>
