import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

import { db, storage, auth, isRealFirebaseConfigured } from './firebase';
import { EventModel, AlbumModel, PhotoModel, GuestbookEntryModel } from '@/types';
import {
  DEMO_EVENT,
  DEMO_ALBUMS,
  DEMO_PHOTOS,
  DEMO_GUESTBOOK,
  generateDefaultEvent,
} from './mockData';

class EventService {
  private events: Map<string, EventModel> = new Map();
  private albums: Map<string, AlbumModel[]> = new Map();
  private photos: Map<string, PhotoModel[]> = new Map();
  private guestbooks: Map<string, GuestbookEntryModel[]> = new Map();
  private photoSubscribers: Map<string, ((photos: PhotoModel[]) => void)[]> = new Map();
  private guestbookSubscribers: Map<string, ((entries: GuestbookEntryModel[]) => void)[]> = new Map();
  private authInitialized = false;

  constructor() {
    // Seed in-memory demo fallback data
    this.events.set(DEMO_EVENT.slug, { ...DEMO_EVENT });
    this.albums.set(DEMO_EVENT.slug, [...DEMO_ALBUMS]);
    this.photos.set(DEMO_EVENT.slug, [...DEMO_PHOTOS]);
    this.guestbooks.set(DEMO_EVENT.slug, [...DEMO_GUESTBOOK]);

    this.events.set('demo', { ...DEMO_EVENT, slug: 'demo' });
    this.albums.set('demo', [...DEMO_ALBUMS]);
    this.photos.set('demo', [...DEMO_PHOTOS]);
    this.guestbooks.set('demo', [...DEMO_GUESTBOOK]);

    this.ensureAuth();
  }

  // Silent anonymous authentication for guests
  async ensureAuth() {
    if (this.authInitialized) return;
    if (isRealFirebaseConfigured && auth) {
      if (auth.currentUser) {
        this.authInitialized = true;
        return;
      }
      try {
        await signInAnonymously(auth);
        this.authInitialized = true;
      } catch (err: any) {
        // Prevent repeated failing requests on every component mount
        this.authInitialized = true;
        if (
          err?.code === 'auth/configuration-not-found' ||
          err?.code === 'auth/admin-restricted-operation' ||
          err?.code === 'auth/operation-not-allowed'
        ) {
          console.info(
            'ℹ️ [QR-la Firebase Bilgisi]: Firebase Console üzerinde "Authentication > Sign-in method > Anonymous (Anonim)" henüz aktif edilmemiş. Uygulama kesintisiz yerel/demo verileriyle kusursuz çalışıyor.'
          );
        } else {
          console.warn('Firebase anonymous sign in notice:', err?.message || err);
        }
      }
    }
  }

