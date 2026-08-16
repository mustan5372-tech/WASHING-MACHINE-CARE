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

// Initialize Firebase App & Services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

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
 * Save / Update single complaint in Firebase Cloud Firestore
 */
export const saveComplaintToFirebase = async (complaint: Complaint): Promise<void> => {
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint, { merge: true });
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
