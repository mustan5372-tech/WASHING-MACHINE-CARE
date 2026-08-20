import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import type { Complaint, ProblemType } from '../types';

// Live Firebase Web App configuration:
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
 * Play a high-volume multi-tone loud alert chime using Web Audio API when website is open
 */
export const playLoudInWebsiteBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const tones = [
      { freq: 880, start: 0, duration: 0.18 },
      { freq: 1108.73, start: 0.20, duration: 0.18 },
      { freq: 1318.51, start: 0.40, duration: 0.20 },
      { freq: 1760, start: 0.65, duration: 0.35 }
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.start);
      gain.gain.setValueAtTime(0.85, ctx.currentTime + t.start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t.start + t.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + t.start);
      osc.stop(ctx.currentTime + t.start + t.duration);
    });
  } catch (e) {
    console.warn('Audio play error:', e);
  }
};

/**
 * Real-time listener for Firestore Complaints (Syncs across all logged-in accounts instantly)
 */
export const listenToComplaints = (onUpdate: (complaints: Complaint[]) => void) => {
  try {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const deletedRaw = localStorage.getItem('wmc_deleted_ids_v1');
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

      const purgedRaw = localStorage.getItem('wmc_purged_at_v1');
      const purgedAt = purgedRaw ? parseInt(purgedRaw, 10) : 0;

      const list: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as Complaint;
        if (!item || typeof item !== 'object' || !item.id) return;

        const lowerId = item.id.toLowerCase();
        if (deletedIds.includes(lowerId)) return;
        if ((item as any).isDeleted === true || (item as any).status === 'DELETED') return;

        if (purgedAt > 0 && item.createdAt) {
          const cTime = new Date(item.createdAt).getTime();
          if (!isNaN(cTime) && cTime <= purgedAt) return;
        }

        list.push({
          ...item,
          customer: {
            name: item.customer?.name || 'Customer',
            mobile: item.customer?.mobile || '',
            whatsapp: item.customer?.whatsapp || item.customer?.mobile || '',
            whatsappSameAsMobile: item.customer?.whatsappSameAsMobile ?? true,
            houseNo: item.customer?.houseNo || '',
            streetArea: item.customer?.streetArea || '',
            landmark: item.customer?.landmark || '',
            city: item.customer?.city || 'Indore',
            pincode: item.customer?.pincode || '452009'
          },
          machine: {
            brand: item.machine?.brand || 'Washing Machine',
            otherBrand: item.machine?.otherBrand || '',
            type: item.machine?.type || 'Fully Automatic Top Load',
            age: item.machine?.age || '1–3 years'
          },
          problem: {
            selectedProblems: Array.isArray(item.problem?.selectedProblems) && item.problem.selectedProblems.length > 0 
              ? item.problem.selectedProblems 
              : ['Other Problem' as ProblemType],
            errorCode: item.problem?.errorCode || '',
            additionalDetails: item.problem?.additionalDetails || ''
          },
          status: item.status || 'New Complaint',
          createdAt: item.createdAt || new Date().toISOString()
        });
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
    if (complaintId !== complaintId.toLowerCase()) {
      await deleteDoc(doc(db, 'complaints', complaintId.toLowerCase()));
    }
  } catch (err) {
    console.warn('Could not delete from Firebase:', err);
  }
};

/**
 * Permanently delete ALL complaints from Firebase Cloud Firestore (Clear all test data)
 */
export const deleteAllComplaintsFromFirebase = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'complaints'));
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, 'complaints', docSnap.id)));
    await Promise.all(deletePromises);
    console.log('All complaints deleted permanently from Firebase Firestore.');
  } catch (err) {
    console.warn('Could not wipe all complaints from Firebase:', err);
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

