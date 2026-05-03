<script lang="ts">
  import { user, authLoading, signInWithGoogle } from '../lib/auth';
  import { navigate } from '../lib/router';

  $: if (!$authLoading && $user) navigate('/');
</script>

{#if $authLoading}
  <div class="login-loading">
    <div class="app-icon pulse">🏠</div>
    <p>Loading…</p>
  </div>
{:else}
  <div class="login-page">
    <div class="blob blob-top"></div>
    <div class="blob blob-bottom"></div>

    <div class="login-main">
      <div class="app-icon-wrap">
        <div class="app-icon">🏠</div>
      </div>

      <h1 class="app-title">Roommate</h1>
      <p class="app-tagline">Your shared home, perfectly in sync.</p>

      <div class="login-card">
        <ul class="feature-list">
          <li class="feature-item">
            <div class="feature-icon">🔄</div>
            <span>Fair task rotation</span>
          </li>
          <li class="feature-item">
            <div class="feature-icon">🛒</div>
            <span>Shared shopping list</span>
          </li>
          <li class="feature-item">
            <div class="feature-icon">⚡</div>
            <span>Real-time sync</span>
          </li>
        </ul>

        <button class="google-btn" on:click={signInWithGoogle}>
          <svg viewBox="0 0 24 24" class="google-icon">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
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

  .google-btn {
    width: 100%;
    height: 56px;
    border-radius: 16px;
    background: white;
    border: 2px solid #e8dfda;
    color: #4a3f39;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .google-btn:hover { background: #faf7f5; border-color: #dfd5ce; }
  .google-btn:active { transform: scale(0.98); }

  .google-icon { width: 20px; height: 20px; flex-shrink: 0; }

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
