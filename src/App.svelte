<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from './lib/router';
  import { user, authLoading, fetchCurrentSession } from './lib/auth';

  import Login from './pages/Login.svelte';
  import Join from './pages/Join.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import Settings from './pages/Settings.svelte';
  import History from './pages/History.svelte';
  import Admin from './pages/Admin.svelte';
  import BottomNav from './components/BottomNav.svelte';

  let globalToast: string | null = null;

  onMount(() => {
    fetchCurrentSession();
  });
</script>

{#if globalToast}
  <div class="toast">{globalToast}</div>
{/if}

{#if $authLoading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading…</p></div>
{:else if !$user || $router === '/login'}
  <Login />
{:else if $router === '/join'}
  <Join />
{:else if $router === '/settings'}
  <Settings />
{:else if $router === '/history'}
  <History />
{:else if $router === '/admin'}
  <Admin />
{:else}
  <Dashboard />
{/if}

<BottomNav />
