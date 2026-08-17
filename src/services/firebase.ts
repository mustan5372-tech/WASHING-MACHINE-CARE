import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import type { Complaint } from '../types';

// Live Firebase Web App configuration from your Firebase Console project:
// Project: washing-machine-care-727eb
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD4BW_siJnlXbWmN7IdP-0kUy7rQeD0A80",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "washing-machine-care-727eb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "washing-machine-care-727eb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "washing-machine-care-727eb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1044563908801",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1044563908801:web:3988bf9fa8de27f7a29c40",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7X6JN0J8T7"
};

// Initialize Firebase App & Services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Register Firebase Cloud Messaging (FCM) for Admin Web Push Notifications
 */
export const registerFcmNotifications = async (adminName: string): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging not supported on this browser.');
      return null;
    }

    // Register Background Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Firebase Service Worker registered successfully:', registration);

    const messaging = getMessaging(app);

    // Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted by admin.');
      return null;
    }

    // Retrieve FCM Device Token
    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      console.log('FCM Token received:', currentToken);
      // Save FCM Token to Firestore for broadcasting
      await setDoc(doc(db, 'fcm_tokens', currentToken.slice(0, 30)), {
        token: currentToken,
        adminName,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Listen to Foreground Push Notifications
      onMessage(messaging, (payload) => {
        console.log('Foreground FCM Message received:', payload);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(payload.notification?.title || '🚨 New Service Booking!', {
            body: payload.notification?.body || 'A new complaint has been registered.',
            icon: '/logo.png'
          });
        }
      });

      return currentToken;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving FCM token:', err);
    return null;
  }
};

/**
 * Real-time listener for Firestore Complaints
 */
export const listenToComplaints = (onUpdate: (complaints: Complaint[]) => void) => {
  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const deletedRaw = localStorage.getItem('wmc_deleted_ids_v1');
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

      const list: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as Complaint;
        if (item && item.id && !deletedIds.includes(item.id.toLowerCase())) {
          list.push(item);
        }
      });
      onUpdate(list);
    }, (err) => {
      console.warn('Firestore snapshot listener warning:', err);
    });
  } catch (err) {
    console.warn('Could not initialize Firebase listener:', err);
    return () => {};
  }
};

/**
 * Trigger an instant test mobile push notification
 */
export const triggerTestPushNotification = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('Push notifications are not supported on this browser.');
    return false;
  }

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    alert('Notification permission denied. Please allow notifications in your mobile browser settings.');
    return false;
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('🚨 Mobile Push Notifications Active!', {
        body: 'Washing Machine Care admin alerts are set up successfully on your device.',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [300, 100, 300, 100, 300],
        tag: 'wmc-test-notif',
        requireInteraction: true,
        data: { url: '/admin' }
      } as any);
      return true;
    } catch (e) {
      console.warn('Service worker showNotification fallback:', e);
    }
  }
  
  new Notification('🚨 Mobile Push Notifications Active!', {
    body: 'Washing Machine Care admin alerts are set up successfully on your device.',
    icon: '/logo.png'
  });
  return true;
};

/**
 * Save / Update single complaint in Firebase Cloud Firestore
 */
export const saveComplaintToFirebase = async (complaint: Complaint): Promise<void> => {
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint, { merge: true });
    
    // Broadcast notification queue event in Firestore for background push dispatcher
    await setDoc(doc(db, 'notification_queue', `notif-${Date.now()}`), {
      title: `🚨 New Repair Booking: ${complaint.id}`,
      body: `${complaint.customer.name} (${complaint.customer.mobile}) - ${complaint.machine.brand} (${complaint.problem.selectedProblems.join(', ')})`,
      complaintId: complaint.id,
      createdAt: new Date().toISOString()
    });

    // Fire mobile OS notification via active service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(`🚨 New Service Booking: ${complaint.id}`, {
          body: `${complaint.customer.name} (${complaint.customer.mobile}) - ${complaint.machine.brand}`,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [300, 100, 300, 100, 300],
          tag: complaint.id,
          requireInteraction: true,
          data: { url: '/admin' }
        } as any);
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Could not save to Firebase, stored in LocalStorage:', err);
  }
};

/**
 * Delete a complaint from Firebase Cloud Firestore
 */
export const deleteComplaintFromFirebase = async (complaintId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'complaints', complaintId));
    if (complaintId !== complaintId.toLowerCase()) {
      await deleteDoc(doc(db, 'complaints', complaintId.toLowerCase()));
    }
  } catch (err) {
    console.warn('Could not delete from Firebase:', err);
  }
};

/**
 * Firebase Authentication: Sign in Admin / Staff account
 */
export const loginAdminWithFirebase = async (email: string, pass: string): Promise<User | null> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (err) {
    console.warn('Firebase auth failed, checking local pin fallback:', err);
    return null;
  }
};

/**
 * Sign out Firebase user
 */
export const signOutFirebaseUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Error signing out Firebase user:', err);
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const subscribeToAuthChanges = (onUserChange: (user: User | null) => void) => {
  return onAuthStateChanged(auth, onUserChange);
};
