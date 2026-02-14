import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  enableNetwork,
  disableNetwork,
  addDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import type { Guest, ConfirmationStatus } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const guestsCollection = collection(db, 'guests');

export const subscribeToGuests = (
  callback: (guests: Guest[], fromCache: boolean) => void,
  onError?: (error: Error) => void
) => {
  return onSnapshot(
    guestsCollection,
    { includeMetadataChanges: true },
    (snapshot) => {
      const guests: Guest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Guest));

      // Sort by row number
      guests.sort((a, b) => a.rowNumber - b.rowNumber);

      // Pass whether data is from cache (offline) or server
      const fromCache = snapshot.metadata.fromCache;
      callback(guests, fromCache);
    },
    (error) => {
      console.error('Firebase listener error:', error);
      onError?.(error);
    }
  );
};

// Force reconnection to Firebase
export const reconnectFirebase = async () => {
  await disableNetwork(db);
  await enableNetwork(db);
};

export const updateGuestStatus = async (
  guestId: string,
  updates: {
    alreadySpoke?: boolean;
    confirmationStatus?: ConfirmationStatus;
    handledBy?: string;
    phone?: string;
    name?: string;
    age?: string;
    notes?: string;
    framework?: string;
  }
) => {
  const guestRef = doc(db, 'guests', guestId);
  await updateDoc(guestRef, {
    ...updates,
    lastUpdated: Timestamp.now(),
  });
};

export const addGuest = async (guestData: Omit<Guest, 'id' | 'lastUpdated'>) => {
  const docRef = await addDoc(guestsCollection, {
    ...guestData,
    lastUpdated: Timestamp.now(),
  });
  return docRef.id;
};

export const removeGuest = async (guestId: string) => {
  const guestRef = doc(db, 'guests', guestId);
  await deleteDoc(guestRef);
};

export const resetAllGuestsStatus = async (guests: Guest[]) => {
  const batch = writeBatch(db);
  for (const guest of guests) {
    const guestRef = doc(db, 'guests', guest.id);
    batch.update(guestRef, {
      alreadySpoke: false,
      confirmationStatus: 'טרם טופל',
      lastUpdated: Timestamp.now(),
    });
  }
  await batch.commit();
};
