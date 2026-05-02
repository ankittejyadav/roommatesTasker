'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { HouseData, ChatMessage } from '@/lib/types';
import { findHouseByUser, subscribeToHouse, sendChatMessage, subscribeToChatMessages, deleteChatMessage } from '@/lib/firestore';
import styles from './Chat.module.css';

export default function ChatPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [houseId, setHouseId] = useState<string | null>(null);
    const [data, setData] = useState<HouseData | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push('/login'); return; }

        let unsubHouse: (() => void) | null = null;
        let unsubMessages: (() => void) | null = null;

        const init = async () => {
            try {
                const match = await findHouseByUser(user.uid);
                if (!match) { router.push('/join'); return; }

                setHouseId(match.id);
                
                unsubHouse = subscribeToHouse(match.id, (houseData) => {
                    if (!houseData) {
                        router.push('/join');
                        return;
                    }
                    setData(houseData);
                });

                unsubMessages = subscribeToChatMessages(match.id, (msgs) => {
                    setMessages(msgs);
                    setLoading(false);
                }, (err) => {
                    console.error('Chat messages error:', err);
                    setLoading(false);
                    setError('Permission denied or missing index. Please verify Firestore settings.');
                });

            } catch (err) {
                console.error('Chat init error:', err);
                setLoading(false);
            }
        };

        init();

        return () => {
            if (unsubHouse) unsubHouse();
            if (unsubMessages) unsubMessages();
        };
    }, [user, authLoading, router]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !houseId || !user) return;

        setNewMessage(''); // optimistic clear
        try {
            await sendChatMessage(
                houseId,
                text,
                user.uid,
                user.displayName || 'Unknown',
                user.photoURL
            );
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally could add toast error handling here
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!houseId) return;
        try {
            await deleteChatMessage(houseId, messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    if (authLoading || loading) {
        return <div className="loadingPage"><div className="spinner" /><p>Loading chat...</p></div>;
    }
    if (!data || !user) return null;

    return (
        <div className={styles.appContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <header className={styles.sidebarHeader}>
                    <div className={styles.avatar}>
                        {user.photoURL ? <img src={user.photoURL} alt="Me" /> : <span>{user.displayName?.[0] || 'U'}</span>}
                    </div>
                    <div className={styles.sidebarActions}>
                        <button type="button" className={styles.iconBtn} title="Status">⭕</button>
                        <button type="button" className={styles.iconBtn} title="New Chat">💬</button>
                        <button type="button" className={styles.iconBtn} title="Menu">⋮</button>
                    </div>
                </header>
                <div className={styles.sidebarSearch}>
                    <div className={styles.searchInner}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input type="text" placeholder="Search or start new chat" className={styles.searchInput} />
                    </div>
                </div>
                <div className={styles.chatList}>
                    <div className={`${styles.chatItem} ${styles.activeItem}`}>
                        <div className={styles.chatItemAvatar}>🏡</div>
                        <div className={styles.chatItemInfo}>
                            <div className={styles.chatItemHeader}>
                                <span className={styles.chatItemName}>{data.name}</span>
                                <span className={styles.chatItemTime}>
                                    {messages.length > 0 ? new Date(messages[messages.length-1].createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                                </span>
                            </div>
                            <div className={styles.chatItemSub}>
                                <span className={styles.chatItemPreview}>
                                    {messages.length > 0 ? messages[messages.length-1].text : 'No messages yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={styles.chatContainer}>
                <header className={styles.header}>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerAvatar}>🏡</div>
                        <div>
                            <h2 className={styles.headerTitle}>{data.name}</h2>
                            <span className={styles.headerSubtitle}>{data.members.length} members</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button type="button" className={styles.iconBtn} title="Search chat">🔍</button>
                        <button type="button" className={styles.iconBtn} title="Attachments">📎</button>
                        <button type="button" className={styles.iconBtn} title="Menu">⋮</button>
                    </div>
                </header>

                {error && (
                    <div className={styles.errorBanner}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <p className={styles.errorText}>{error}</p>
                    </div>
                )}

                <div className={styles.messagesArea}>
                    {messages.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>💬</span>
                            <h3 className={styles.emptyText}>Say hi to your roommates!</h3>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.senderUid === user.uid;
                            const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                            
                            return (
                                <div key={msg.id} className={`${styles.messageWrapper} ${isMine ? styles.mine : styles.theirs}`}>
                                    {!isMine && <span className={styles.senderName}>{msg.senderName}</span>}
                                    <div className={styles.messageContent}>
                                        <div className={styles.messageBubble}>
                                            <div className={styles.bubbleText}>{msg.text}</div>
                                            <div className={styles.bubbleMeta}>
                                                <span className={styles.messageTime}>{timeString}</span>
                                                {isMine && <span className={styles.ticks} title="Delivered">✓✓</span>}
                                            </div>
                                        </div>
                                        {isMine && (
                                            <button 
                                                className={styles.deleteBtn} 
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                title="Delete message"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                    <button type="button" className={styles.assetBtn} title="Emojis">😀</button>
                    <button type="button" className={styles.assetBtn} title="Attach">📎</button>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        maxLength={500}
                    />
                    <button type="submit" className={styles.sendButton} disabled={!newMessage.trim()}>
                        <span className={styles.sendIcon}>➣</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
