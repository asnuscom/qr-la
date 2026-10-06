import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, isRealFirebaseConfigured } from './firebase';
import { UserModel, AuthState } from '@/types';
import { eventService } from './eventService';
import { slugify } from './mockData';
import { appStorage } from './storage';

const SESSION_STORAGE_KEY = 'qr_la_host_session';

const DEMO_USER: UserModel = {
  uid: 'demo-host-yavuz',
  email: 'samet@qr-la.com',
  displayName: 'Samet & Şule (Ev Sahibi)',
  isHost: true,
  events: ['demo-panel', 'samet-ve-sule', 'yavuz-ve-merve'],
  createdAt: '2026-10-01T00:00:00.000Z',
};

class AuthService {
  private state: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  };
  private subscribers: ((state: AuthState) => void)[] = [];

  constructor() {
    // Immediately restore cached session from local-storage on startup!
    const cachedSession = appStorage.getItem(SESSION_STORAGE_KEY);
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession) as UserModel;
        if (parsed && parsed.uid) {
          this.state = {
            user: parsed,
            isAuthenticated: true,
            isLoading: false,
          };
        }
      } catch (_) {}
    }

    this.init();
  }

  private init() {
    if (isRealFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser && !firebaseUser.isAnonymous) {
          // Fetch additional profile from Firestore if exists
          let userProfile: UserModel = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Ev Sahibi',
            photoURL: firebaseUser.photoURL || undefined,
            isHost: true,
            events: [],
            createdAt: new Date().toISOString(),
          };

          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userProfile = { ...userProfile, ...(userDoc.data() as UserModel) };
              }
            } catch (err) {
              console.warn('User profile fetch error:', err);
            }
          }

          // Ensure real users get their own personalized event (not demo-panel)
          const personalSlug = await eventService.ensureUserEvent(userProfile);
          if (!userProfile.events || userProfile.events.length === 0 || userProfile.events.includes('demo-panel')) {
            userProfile.events = [personalSlug];
            if (db) {
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), userProfile, { merge: true });
              } catch (_) {}
            }
          }

          appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));

          this.updateState({
            user: userProfile,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (firebaseUser && firebaseUser.isAnonymous) {
          // Anonymous login for guest should NOT clear the host's stored session!
          const stored = appStorage.getItem(SESSION_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as UserModel;
              this.updateState({ user: parsed, isAuthenticated: true, isLoading: false });
              return;
            } catch (_) {}
          }
          this.updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else {
          // If Firebase reports signed out, verify if local-storage has a session
          const stored = appStorage.getItem(SESSION_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as UserModel;
              this.updateState({ user: parsed, isAuthenticated: true, isLoading: false });
              return;
            } catch (_) {}
          }
          this.updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    } else {
      // By default in offline/demo mode, check if we have a simulated session
      const stored = appStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as UserModel;
          this.updateState({ user: parsed, isAuthenticated: true, isLoading: false });
          return;
        } catch (_) {}
      }
      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(callback: (state: AuthState) => void): () => void {
    callback({ ...this.state });
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private updateState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach((cb) => cb({ ...this.state }));
  }

  // Sign In with Email & Password
  async signIn(email: string, pass: string): Promise<UserModel> {
    if (isRealFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      let userProfile: UserModel = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        isHost: true,
        events: [],
        createdAt: new Date().toISOString(),
      };

      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userProfile = { ...userProfile, ...(userDoc.data() as UserModel) };
          }
        } catch (_) {}
      }

      const personalSlug = await eventService.ensureUserEvent(userProfile);
      if (!userProfile.events || userProfile.events.length === 0 || userProfile.events.includes('demo-panel')) {
        userProfile.events = [personalSlug];
        if (db) {
          try {
            await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
          } catch (_) {}
        }
      }

      appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      this.updateState({ user: userProfile, isAuthenticated: true });
      return userProfile;
    } else {
      // Fallback/demo authentication
      const rawName = email.split('@')[0];
      const cleanSlug = slugify(rawName);
      const userProfile: UserModel = {
        uid: `user-${Date.now()}`,
        email,
        displayName: rawName,
        isHost: true,
        events: [cleanSlug],
        createdAt: new Date().toISOString(),
      };
      await eventService.getEvent(cleanSlug, rawName);
      appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      this.updateState({ user: userProfile, isAuthenticated: true });
      return userProfile;
    }
  }

  // Register / Sign Up
  async signUp(email: string, pass: string, displayName: string, customSlug?: string): Promise<UserModel> {
    if (isRealFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;

      await updateProfile(user, { displayName });

      const userProfile: UserModel = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || email.split('@')[0],
        isHost: true,
        events: [],
        createdAt: new Date().toISOString(),
      };

      const personalSlug = await eventService.ensureUserEvent(userProfile, customSlug);
      userProfile.events = [personalSlug];

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid), userProfile);
        } catch (err) {
          console.warn('Save user doc error:', err);
        }
      }

      appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      this.updateState({ user: userProfile, isAuthenticated: true });
      return userProfile;
    } else {
      const cleanSlug = customSlug ? slugify(customSlug) : slugify(displayName || email.split('@')[0]);
      const userProfile: UserModel = {
        uid: `user-${Date.now()}`,
        email,
        displayName,
        isHost: true,
        events: [cleanSlug],
        createdAt: new Date().toISOString(),
      };
      await eventService.getEvent(cleanSlug, displayName);
      appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      this.updateState({ user: userProfile, isAuthenticated: true });
      return userProfile;
    }
  }

  // Associate a created / edited event slug with current user
  async addEventToUser(uid: string, slug: string): Promise<void> {
    if (this.state.user && this.state.user.uid === uid) {
      const updatedEvents = Array.from(new Set([slug, ...(this.state.user.events || [])]));
      const updatedUser = { ...this.state.user, events: updatedEvents };
      appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      this.updateState({ user: updatedUser });
      if (isRealFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'users', uid), { events: updatedEvents }, { merge: true });
        } catch (_) {}
      }
    }
  }

  // Instant 1-click Demo Host Sign In
  async signInAsDemoHost(): Promise<UserModel> {
    appStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(DEMO_USER));
    this.updateState({
      user: { ...DEMO_USER },
      isAuthenticated: true,
      isLoading: false,
    });
    return DEMO_USER;
  }

  // Sign Out
  async signOut(): Promise<void> {
    appStorage.removeItem(SESSION_STORAGE_KEY);
    if (isRealFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    this.updateState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }
}

export const authService = new AuthService();
