import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Official Firebase configuration for qr-la
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDwKnfXW-HxwhEIZPoEI2hEU7vJwgKGqnU',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'qr-la-b9847.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'qr-la-b9847',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'qr-la-b9847.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '575730786572',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:575730786572:web:531d2bff5964ea9d312929',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-MCG8NWS4R1',
};

export const isRealFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'qr-la-demo'
);

let app: any = null;
let db: any = null;
let storage: any = null;
let auth: any = null;
let analytics: any = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    try {
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
    } catch (_e) {
      db = getFirestore(app);
    }
  } else {
    app = getApp();
    try {
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
    } catch (_e) {
      db = getFirestore(app);
    }
  }
  storage = getStorage(app);
  auth = getAuth(app);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    }).catch(() => {});
  }
} catch (error) {
  console.warn('Firebase initialized in fallback mode:', error);
}

export { app, db, storage, auth, analytics, firebaseConfig };
