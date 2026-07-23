importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: '__VITE_FIREBASE_API_KEY__',
    authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
    projectId: '__VITE_FIREBASE_PROJECT_ID__',
    storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
    messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
    appId: '__VITE_FIREBASE_APP_ID__',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title || 'Roommate Tasker';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png',
        data: payload.data || { url: '/' },
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});
