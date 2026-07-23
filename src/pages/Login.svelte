<script lang="ts">
  import { onMount } from 'svelte';
  import { user, authLoading, handleGoogleSignInToken } from '../lib/auth';
  import { navigate } from '../lib/router';

  $: if (!$authLoading && $user) navigate('/');

  function renderGoogleIdentityButton() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const container = document.getElementById('google-btn-container');

    if (!container) return;

    if (!googleClientId || googleClientId.includes('your-google-oauth-client-id')) {
      container.innerHTML = '<p style="color: #d35a50; font-size: 0.85rem; font-weight: 600; text-align: center;">⚠️ Please set VITE_GOOGLE_CLIENT_ID in your .env file</p>';
      return;
    }

    if (window.google?.accounts?.id) {
      container.innerHTML = '';
      const redirectUri = window.location.origin;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        ux_mode: 'redirect',
        login_uri: redirectUri,
        callback: async (response: any) => {
          if (response.credential) {
            await handleGoogleSignInToken(response.credential);
          }
        }
      });
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 300,
        text: 'continue_with',
        shape: 'rectangular'
      });
    }
  }

  onMount(() => {
    renderGoogleIdentityButton();
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        renderGoogleIdentityButton();
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  });
</script>

{#if $authLoading}
  <div class="login-loading">
    <div class="app-icon pulse">🔄</div>
    <p>Loading TaskSync…</p>
  </div>
{:else}
  <div class="login-page">
    <div class="blob blob-top"></div>
    <div class="blob blob-bottom"></div>

    <div class="login-main">
      <div class="app-icon-wrap">
        <div class="app-icon">🔄</div>
      </div>

      <h1 class="app-title">TaskSync</h1>
      <p class="app-tagline">Group chores & task rotations, perfectly synchronized.</p>

      <div class="login-card">
        <ul class="feature-list">
          <li class="feature-item">
            <div class="feature-icon">🔄</div>
            <span>Automatic fair task rotation</span>
          </li>
          <li class="feature-item">
            <div class="feature-icon">👥</div>
            <span>Simple group invite codes</span>
          </li>
          <li class="feature-item">
            <div class="feature-icon">📜</div>
            <span>Completion history logs</span>
          </li>
        </ul>

        <div id="google-btn-container" style="display: flex; justify-content: center; width: 100%; min-height: 44px; align-items: center;"></div>
      </div>

      <div class="scroll-nudge">
        <span class="nudge-label">Peek inside</span>
        <div class="nudge-line"></div>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-inner">
        <div class="preview-header">
          <div>
            <p class="preview-welcome">Welcome to</p>
            <h3 class="preview-house">The Treehouse</h3>
          </div>
          <div class="preview-avatars">
            <img src="https://i.pravatar.cc/150?u=1" class="prev-av" alt="Roommate" />
            <img src="https://i.pravatar.cc/150?u=2" class="prev-av" alt="Roommate" />
            <div class="prev-av prev-av-more">+1</div>
          </div>
        </div>

        <h4 class="preview-tasks-title">Today's Tasks</h4>

        <div class="prev-task overdue-task">
          <div class="prev-task-icon overdue-icon">🔄</div>
          <div class="prev-task-info">
            <h5>Take out recycling</h5>
            <div class="prev-task-badges">
              <span class="badge-overdue">Overdue</span>
              <span class="prev-task-sub">Since yesterday</span>
            </div>
          </div>
          <div class="prev-assignee">
            <img src="https://i.pravatar.cc/150?u=1" class="prev-sm-av" alt="Alex" />
            <span>Alex</span>
          </div>
        </div>

        <div class="prev-task today-task">
          <div class="prev-task-icon today-icon">♻️</div>
          <div class="prev-task-info">
            <h5>Clean kitchen counters</h5>
            <div class="prev-task-badges">
              <span class="badge-today">Today</span>
            </div>
          </div>
          <div class="prev-assignee">
            <img src="https://i.pravatar.cc/150?u=2" class="prev-sm-av" alt="Jordan" />
            <span>Jordan</span>
          </div>
        </div>

        <div class="prev-task upcoming-task">
          <div class="prev-task-icon upcoming-icon">✅</div>
          <div class="prev-task-info">
            <h5>Vacuum living room</h5>
            <div class="prev-task-badges">
              <span class="badge-upcoming">Upcoming</span>
              <span class="prev-task-sub">Tomorrow</span>
            </div>
          </div>
          <div class="prev-assignee">
            <div class="prev-sm-av prev-sm-me">Me</div>
            <span>You</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .login-page {
    min-height: 100vh;
    background: #fdfbf7;
    color: #4a3f39;
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    position: relative;
  }

  .login-loading {
    min-height: 100vh;
    background: #fdfbf7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-family: 'DM Sans', sans-serif;
    color: #8a7a73;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    opacity: 0.6;
  }

  .blob-top {
    width: 300px;
    height: 300px;
    background: #f2e7de;
    top: -10%;
    right: -20%;
  }

  .blob-bottom {
    width: 250px;
    height: 250px;
    background: #f5e3d7;
    bottom: 10%;
    left: -20%;
  }

  .login-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 24px;
    position: relative;
    z-index: 1;
  }

  .app-icon-wrap { margin-bottom: 32px; }

  .app-icon {
    width: 80px;
    height: 80px;
    background: #e07a5f;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    transform: rotate(3deg);
    box-shadow: 0 8px 24px rgba(224, 122, 95, 0.35);
  }

  .pulse { animation: pulse 2s infinite; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.96); }
  }

  .app-title {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #3d312b;
    margin-bottom: 10px;
  }

  .app-tagline {
    color: #8a7a73;
    font-size: 1.05rem;
    margin-bottom: 40px;
    text-align: center;
    max-width: 260px;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    background: white;
    border-radius: 32px;
    padding: 32px;
    border: 1px solid #f5ece7;
    box-shadow: 0 12px 35px -5px rgba(138,122,115,0.12), 0 6px 15px -4px rgba(138,122,115,0.08);
    margin-bottom: 48px;
  }

  .feature-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #5c4f48;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fdf2ee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .scroll-nudge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.6;
    animation: bounce 2s infinite;
    margin-bottom: 16px;
  }

  .nudge-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #8a7a73;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .nudge-line {
    width: 4px;
    height: 32px;
    border-radius: 999px;
    background: linear-gradient(to bottom, #e07a5f, transparent);
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }

  .preview-section {
    background: #fbf6f2;
    border-radius: 40px 40px 0 0;
    padding: 32px 20px 96px;
    position: relative;
    z-index: 2;
    box-shadow: 0 -8px 30px rgba(138,122,115,0.08);
  }

  .preview-inner { max-width: 360px; margin: 0 auto; }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
  }

  .preview-welcome { color: #8a7a73; font-weight: 500; margin-bottom: 4px; font-size: 0.9rem; }
  .preview-house { font-size: 1.8rem; font-weight: 700; color: #3d312b; }

  .preview-avatars { display: flex; margin-left: 8px; }

  .prev-av {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #fbf6f2;
    margin-left: -8px;
    object-fit: cover;
  }

  .prev-av-more {
    background: #f0e6e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8a7a73;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .preview-tasks-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #5c4f48;
    margin-bottom: 16px;
  }

  .prev-task {
    background: white;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 12px;
    border: 1px solid #f5ece7;
    box-shadow: 0 4px 12px rgba(138,122,115,0.08);
    border-left-width: 4px;
  }

  .overdue-task { border-left-color: #d35a50; }
  .today-task { border-left-color: #eab308; }
  .upcoming-task { border-left-color: #5ba878; opacity: 0.85; }

  .prev-task-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .overdue-icon { background: #fdf2ee; }
  .today-icon { background: #fffbf0; }
  .upcoming-icon { background: #eff7f2; }

  .prev-task-info { flex: 1; }
  .prev-task-info h5 { font-weight: 700; color: #3d312b; margin-bottom: 6px; font-size: 0.9rem; }

  .prev-task-badges { display: flex; gap: 8px; align-items: center; }
  .prev-task-sub { font-size: 0.75rem; color: #8a7a73; }

  .badge-overdue { background: #fae8e5; color: #d35a50; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .badge-today { background: #fff8db; color: #b45309; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .badge-upcoming { background: #e6f4ea; color: #5ba878; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }

  .prev-assignee { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .prev-assignee span { font-size: 0.65rem; font-weight: 700; color: #8a7a73; }

  .prev-sm-av {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .prev-sm-me {
    background: #f0e6e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8a7a73;
    font-size: 0.65rem;
    font-weight: 700;
  }
</style>