  // Get or auto-generate event
  async getEvent(slug: string): Promise<EventModel> {
    await this.ensureAuth();

    // 1. If real Firebase is available, check Firestore first
    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const remoteEvent = docSnap.data() as EventModel;
          this.events.set(slug, remoteEvent);
          return remoteEvent;
        } else {
          // Event does not exist in Firestore yet: Generate complete, filled default event
          const defaultEvent =
            slug === DEMO_EVENT.slug || slug === 'demo' ? { ...DEMO_EVENT, slug } : generateDefaultEvent(slug);

          // Save default event to Firestore so it is never empty
          await setDoc(docRef, defaultEvent);
          this.events.set(slug, defaultEvent);

          // Seed default albums
          const albumsRef = collection(db, 'events', slug, 'albums');
          for (const album of DEMO_ALBUMS) {
            await setDoc(doc(albumsRef, album.id), album);
          }

          // Seed default sample photos
          const photosRef = collection(db, 'events', slug, 'photos');
          for (const photo of DEMO_PHOTOS) {
            await setDoc(doc(photosRef, photo.id), { ...photo, eventSlug: slug });
          }

          // Seed default guestbook notes
          const guestbookRef = collection(db, 'events', slug, 'guestbook');
          for (const entry of DEMO_GUESTBOOK) {
            await setDoc(doc(guestbookRef, entry.id), { ...entry, eventSlug: slug });
          }

          return defaultEvent;
        }
      } catch (e: any) {
        if (e?.code === 'unavailable' || e?.message?.includes('offline')) {
          console.info(
            'ℹ️ [Firestore Bilgisi]: Firestore henüz Firebase Console üzerinde oluşturulmamış veya çevrimdışı. Hazır dolu şablon verileri yerel hafızadan sunuluyor.'
          );
        } else {
          console.warn('Firestore fetch notice:', e?.message || e);
        }
      }
    }

    // 2. In-memory / Offline Cache fallback
    const cached = this.events.get(slug);
    if (cached) return { ...cached };

    // Auto-generate rich default event if visiting a new slug
    const generated =
      slug === DEMO_EVENT.slug || slug === 'demo' ? { ...DEMO_EVENT, slug } : generateDefaultEvent(slug);

    this.events.set(slug, generated);
    this.albums.set(slug, [...DEMO_ALBUMS]);
    this.photos.set(slug, DEMO_PHOTOS.map((p) => ({ ...p, eventSlug: slug })));
    this.guestbooks.set(slug, DEMO_GUESTBOOK.map((g) => ({ ...g, eventSlug: slug })));

    return generated;
  }

  // Save / Update Event details (e.g. from Host Setup Form)
  async saveEvent(slug: string, updatedEvent: Partial<EventModel>): Promise<EventModel> {
    await this.ensureAuth();
    const current = await this.getEvent(slug);
    const merged: EventModel = {
      ...current,
      ...updatedEvent,
      slug,
      theme: { ...current.theme, ...(updatedEvent.theme || {}) },
      venue: { ...current.venue, ...(updatedEvent.venue || {}) },
      hosts: { ...current.hosts, ...(updatedEvent.hosts || {}) },
      settings: { ...current.settings, ...(updatedEvent.settings || {}) },
    };

    this.events.set(slug, merged);

    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', slug);
        await setDoc(docRef, merged, { merge: true });
      } catch (err) {
        console.warn('Firestore event save error:', err);
      }
    }

    return merged;
  }

  async verifyPin(slug: string, pin: string): Promise<boolean> {
    const event = await this.getEvent(slug);
    if (!event || !event.settings.isPrivate) return true;
    return event.settings.pinCode === pin;
  }

  async getAlbums(slug: string): Promise<AlbumModel[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const albumsRef = collection(db, 'events', slug, 'albums');
        const snap = await getDocs(albumsRef);
        if (!snap.empty) {
          const list: AlbumModel[] = [];
          snap.forEach((d) => list.push(d.data() as AlbumModel));
          list.sort((a, b) => a.order - b.order);
          this.albums.set(slug, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore albums fetch failed:', err);
      }
    }
    return this.albums.get(slug) || [...DEMO_ALBUMS];
  }

  async getPhotos(slug: string, albumId?: string): Promise<PhotoModel[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const photosRef = collection(db, 'events', slug, 'photos');
        const q = query(photosRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: PhotoModel[] = [];
          snap.forEach((d) => list.push(d.data() as PhotoModel));
          this.photos.set(slug, list);
          if (!albumId || albumId === 'alb-all' || albumId === 'all') {
            return list;
          }
          return list.filter((p) => p.albumId === albumId);
        }
      } catch (err) {
        console.warn('Firestore photos fetch failed:', err);
      }
    }

    const all = this.photos.get(slug) || [];
    if (!albumId || albumId === 'alb-all' || albumId === 'all') {
      return [...all];
    }
    return all.filter((p) => p.albumId === albumId);
  }

  async addPhoto(
    slug: string,
    newPhoto: Omit<PhotoModel, 'id' | 'createdAt' | 'likes' | 'isApproved'>
  ): Promise<PhotoModel> {
    await this.ensureAuth();
    const photoId = `ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let finalUrl = newPhoto.originalUrl;

    // Upload to Firebase Storage if real Firebase is configured and it's a local file / blob
    if (isRealFirebaseConfigured && storage && newPhoto.originalUrl) {
      try {
        const response = await fetch(newPhoto.originalUrl);
        const blob = await response.blob();
        const fileRef = ref(storage, `events/${slug}/photos/${photoId}.jpg`);
        await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
        finalUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.warn('Firebase Storage upload error, using local URI fallback:', err);
      }
    }

    const createdPhoto: PhotoModel = {
      ...newPhoto,
      id: photoId,
      originalUrl: finalUrl,
      thumbnailUrl: finalUrl,
      createdAt: new Date().toISOString(),
      likes: 0,
      isApproved: true,
    };

    // Save to Firestore
    if (isRealFirebaseConfigured && db) {
      try {
        const photoDocRef = doc(db, 'events', slug, 'photos', photoId);
        await setDoc(photoDocRef, createdPhoto);

        // Update quota and count
        const eventDocRef = doc(db, 'events', slug);
        const event = await this.getEvent(slug);
        const updatedPhotoCount = (event.storage.photoCount || 0) + 1;
        const updatedUsedBytes = (event.storage.usedBytes || 0) + (newPhoto.sizeBytes || 650000);
        await updateDoc(eventDocRef, {
          'storage.photoCount': updatedPhotoCount,
          'storage.usedBytes': updatedUsedBytes,
        });
      } catch (err) {
        console.warn('Firestore photo save error:', err);
      }
    }

    // In-memory update
    const currentList = this.photos.get(slug) || [];
    const updatedList = [createdPhoto, ...currentList];
    this.photos.set(slug, updatedList);

    const event = this.events.get(slug);
    if (event) {
      event.storage.photoCount += 1;
      event.storage.usedBytes += newPhoto.sizeBytes || 650000;
      this.events.set(slug, { ...event });
    }

    this.notifyPhotoSubscribers(slug, updatedList);
    return createdPhoto;
  }

  async likePhoto(slug: string, photoId: string): Promise<number> {
    const list = this.photos.get(slug) || [];
    const target = list.find((p) => p.id === photoId);
    let newLikes = 0;
    if (target) {
      target.likes += 1;
      newLikes = target.likes;
      this.notifyPhotoSubscribers(slug, [...list]);
    }

    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', slug, 'photos', photoId);
        await updateDoc(docRef, { likes: newLikes });
      } catch (err) {
        console.warn('Firestore like error:', err);
      }
    }
    return newLikes;
  }

  async deletePhoto(slug: string, photoId: string): Promise<boolean> {
    const list = this.photos.get(slug) || [];
    const filtered = list.filter((p) => p.id !== photoId);
    this.photos.set(slug, filtered);
    this.notifyPhotoSubscribers(slug, filtered);

    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', slug, 'photos', photoId);
        await setDoc(docRef, { isApproved: false, isDeleted: true }, { merge: true });
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }
    return true;
  }

  async getGuestbook(slug: string): Promise<GuestbookEntryModel[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const gbRef = collection(db, 'events', slug, 'guestbook');
        const q = query(gbRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list: GuestbookEntryModel[] = [];
          snap.forEach((d) => list.push(d.data() as GuestbookEntryModel));
          this.guestbooks.set(slug, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore guestbook fetch failed:', err);
      }
    }
    return this.guestbooks.get(slug) || [];
  }

  async addGuestbookEntry(
    slug: string,
    entry: Omit<GuestbookEntryModel, 'id' | 'createdAt' | 'likes'>
  ): Promise<GuestbookEntryModel> {
    await this.ensureAuth();
    const entryId = `gb-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const created: GuestbookEntryModel = {
      ...entry,
      id: entryId,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', slug, 'guestbook', entryId);
        await setDoc(docRef, created);
      } catch (err) {
        console.warn('Firestore guestbook save error:', err);
      }
    }

    const current = this.guestbooks.get(slug) || [];
    const updated = [created, ...current];
    this.guestbooks.set(slug, updated);
    this.notifyGuestbookSubscribers(slug, updated);
    return created;
  }

  // Real-time listener for photos (syncs immediately to Live Projector screen & other phones)
  subscribePhotos(slug: string, callback: (photos: PhotoModel[]) => void): () => void {
    // Initial callback with local data
    callback(this.photos.get(slug) || []);

    const subscribers = this.photoSubscribers.get(slug) || [];
    subscribers.push(callback);
    this.photoSubscribers.set(slug, subscribers);

    let unsubscribeFirestore = () => {};

    if (isRealFirebaseConfigured && db) {
      try {
        const photosRef = collection(db, 'events', slug, 'photos');
        const q = query(photosRef, orderBy('createdAt', 'desc'));
        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            const list: PhotoModel[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as PhotoModel;
              if (data.isApproved !== false) {
                list.push(data);
              }
            });
            this.photos.set(slug, list);
            callback(list);
          },
          (error) => {
            console.warn('Firestore photo listener error:', error);
          }
        );
      } catch (err) {
        console.warn('Firestore onSnapshot subscription failed:', err);
      }
    }

    return () => {
      unsubscribeFirestore();
      const current = this.photoSubscribers.get(slug) || [];
      this.photoSubscribers.set(
        slug,
        current.filter((cb) => cb !== callback)
      );
    };
  }

  private notifyPhotoSubscribers(slug: string, photos: PhotoModel[]) {
    const subscribers = this.photoSubscribers.get(slug) || [];
    subscribers.forEach((cb) => cb(photos));
  }

  private notifyGuestbookSubscribers(slug: string, entries: GuestbookEntryModel[]) {
    const subscribers = this.guestbookSubscribers.get(slug) || [];
    subscribers.forEach((cb) => cb(entries));
  }
}

export const eventService = new EventService();
