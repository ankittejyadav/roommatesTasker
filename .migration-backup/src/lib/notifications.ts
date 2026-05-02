import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getApp } from './firebase';

export function isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

// Ensure the VAPID key is set in environment (used to authenticate push requests)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY_HERE';

export async function requestFcmToken(): Promise<string | null> {
    if (!isNotificationSupported()) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Unregister any old/conflicting service workers that might be intercepting the request
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
        if (!reg.active || !reg.active.scriptURL.includes('firebase-messaging-sw.js')) {
            await reg.unregister();
            console.log('Unregistered stale service worker:', reg);
        }
    }

    // Explicitly register the custom FCM service worker
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const messaging = getMessaging(getApp());
    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
    });

    return token || null;
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!isNotificationSupported()) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
}

export function sendBrowserNotification(title: string, body: string): void {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/icon-192.png' });
}

export function notifyIfAssigned(
    currentUserUid: string,
    assignedUid: string,
    taskName: string,
    assigneeName: string
): void {
    if (currentUserUid !== assignedUid) return;
    sendBrowserNotification(
        `🎯 Your turn: ${taskName}`,
        `Hey ${assigneeName}, it's your turn! Open the app to mark it done.`
    );
}

export function listenForForegroundNotifications(onReceiveMessage: (title: string, body: string) => void) {
    if (!isNotificationSupported()) return () => { };

    try {
        const messaging = getMessaging(getApp());
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground push received:', payload);
            if (payload.notification) {
                onReceiveMessage(payload.notification.title || 'New Notification', payload.notification.body || '');
            }
        });
        return unsubscribe;
    } catch (err) {
        console.error('Error setting up foreground listener:', err);
        return () => { };
    }
}
