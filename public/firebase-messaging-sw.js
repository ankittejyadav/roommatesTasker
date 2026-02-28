// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the config 
// (We get this automatically from the Next.js process via URL params or hardcoding,
// but for standard FCM, it's safer to pass the sender ID)
firebase.initializeApp({
    apiKey: 'AIzaSyBTzuPdNUjpQ875PSwWbIP-zbYLF85Nnjo',
    projectId: 'roommatestasker',
    messagingSenderId: '66436052314',
    appId: '1:66436052314:web:df1e57385657194f032f63',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title || 'Roommate Tasker';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png',
        data: payload.data || { url: '/' },
        vibrate: [200, 100, 200, 100, 200], // Mobile vibration pattern
        requireInteraction: true // Keeps notification visible until clicked/cleared
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification.data);
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If window is already open, focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            // If not, open a new one
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});
