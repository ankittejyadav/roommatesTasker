'use client';

import { useEffect } from 'react';
import { listenForForegroundNotifications, sendBrowserNotification } from '@/lib/notifications';

export default function PushNotificationListener() {
    useEffect(() => {
        const unsubscribe = listenForForegroundNotifications((title, body) => {
            // When the app is open, Firebase suppresses the native OS banner.
            // This explicitly fires a native browser notification, OR falls back to an alert.
            console.log('Push received in foreground:', title, body);

            if (Notification.permission === 'granted') {
                sendBrowserNotification(title, body);
            } else {
                alert(`${title}\n\n${body}`);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return null;
}
