importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBTzuPdNUjpQ875PSwWbIP-zbYLF85Nnjo',
    authDomain: 'roommatestasker.firebaseapp.com',
    projectId: 'roommatestasker',
    storageBucket: 'roommatestasker.firebasestorage.app',
    messagingSenderId: '66436052314',
    appId: '1:66436052314:web:df1e57385657194f032f63',
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
