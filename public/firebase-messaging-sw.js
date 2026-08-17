// Firebase Cloud Messaging Background Service Worker & PWA Handler
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase App in Background Worker
firebase.initializeApp({
  apiKey: "AIzaSyD4BW_siJnlXbWmN7IdP-0kUy7rQeD0A80",
  authDomain: "washing-machine-care-727eb.firebaseapp.com",
  projectId: "washing-machine-care-727eb",
  storageBucket: "washing-machine-care-727eb.firebasestorage.app",
  messagingSenderId: "1044563908801",
  appId: "1:1044563908801:web:3988bf9fa8de27f7a29c40"
});

const messaging = firebase.messaging();

// Handle Background Push Notifications when App/Tab is Closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const title = payload.notification?.title || payload.data?.title || '🚨 New Washing Machine Repair Booking!';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'A new service complaint has been registered by a customer.',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open_admin', title: 'Open Admin Dashboard 📱' }
    ]
  };

  self.registration.showNotification(title, options);
});

// Handle Notification Click Action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin');
      }
    })
  );
});

// Handle Fetch for PWA Install Criteria
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
