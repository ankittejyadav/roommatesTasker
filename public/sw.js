self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    self.registration.unregister()
        .then(() => console.log('Stale service worker unregistered successfully.'))
        .catch((err) => console.error('Failed to unregister stale service worker:', err));
});
