<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from './lib/router';
  import { user, authLoading, initAuth } from './lib/auth';
  import { listenForForegroundNotifications } from './lib/notifications';

  import Login from './pages/Login.svelte';
  import Join from './pages/Join.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import Shopping from './pages/Shopping.svelte';
  import Chat from './pages/Chat.svelte';
  import Settings from './pages/Settings.svelte';
  import History from './pages/History.svelte';
  import Personal from './pages/Personal.svelte';
  import Admin from './pages/Admin.svelte';
  import Feedback from './pages/Feedback.svelte';
  import BottomNav from './components/BottomNav.svelte';

  let globalToast: string | null = null;

  onMount(() => {
    const unsubAuth = initAuth();
    listenForForegroundNotifications((title, body) => {
      globalToast = `${title}: ${body}`;
      setTimeout(() => { globalToast = null; }, 4000);
    });
    return () => { unsubAuth(); };
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
{:else if $router === '/chat'}
  <Chat />
{:else if $router === '/shopping'}
  <Shopping />
{:else if $router === '/settings'}
  <Settings />
{:else if $router === '/history'}
  <History />
{:else if $router === '/personal'}
  <Personal />
{:else if $router === '/admin'}
  <Admin />
{:else if $router === '/feedback'}
  <Feedback />
{:else}
  <Dashboard />
{/if}

<BottomNav />
