<script lang="ts">
  import { router, navigate } from '../lib/router';
  import { user } from '../lib/auth';

  const navItems = [
    { href: '/', label: 'Home', icon: '⌂' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/shopping', label: 'Shop', icon: '🛒' },
    { href: '/personal', label: 'My Tasks', icon: '👤' },
    { href: '/feedback', label: 'Feedback', icon: '📝' },
    { href: '/settings', label: 'Settings', icon: '⚙' },
  ];
</script>

{#if $user && $router !== '/login' && $router !== '/join'}
  <nav class="bottomNav">
    <div class="navInner">
      {#each navItems as item}
        {@const isActive = $router === item.href}
        <button
          class="navItem {isActive ? 'active' : ''}"
          on:click={() => navigate(item.href)}
          aria-label={item.label}
        >
          <span class="navIcon">{item.icon}</span>
          <span class="navLabel">{item.label}</span>
        </button>
      {/each}
    </div>
  </nav>
{/if}

<style>
  .bottomNav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--border);
    z-index: 100;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
    height: 64px;
  }

  .navInner {
    display: flex;
    align-items: stretch;
    height: 100%;
    max-width: 560px;
    margin: 0 auto;
  }

  .navItem {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 6px 2px;
    transition: all var(--duration-fast) ease;
    color: var(--text-muted);
    font-family: var(--font-sans);
    border-radius: 0;
    position: relative;
  }

  .navItem:hover { background: var(--bg-surface-1); color: var(--text-secondary); }

  .navItem.active {
    color: var(--accent);
  }

  .navItem.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    height: 2px;
    background: var(--accent);
    border-radius: 0 0 2px 2px;
  }

  .navIcon { font-size: 1.2rem; line-height: 1; }

  .navLabel {
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
</style>
