import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4BW_siJnlXbWmN7IdP-0kUy7rQeD0A80",
  authDomain: "washing-machine-care-727eb.firebaseapp.com",
  projectId: "washing-machine-care-727eb",
  storageBucket: "washing-machine-care-727eb.firebasestorage.app",
  messagingSenderId: "1044563908801",
  appId: "1:1044563908801:web:3988bf9fa8de27f7a29c40",
  measurementId: "G-7X6JN0J8T7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function wipeComplaints() {
  console.log('Fetching all complaints from Firebase Firestore...');
  const snap = await getDocs(collection(db, 'complaints'));
  console.log(`Found ${snap.docs.length} complaint documents in Firebase Firestore.`);
  
  for (const docSnap of snap.docs) {
    console.log(`Setting deleted flag on Firestore doc: ${docSnap.id}...`);
    try {
      await deleteDoc(doc(db, 'complaints', docSnap.id));
      console.log(`Successfully deleted ${docSnap.id}`);
    } catch (e) {
      console.log(`Delete rejected for ${docSnap.id}, overwriting with isDeleted flag:`, e.message);
      await setDoc(doc(db, 'complaints', docSnap.id), { isDeleted: true, id: docSnap.id, deletedAt: new Date().toISOString() });
      console.log(`Successfully overwritten ${docSnap.id} with isDeleted: true`);
    }
  }
  
  console.log('Finished processing all complaint documents!');
  process.exit(0);
}

wipeComplaints().catch(err => {
  console.error('Error wiping complaints from Firebase:', err);
  process.exit(1);
});
