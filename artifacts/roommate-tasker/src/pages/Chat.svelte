<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { user, authLoading } from '../lib/auth';
  import { navigate } from '../lib/router';
  import { findHouseByUser, subscribeToHouse, sendChatMessage, subscribeToChatMessages, deleteChatMessage } from '../lib/firestore';
  import type { HouseData, ChatMessage } from '../lib/types';

  let initialized = false;
  let houseId: string | null = null;
  let data: HouseData | null = null;
  let messages: ChatMessage[] = [];
  let newMessage = '';
  let loading = true;
  let error: string | null = null;
  let messagesEnd: HTMLDivElement;
  let unsubHouse: (() => void) | null = null;
  let unsubMessages: (() => void) | null = null;

  $: {
    if (!$authLoading) {
      if (!$user) { navigate('/login'); }
      else if (!initialized) { initialized = true; init(); }
    }
  }

  async function init() {
    try {
      const match = await findHouseByUser($user!.uid);
      if (!match) { navigate('/join'); return; }
      houseId = match.id;
      unsubHouse = subscribeToHouse(match.id, (houseData) => {
        if (!houseData) { navigate('/join'); return; }
        data = houseData;
      });
      unsubMessages = subscribeToChatMessages(match.id, (msgs) => {
        messages = msgs;
        loading = false;
      }, (err) => {
        console.error('Chat messages error:', err);
        loading = false;
        error = 'Permission denied or missing index. Please verify Firestore settings.';
      });
    } catch (err) {
      console.error('Chat init error:', err);
      loading = false;
    }
  }

  afterUpdate(() => {
    if (messagesEnd) messagesEnd.scrollIntoView({ behavior: 'smooth' });
  });

  async function handleSend(e: Event) {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !houseId || !$user) return;
    newMessage = '';
    try {
      await sendChatMessage(houseId, text, $user.uid, $user.displayName || 'Unknown', $user.photoURL);
    } catch (err) { console.error('Error sending message:', err); }
  }

  async function handleDelete(messageId: string) {
    if (!houseId) return;
    try { await deleteChatMessage(houseId, messageId); }
    catch (err) { console.error('Error deleting message:', err); }
  }

  onDestroy(() => { if (unsubHouse) unsubHouse(); if (unsubMessages) unsubMessages(); });
</script>

