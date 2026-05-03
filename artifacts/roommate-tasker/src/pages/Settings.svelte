<script lang="ts">
  import { onDestroy } from 'svelte';
  import { user, authLoading, signOut, updateUserProfile } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { findHouseByUser, subscribeToHouse, saveFcmToken, updateMemberProfile } from '../lib/firestore';
  import { requestFcmToken, isNotificationSupported } from '../lib/notifications';
  import type { HouseData } from '../lib/types';

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let loading = true;
  let notifStatus = 'unknown';
  let toast: string | null = null;
  let isEditingName = false;
  let newName = '';
  let savingName = false;
  let unsub: (() => void) | null = null;

  $: {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); }
      else if (!initialized) { initialized = true; newName = $user.displayName || ''; init(); }
    }
  }

  async function init() {
    try {
      const house = await findHouseByUser($user!.uid);
      if (!house) { navigate('/join'); return; }
      houseId = house.id;
      unsub = subscribeToHouse(house.id, (d) => { data = d; loading = false; });

      if (isNotificationSupported()) {
        notifStatus = Notification.permission;
        if (Notification.permission === 'granted') {
          requestFcmToken().then((token) => {
            if (token) saveFcmToken(house.id, house.data, $user!.uid, token).catch(console.error);
          }).catch(console.error);
        }
      } else {
        notifStatus = 'unsupported';
      }
    } catch (err) { console.error(err); loading = false; }
  }

  function showToast(msg: string) { toast = msg; setTimeout(() => { toast = null; }, 3000); }

  async function handleEnableNotif() {
    try {
      notifStatus = 'requesting';
      const token = await requestFcmToken();
      if (token) {
        if (houseId && data) await saveFcmToken(houseId, data, $user!.uid, token);
        notifStatus = 'granted';
        showToast('🔔 Native push notifications enabled!');
      } else {
        notifStatus = Notification.permission === 'denied' ? 'denied' : 'unknown';
        if (Notification.permission === 'default') showToast('Notification permission was dismissed');
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      notifStatus = 'unknown';
      showToast(`⚠️ Error: ${e.message.substring(0, 50)}`);
    }
  }

  async function handleSaveName() {
    if (!newName.trim()) return;
    savingName = true;
    try {
      await updateUserProfile({ displayName: newName });
      if (houseId && data && $user) await updateMemberProfile(houseId, data, $user.uid, { displayName: newName });
      isEditingName = false;
      showToast('✅ Name updated successfully!');
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      showToast(`⚠️ Error: ${e.message || 'Failed to update name'}`);
    } finally { savingName = false; }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  onDestroy(() => { if (unsub) unsub(); });

  $: isAdmin = data ? data.adminUid === $user?.uid : false;
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading settings...</p></div>
{:else if data && $user}
  <div class="pageWrapper">
    {#if toast}<div class="toast">{toast}</div>{/if}

    <header class="pageHeader">
      <h1 class="pageTitle">⚙ Settings</h1>
      <p class="pageSubtitle">Your profile &amp; preferences</p>
    </header>

    <div class="section">
      <h2 class="sectionTitle">Profile</h2>
      <div class="glassCard">
        <div class="profileRow">
          <div class="profileAvatar avatar">
            {#if $user.photoURL}
              <img src={$user.photoURL} alt={$user.displayName || ''} referrerpolicy="no-referrer" />
            {:else}
              {($user.displayName || 'U')[0].toUpperCase()}
            {/if}
          </div>
          <div style="flex:1">
            {#if isEditingName}
              <div class="editRow">
                <input
                  type="text"
                  bind:value={newName}
                  class="inputField"
                  style="padding:6px 10px;font-size:0.88rem;flex:1"
                  placeholder="Enter name"
                />
                <button class="btnPrimary btnSmall" on:click={handleSaveName} disabled={savingName}>Save</button>
                <button class="btnSecondary btnSmall" on:click={() => { isEditingName = false; newName = $user.displayName || ''; }}>Cancel</button>
              </div>
            {:else}
              <div class="profileInfo">
                <div class="nameRow">
                  <div>
                    <span class="profileName">{$user.displayName}</span>
                    <span class="profileEmail">{$user.email}</span>
                  </div>
                  <button class="btnGhost btnSmall" on:click={() => isEditingName = true}>✏️ Edit</button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="sectionTitle">Household</h2>
      <div class="glassCard">
        <div class="infoItem"><span class="infoLabel">House</span><span class="infoValue">{data.name}</span></div>
        <div class="infoItem"><span class="infoLabel">Invite Code</span><span class="inviteCode">{data.inviteCode}</span></div>
        <div class="infoItem"><span class="infoLabel">Members</span><span class="infoValue">{data.members.map((m) => m.displayName).join(', ')}</span></div>
        <div class="infoItem"><span class="infoLabel">Role</span><span class="infoValue">{isAdmin ? '👑 Admin' : 'Member'}</span></div>
      </div>
    </div>

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

    <div class="section">
      <h2 class="sectionTitle">Notifications</h2>
      {#if notifStatus === 'granted'}
        <p class="statusGood">✅ App push notifications active</p>
      {:else if notifStatus === 'denied'}
        <p class="statusWarn">🚫 Blocked — enable in device settings</p>
      {:else if notifStatus === 'unsupported'}
        <p class="statusWarn">⚠️ Not supported in this browser</p>
      {:else if notifStatus === 'requesting'}
        <p class="statusWait">⏳ Requesting permission...</p>
      {:else}
        <button class="btnSecondary" on:click={handleEnableNotif}>🔔 Enable App Notifications</button>
      {/if}
    </div>

    <hr class="divider" />

    <button class="btnDanger" on:click={handleSignOut}>🚪 Sign Out</button>
  </div>
{/if}

<style>
  .profileRow {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .profileAvatar {
    width: 52px !important;
    height: 52px !important;
    border-radius: var(--r-md) !important;
    font-size: 1.1rem !important;
    flex-shrink: 0;
  }

  .editRow { display: flex; gap: 8px; align-items: center; }
  .nameRow { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

  .profileInfo { display: flex; flex-direction: column; gap: 2px; }
  .profileName { display: block; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
  .profileEmail { display: block; font-size: 0.78rem; color: var(--text-muted); }

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

  .link:hover { background: var(--bg-surface-2); border-color: var(--border-hover); }

  .statusGood { font-size: 0.85rem; color: #16a34a; font-weight: 600; }
  .statusWarn { font-size: 0.85rem; color: #ca8a04; font-weight: 600; }
  .statusWait { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
</style>
