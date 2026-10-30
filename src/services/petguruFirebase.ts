import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

export const PETGURU_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB7b8vyKIEuZYI4Li6frJbX_cC2cQ5gBvE',
  authDomain: 'petguru-5a38c.firebaseapp.com',
  projectId: 'petguru-5a38c',
  storageBucket: 'petguru-5a38c.firebasestorage.app',
  messagingSenderId: '391502633886',
  appId: '1:391502633886:web:bca499d47d05c52992548f',
  measurementId: 'G-LPPK9NYEW2',
};

let petguruApp: FirebaseApp | null = null;
let petguruDb: Firestore | null = null;

try {
  const existing = getApps().find((a) => a.name === 'petguru');
  if (existing) {
    petguruApp = existing;
  } else {
    petguruApp = initializeApp(PETGURU_FIREBASE_CONFIG, 'petguru');
  }

  try {
    petguruDb = initializeFirestore(petguruApp, { ignoreUndefinedProperties: true });
  } catch (_e) {
    petguruDb = getFirestore(petguruApp);
  }
} catch (err) {
  console.warn('Petguru Firebase init warning:', err);
}

export { petguruApp, petguruDb };
