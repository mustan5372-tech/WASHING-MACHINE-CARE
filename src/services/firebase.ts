import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import type { Complaint } from '../types';

// Replace with your Firebase Web App configuration from Firebase Console:
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForWashingMachineCare",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "washing-machine-care.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "washing-machine-care",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "washing-machine-care.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

/**
 * Upload local complaints to Cloud Firestore
 */
export const syncComplaintsToFirebase = async (complaints: Complaint[]): Promise<boolean> => {
  try {
    for (const c of complaints) {
      await setDoc(doc(db, 'complaints', c.id), c, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn('Firebase sync warning (offline or demo credentials):', err);
    return false;
  }
};

/**
 * Real-time listener for Firestore Complaints
 */
export const listenToComplaints = (onUpdate: (complaints: Complaint[]) => void) => {
  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Complaint);
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Firestore snapshot error:', err);
    });
  } catch (err) {
    console.warn('Could not initialize Firebase listener:', err);
    return () => {};
  }
};

/**
 * Save single complaint to Firebase
 */
export const saveComplaintToFirebase = async (complaint: Complaint): Promise<void> => {
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint, { merge: true });
  } catch (err) {
    console.warn('Could not save to Firebase, falling back to LocalStorage:', err);
  }
};

/**
 * Firestore Security Rules documentation for Admin Security:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // General public can create complaints (Book Repair) and read status by ID
 *     match /complaints/{complaintId} {
 *       allow create: if true;
 *       allow read: if request.auth != null || true; // Public can track complaint
 *       allow update, delete: if request.auth != null; // Only authenticated admins can modify
 *     }
 *     // Settings & Financial Analytics are restricted to authenticated Admins only
 *     match /settings/{docId} {
 *       allow read, write: if request.auth != null;
 *     }
 *   }
 * }
 */
