<script lang="ts">
  import type { Task, MemberProfile } from '../lib/types';

  export let task: Task;
  export let members: MemberProfile[];
  export let onSwap: (swapWithUid: string) => void;
  export let onClose: () => void;

  $: currentUid = task.temporarySwap
    ? task.temporarySwap.swappedUid
    : task.rotation[task.currentIndex % task.rotation.length];

  $: otherMembers = members.filter((m) => m.uid !== currentUid);
</script>

<div class="overlay" on:click={onClose} role="presentation" on:keydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modalHeader">
      <h3 class="modalTitle">Swap Assignee</h3>
      <p class="modalSubtitle">This only affects the current turn. The regular rotation stays the same.</p>
    </div>

    <div class="memberList">
      {#each otherMembers as m (m.uid)}
        <button class="memberBtn" on:click={() => onSwap(m.uid)}>
          <div class="memberAv">
            {#if m.photoURL}
              <img src={m.photoURL} alt={m.displayName} referrerpolicy="no-referrer" />
            {:else}
              {m.displayName[0].toUpperCase()}
            {/if}
          </div>
          <span class="memberBtnName">{m.displayName}</span>
          <span class="arrow">→</span>
        </button>
      {/each}
    </div>

    <button class="closeBtn" on:click={onClose}>Cancel</button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 300;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 80px;
  }

  .modal {
    background: white;
    border-radius: var(--r-xl);
    padding: 24px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.3s var(--ease-spring);
  }

  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modalHeader { margin-bottom: 20px; }
  .modalTitle { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
  .modalSubtitle { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }

  .memberList { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

  .memberBtn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: var(--r-md);
    background: var(--bg-surface-1);
    cursor: pointer;
    transition: all var(--duration-fast);
    font-family: var(--font-sans);
    width: 100%;
  }

  .memberBtn:hover { background: var(--accent-bg); border-color: var(--accent-border); }

  .memberAv {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.8rem; color: white;
    flex-shrink: 0; overflow: hidden;
  }

  .memberAv img { width: 100%; height: 100%; object-fit: cover; }

  .memberBtnName { flex: 1; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); text-align: left; }
  .arrow { color: var(--text-muted); font-size: 0.9rem; }

  .closeBtn {
    width: 100%;
    padding: 12px;
    border-radius: var(--r-md);
    border: 1px solid var(--border);
    background: var(--bg-surface-1);
    color: var(--text-secondary);
    font-size: 0.88rem;
    font-weight: 600;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--duration-fast);
  }

  .closeBtn:hover { background: var(--bg-surface-2); }
</style>
