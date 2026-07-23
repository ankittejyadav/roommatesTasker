<script lang="ts">
  import { user, activeGroup, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';

  $: isAdmin = ($activeGroup && $user) ? $activeGroup.adminUserId === $user.id : false;
  $: if (!$authLoading && (!$user || !isAdmin)) navigate('/');
</script>

{#if $authLoading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading Admin Panel...</p></div>
{:else if $activeGroup && $user && isAdmin}
  <div class="pageWrapper">
    <header class="pageHeader">
      <h1 class="pageTitle">🔧 Group Admin</h1>
      <p class="pageSubtitle">Manage {$activeGroup.name}</p>
    </header>

    <div class="section">
      <h2 class="sectionTitle">Group Details</h2>
      <div class="glassCard">
        <div class="infoItem"><span class="infoLabel">Group Name</span><span class="infoValue">{$activeGroup.name}</span></div>
        <div class="infoItem"><span class="infoLabel">Invite Code</span><span class="inviteCode">{$activeGroup.inviteCode}</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="sectionTitle">Group Members ({$activeGroup.members.length})</h2>
      <div class="glassCard">
        {#each $activeGroup.members as member}
          <div class="memberRow">
            <div>
              <span class="memberName">{member.displayName}</span>
              <span class="memberEmail">{member.email}</span>
            </div>
            {#if member.userId === $activeGroup.adminUserId}
              <span class="badgeAdmin">Admin</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .infoItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .infoItem:last-child { border-bottom: none; }
  .infoLabel { font-size: 0.78rem; color: var(--text-muted); }
  .infoValue { font-size: 0.85rem; font-weight: 600; }
  .inviteCode { font-family: monospace; font-weight: 800; color: var(--accent); }
  .memberRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .memberRow:last-child { border-bottom: none; }
  .memberName { display: block; font-weight: 600; font-size: 0.9rem; }
  .memberEmail { display: block; font-size: 0.75rem; color: var(--text-muted); }
  .badgeAdmin { background: var(--accent-bg); color: var(--accent); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.7rem; }
</style>
