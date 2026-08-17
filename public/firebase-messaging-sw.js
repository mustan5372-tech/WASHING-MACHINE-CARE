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
    requireInteraction: true,
    actions: [
      { action: 'open_admin', title: 'Open Admin Dashboard 📱' }
    ]
  };

  self.registration.showNotification(title, options);
});

// Handle Push event directly for Web Push payloads
self.addEventListener('push', (event) => {
  let title = '🚨 New Washing Machine Repair Booking!';
  let body = 'A new customer complaint has been submitted.';
  let data = {};

  if (event.data) {
    try {
      const payload = event.data.json();
      title = payload.title || payload.notification?.title || title;
      body = payload.body || payload.notification?.body || body;
      data = payload.data || payload;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true,
    data: data,
    actions: [
      { action: 'open_admin', title: 'View Booking 📱' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
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

// Cache configuration for offline PWA capability
const CACHE_NAME = 'wmc-pwa-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
