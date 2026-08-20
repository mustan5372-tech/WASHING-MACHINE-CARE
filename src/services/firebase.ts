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
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import type { Complaint, ProblemType } from '../types';
import { isLegacyTestComplaint } from './storage';

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
 * Scans Cloud Firestore and hard-deletes any legacy test complaints or deleted items
 */
export const cleanLegacyFirestoreTestComplaints = async (): Promise<void> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'complaints'));
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = (data && data.id) || docSnap.id;
      if (isLegacyTestComplaint(id, data?.createdAt) || isLegacyTestComplaint(docSnap.id, data?.createdAt) || data?.isDeleted === true || data?.status === 'DELETED') {
        deletePromises.push(deleteDoc(docSnap.ref));
      }
    });
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Cleaned ${deletePromises.length} legacy test complaints from Cloud Firestore.`);
    }
  } catch (err) {
    console.warn('Legacy cloud clean error:', err);
  }
};

/**
 * Real-time listener for Firestore Complaints (Syncs across all logged-in accounts instantly)
 */
export const listenToComplaints = (onUpdate: (complaints: Complaint[]) => void) => {
  try {
    // Run cloud auto-clean of any legacy test documents sitting in Cloud Firestore
    cleanLegacyFirestoreTestComplaints().catch(() => {});

    let cloudDeletedIds: string[] = [];
    let cloudPurgedAt = 0;

    // 1. Listen to global cloud deletions document
    onSnapshot(doc(db, 'system', 'deletions'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.ids)) {
          cloudDeletedIds = data.ids.map((id: string) => id.toLowerCase());
          try {
            const localRaw = localStorage.getItem('wmc_deleted_ids_v1');
            const localIds: string[] = localRaw ? JSON.parse(localRaw) : [];
            const merged = Array.from(new Set([...localIds, ...cloudDeletedIds]));
            localStorage.setItem('wmc_deleted_ids_v1', JSON.stringify(merged));
          } catch (e) {}
        }
      }
    }, () => {});

    // 2. Listen to global cloud purged document
    onSnapshot(doc(db, 'system', 'purged'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.purgedAt === 'number' && data.purgedAt > cloudPurgedAt) {
          cloudPurgedAt = data.purgedAt;
          try {
            localStorage.setItem('wmc_purged_at_v1', cloudPurgedAt.toString());
          } catch (e) {}
        }
      }
    }, () => {});

    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const deletedRaw = localStorage.getItem('wmc_deleted_ids_v1');
      const localDeletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      const allDeletedIds = Array.from(new Set([...localDeletedIds, ...cloudDeletedIds]));

      const purgedRaw = localStorage.getItem('wmc_purged_at_v1');
      const localPurgedAt = purgedRaw ? parseInt(purgedRaw, 10) : 0;
      const effectivePurgedAt = Math.max(localPurgedAt, cloudPurgedAt);

      const list: Complaint[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as Complaint;
        if (!item || typeof item !== 'object' || !item.id) {
          deleteDoc(docSnap.ref).catch(() => {});
          return;
        }

        // Permanently ignore & hard-delete any legacy test complaint from Firestore
        if (isLegacyTestComplaint(item.id, item.createdAt) || isLegacyTestComplaint(docSnap.id, item.createdAt)) {
          deleteDoc(docSnap.ref).catch(() => {});
          return;
        }

        const lowerId = item.id.toLowerCase();
        const lowerDocId = docSnap.id.toLowerCase();

        // Check if deleted locally or in cloud
        if (allDeletedIds.includes(lowerId) || allDeletedIds.includes(lowerDocId)) {
          deleteDoc(docSnap.ref).catch(() => {});
          return;
        }
        if ((item as any).isDeleted === true || (item as any).status === 'DELETED') {
          deleteDoc(docSnap.ref).catch(() => {});
          return;
        }

        // Check if created before effective purgedAt timestamp
        if (effectivePurgedAt > 0 && item.createdAt) {
          const cTime = new Date(item.createdAt).getTime();
          if (!isNaN(cTime) && cTime <= effectivePurgedAt) {
            deleteDoc(docSnap.ref).catch(() => {});
            return;
          }
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
 * Delete a complaint from Firebase Cloud Firestore and sync deletion globally across all devices
 */
export const deleteComplaintFromFirebase = async (complaintId: string): Promise<void> => {
  try {
    const lowerId = complaintId.toLowerCase();

    // 1. Write to cloud deleted IDs list so all devices instantly blacklist it
    await setDoc(doc(db, 'system', 'deletions'), {
      ids: arrayUnion(complaintId, lowerId)
    }, { merge: true }).catch(() => {});

    // 2. Mark doc as DELETED in case deleteDoc takes time
    await setDoc(doc(db, 'complaints', complaintId), { isDeleted: true, status: 'DELETED' }, { merge: true }).catch(() => {});
    await setDoc(doc(db, 'complaints', lowerId), { isDeleted: true, status: 'DELETED' }, { merge: true }).catch(() => {});

    // 3. Delete docs by ID
    await deleteDoc(doc(db, 'complaints', complaintId)).catch(() => {});
    if (complaintId !== lowerId) {
      await deleteDoc(doc(db, 'complaints', lowerId)).catch(() => {});
    }

    // 4. Query all docs in complaints collection matching this ID
    const snap = await getDocs(collection(db, 'complaints'));
    const matches: Promise<void>[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (d.id.toLowerCase() === lowerId || (data && data.id && data.id.toLowerCase() === lowerId)) {
        matches.push(deleteDoc(d.ref));
      }
    });
    if (matches.length > 0) {
      await Promise.all(matches);
    }
  } catch (err) {
    console.warn('Could not delete from Firebase:', err);
  }
};

/**
 * Permanently delete ALL complaints from Firebase Cloud Firestore (Clear all test data across all devices)
 */
export const deleteAllComplaintsFromFirebase = async (): Promise<void> => {
  try {
    const now = Date.now();

    // 1. Write purgedAt to Cloud Firestore system/purged so all devices know data was wiped
    await setDoc(doc(db, 'system', 'purged'), { purgedAt: now }, { merge: true });
    await setDoc(doc(db, 'system', 'deletions'), { ids: [] }, { merge: true });

    // 2. Delete ALL documents in complaints collection
    const querySnapshot = await getDocs(collection(db, 'complaints'));
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, 'complaints', docSnap.id)));
    await Promise.all(deletePromises);
    console.log('All complaints deleted permanently from Firebase Cloud Firestore.');
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