{#if $authLoading || loading}
  <div class="loadingPage"><div class="spinner"></div><p>Loading chat...</p></div>
{:else if data && $user}
  <div class="chatApp">
    <div class="sidebar">
      <header class="sidebarHeader">
        <div class="sidebarAvatar">
          {#if $user.photoURL}
            <img src={$user.photoURL} alt="Me" referrerpolicy="no-referrer" />
          {:else}
            <span>{$user.displayName?.[0] || 'U'}</span>
          {/if}
        </div>
        <div class="sidebarActions">
          <button class="iconBtn" type="button">⭕</button>
          <button class="iconBtn" type="button">💬</button>
          <button class="iconBtn" type="button">⋮</button>
        </div>
      </header>
      <div class="sidebarSearch">
        <div class="searchInner">
          <span class="searchIcon">🔍</span>
          <input type="text" placeholder="Search or start new chat" class="searchInput" />
        </div>
      </div>
      <div class="chatList">
        <div class="chatItem chatItemActive">
          <div class="chatItemAvatar">🏡</div>
          <div class="chatItemInfo">
            <div class="chatItemHeader">
              <span class="chatItemName">{data.name}</span>
              <span class="chatItemTime">
                {#if messages.length > 0}{new Date(messages[messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{/if}
              </span>
            </div>
            <span class="chatItemPreview">
              {messages.length > 0 ? messages[messages.length - 1].text : 'No messages yet'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="chatContainer">
      <header class="chatHeader">
        <div class="chatHeaderInfo">
          <div class="chatHeaderAvatar">🏡</div>
          <div>
            <h2 class="chatHeaderTitle">{data.name}</h2>
            <span class="chatHeaderSub">{data.members.length} members</span>
          </div>
        </div>
        <div class="chatHeaderActions">
          <button class="iconBtn" type="button">🔍</button>
          <button class="iconBtn" type="button">📎</button>
          <button class="iconBtn" type="button">⋮</button>
        </div>
      </header>

      {#if error}
        <div class="errorBanner">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      {/if}

      <div class="messagesArea">
        {#if messages.length === 0}
          <div class="chatEmpty">
            <span>💬</span>
            <h3>Say hi to your roommates!</h3>
          </div>
        {:else}
          {#each messages as msg (msg.id)}
            {@const isMine = msg.senderUid === $user.uid}
            {@const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            <div class="msgWrapper {isMine ? 'msgMine' : 'msgTheirs'}">
              {#if !isMine}<span class="senderName">{msg.senderName}</span>{/if}
              <div class="msgContent">
                <div class="msgBubble">
                  <div class="bubbleText">{msg.text}</div>
                  <div class="bubbleMeta">
                    <span class="msgTime">{timeStr}</span>
                    {#if isMine}<span class="ticks">✓✓</span>{/if}
                  </div>
                </div>
                {#if isMine}
                  <button class="deleteBtn" on:click={() => handleDelete(msg.id)} title="Delete">🗑️</button>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
        <div bind:this={messagesEnd}></div>
      </div>

      <form class="inputArea" on:submit={handleSend}>
        <button type="button" class="assetBtn">😀</button>
        <button type="button" class="assetBtn">📎</button>
        <input
          type="text"
          class="chatInput"
          placeholder="Type a message..."
          bind:value={newMessage}
          maxlength="500"
        />
        <button type="submit" class="sendBtn" disabled={!newMessage.trim()}>
          <span class="sendIcon">➣</span>
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  .chatApp {
    display: flex;
    height: 100vh;
    background: #f0f2f5;
    overflow: hidden;
    padding-bottom: 64px;
  }

  .sidebar {
    width: 280px;
    flex-shrink: 0;
    background: white;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 600px) { .sidebar { display: none; } }

  .sidebarHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #ededed;
  }

  .sidebarAvatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #e0e0e0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #555;
    font-size: 0.9rem;
  }

  .sidebarAvatar img { width: 100%; height: 100%; object-fit: cover; }
  .sidebarActions { display: flex; gap: 4px; }

  .iconBtn {
    width: 32px; height: 32px;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    color: #555;
    transition: background 0.15s;
  }

  .iconBtn:hover { background: rgba(0,0,0,0.06); }

  .sidebarSearch { padding: 8px 12px; background: #f6f6f6; }

  .searchInner {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 8px;
    padding: 6px 12px;
    gap: 8px;
  }

  .searchIcon { font-size: 0.85rem; color: #aaa; }

  .searchInput {
    border: none;
    outline: none;
    font-size: 0.85rem;
    color: #555;
    flex: 1;
    background: transparent;
    font-family: var(--font-sans);
  }

  .chatList { flex: 1; overflow-y: auto; }

  .chatItem {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba(0,0,0,0.04);
    transition: background 0.1s;
  }

  .chatItemActive { background: #f0f2f5; }
  .chatItem:hover { background: #f5f5f5; }

  .chatItemAvatar {
    width: 48px; height: 48px;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  .chatItemInfo { flex: 1; min-width: 0; }

  .chatItemHeader {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 3px;
  }

  .chatItemName { font-weight: 600; font-size: 0.9rem; color: #111; }
  .chatItemTime { font-size: 0.7rem; color: #aaa; }
  .chatItemPreview { font-size: 0.78rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

  .chatContainer {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #e5ddd5;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .chatHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #ededed;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  .chatHeaderInfo { display: flex; align-items: center; gap: 12px; }

  .chatHeaderAvatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #d0d0d0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
  }

  .chatHeaderTitle { font-weight: 600; font-size: 0.92rem; color: #111; }
  .chatHeaderSub { font-size: 0.72rem; color: #888; }
  .chatHeaderActions { display: flex; gap: 4px; }

  .errorBanner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff3cd;
    border-bottom: 1px solid #ffc107;
  }

  .errorBanner p { font-size: 0.8rem; color: #856404; }

  .messagesArea {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chatEmpty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #aaa;
    font-size: 1rem;
    height: 200px;
  }

  .chatEmpty span { font-size: 2.5rem; }

  .msgWrapper { display: flex; flex-direction: column; margin-bottom: 4px; }
  .msgMine { align-items: flex-end; }
  .msgTheirs { align-items: flex-start; }

  .senderName {
    font-size: 0.7rem;
    color: #555;
    font-weight: 600;
    margin-bottom: 2px;
    padding-left: 2px;
  }

  .msgContent { display: flex; align-items: flex-end; gap: 6px; }

  .msgBubble {
    max-width: 65vw;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.88rem;
    line-height: 1.4;
    position: relative;
  }

  .msgMine .msgBubble {
    background: #dcf8c6;
    border-bottom-right-radius: 4px;
    color: #111;
  }

  .msgTheirs .msgBubble {
    background: white;
    border-bottom-left-radius: 4px;
    color: #111;
    box-shadow: 0 1px 2px rgba(0,0,0,0.12);
  }

  .bubbleText { word-break: break-word; }

  .bubbleMeta {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: flex-end;
    margin-top: 3px;
  }

  .msgTime { font-size: 0.62rem; color: #888; }
  .ticks { font-size: 0.62rem; color: #53bdeb; }

  .deleteBtn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.15s;
    padding: 2px;
  }

  .msgContent:hover .deleteBtn { opacity: 1; }

  .inputArea {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f0f2f5;
    border-top: 1px solid rgba(0,0,0,0.08);
  }

  .assetBtn {
    width: 36px; height: 36px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #555;
    flex-shrink: 0;
  }

  .chatInput {
    flex: 1;
    padding: 10px 14px;
    border-radius: 24px;
    border: none;
    outline: none;
    font-size: 0.9rem;
    font-family: var(--font-sans);
    color: #111;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  .sendBtn {
    width: 40px; height: 40px;
    border-radius: 50%;
    border: none;
    background: #25d366;
    color: white;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    transition: background 0.15s;
  }

  .sendBtn:hover { background: #22c05e; }
  .sendBtn:disabled { opacity: 0.5; cursor: default; }
  .sendIcon { font-size: 1rem; }
</style>
