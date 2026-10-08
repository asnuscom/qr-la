import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { AlbumModel, EventModel, GuestbookEntryModel, PhotoModel, StorageInfo, StorageTier } from '@/types';
import { auth, db, isRealFirebaseConfigured, storage } from './firebase';
import {
  DEFAULT_ALBUMS,
  DEMO_ALBUMS,
  DEMO_EVENT,
  DEMO_GUESTBOOK,
  DEMO_PHOTOS,
  generateDefaultEvent,
  slugify,
} from './mockData';
import { appStorage } from './storage';

export const RESERVED_SLUGS = new Set([
  'demo',
  'demo-panel',
  'canli',
  'panel',
  'giris',
  'login',
  'register',
  'auth',
  'admin',
  'api',
  'settings',
  'null',
  'undefined',
  'samet-ve-sule',
]);

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'object' && item !== null && !(item instanceof Date)
        ? sanitizeForFirestore(item)
        : item
    );
  }
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

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

    // Aliases for demo
    this.events.set('demo-panel', { ...DEMO_EVENT, slug: 'demo-panel' });
    this.albums.set('demo-panel', [...DEMO_ALBUMS]);
    this.photos.set('demo-panel', [...DEMO_PHOTOS]);
    this.guestbooks.set('demo-panel', [...DEMO_GUESTBOOK]);

    this.events.set('demo', { ...DEMO_EVENT, slug: 'demo' });
    this.albums.set('demo', [...DEMO_ALBUMS]);
    this.photos.set('demo', [...DEMO_PHOTOS]);
    this.guestbooks.set('demo', [...DEMO_GUESTBOOK]);

    this.events.set('samet-ve-sule', { ...DEMO_EVENT, slug: 'samet-ve-sule' });
    this.albums.set('samet-ve-sule', [...DEMO_ALBUMS]);
    this.photos.set('samet-ve-sule', [...DEMO_PHOTOS]);
    this.guestbooks.set('samet-ve-sule', [...DEMO_GUESTBOOK]);

  }

  // Silent anonymous authentication for guests (only when adding photos/guestbook)
  async ensureAuth() {
    if (this.authInitialized && auth?.currentUser) return;
    if (isRealFirebaseConfigured && auth) {
      if (auth.currentUser) {
        this.authInitialized = true;
        return;
      }
      try {
        await signInAnonymously(auth);
        this.authInitialized = true;
      } catch (err: any) {
        this.authInitialized = true;
        if (
          err?.code === 'auth/configuration-not-found' ||
          err?.code === 'auth/admin-restricted-operation' ||
          err?.code === 'auth/operation-not-allowed'
        ) {
          console.info(
            'ℹ️ [QR-la Firebase Bilgisi]: Firebase Console üzerinde "Authentication > Sign-in method > Anonymous (Anonim)" henüz aktif edilmemiş.'
          );
        } else {
          console.warn('Firebase anonymous sign in notice:', err?.message || err);
        }
      }
    }
  }

  // Get or auto-generate event
  async getEvent(slug: string, hostDisplayName?: string): Promise<EventModel> {
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
          // Event does not exist in Firestore yet: Generate complete event
          const isDemoSlug =
            slug === DEMO_EVENT.slug || slug === 'demo' || slug === 'demo-panel' || slug === 'samet-ve-sule';
          const defaultEvent = isDemoSlug
            ? { ...DEMO_EVENT, slug }
            : generateDefaultEvent(slug, hostDisplayName);

          // Save default event to Firestore so it is never empty
          await setDoc(docRef, defaultEvent);
          this.events.set(slug, defaultEvent);

          // Seed default albums for photo categorization (0 count for real users)
          const albumsToSeed = isDemoSlug ? DEMO_ALBUMS : DEFAULT_ALBUMS;
          const albumsRef = collection(db, 'events', slug, 'albums');
          for (const album of albumsToSeed) {
            await setDoc(doc(albumsRef, album.id), album);
          }

          // Seed sample photos and guestbook ONLY for the demo wedding
          if (isDemoSlug) {
            const photosRef = collection(db, 'events', slug, 'photos');
            for (const photo of DEMO_PHOTOS) {
              await setDoc(doc(photosRef, photo.id), { ...photo, eventSlug: slug });
            }

            const guestbookRef = collection(db, 'events', slug, 'guestbook');
            for (const entry of DEMO_GUESTBOOK) {
              await setDoc(doc(guestbookRef, entry.id), { ...entry, eventSlug: slug });
            }
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

    const stored = this.loadSavedEventFromStorage(slug);
    if (stored) {
      this.events.set(slug, stored);
      return { ...stored };
    }

    // Auto-generate rich default event if visiting a new slug
    const isDemo =
      slug === DEMO_EVENT.slug || slug === 'demo' || slug === 'demo-panel' || slug === 'samet-ve-sule';
    const generated = isDemo
      ? { ...DEMO_EVENT, slug }
      : generateDefaultEvent(slug, hostDisplayName);

    this.events.set(slug, generated);
    this.albums.set(slug, isDemo ? [...DEMO_ALBUMS] : [...DEFAULT_ALBUMS]);

    if (isDemo) {
      this.photos.set(slug, DEMO_PHOTOS.map((p) => ({ ...p, eventSlug: slug })));
      this.guestbooks.set(slug, DEMO_GUESTBOOK.map((g) => ({ ...g, eventSlug: slug })));
    } else {
      this.photos.set(slug, []);
      this.guestbooks.set(slug, []);
    }

    return generated;
  }

  // Check if a desired slug is available
  async checkSlugAvailability(
    rawSlug: string,
    currentUserId?: string
  ): Promise<{ available: boolean; formattedSlug: string; reason?: string }> {
    const formattedSlug = slugify(rawSlug);

    if (!formattedSlug || formattedSlug.length < 3) {
      return {
        available: false,
        formattedSlug,
        reason: 'Bağlantı adı en az 3 karakterden oluşmalıdır.',
      };
    }

    if (RESERVED_SLUGS.has(formattedSlug)) {
      return {
        available: false,
        formattedSlug,
        reason: 'Bu bağlantı adı sistem / demo kullanımı için ayrılmıştır.',
      };
    }

    // 1. Check Firestore if real Firebase is configured
    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'events', formattedSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return {
            available: false,
            formattedSlug,
            reason: `"${formattedSlug}" bağlantısı başka bir çift tarafından alınmış.`,
          };
        }
      } catch (err) {
        console.warn('Slug check firestore error:', err);
      }
    }

    // 2. Check local memory / storage
    const localEvent = this.events.get(formattedSlug) || this.loadSavedEventFromStorage(formattedSlug);
    if (localEvent) {
      const isDemo =
        formattedSlug === DEMO_EVENT.slug ||
        formattedSlug === 'demo' ||
        formattedSlug === 'demo-panel' ||
        formattedSlug === 'samet-ve-sule';
      if (isDemo || (localEvent.id && !localEvent.id.includes(currentUserId || 'none'))) {
        return {
          available: false,
          formattedSlug,
          reason: `"${formattedSlug}" bağlantısı daha önce kullanılmış.`,
        };
      }
    }

    return {
      available: true,
      formattedSlug,
      reason: undefined,
    };
  }

  // Ensure real registered user has a personalized event with 0 photos / 0 bytes
  async ensureUserEvent(
    user: { uid: string; displayName?: string; email?: string; events?: string[] },
    customSlug?: string
  ): Promise<string> {
    if (user.uid === 'demo-host-yavuz') return 'demo-panel';

    const existing = user.events?.find(
      (s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule'
    );
    if (existing && !customSlug) {
      await this.getEvent(existing, user.displayName);
      return existing;
    }

    const targetSlug = customSlug ? slugify(customSlug) : slugify(user.displayName || user.email?.split('@')[0] || 'etkinlik');
    const cleanSlug = targetSlug || 'etkinlik';

    await this.getEvent(cleanSlug, user.displayName);
    return cleanSlug;
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
    this.saveEventToStorage(slug, merged);

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

  private loadSavedEventFromStorage(slug: string): EventModel | null {
    try {
      const data = appStorage.getItem(`qr_la_event_${slug}`);
      if (data) {
        return JSON.parse(data) as EventModel;
      }
    } catch (_e) { }
    return null;
  }

  private saveEventToStorage(slug: string, event: EventModel): void {
    try {
      appStorage.setItem(`qr_la_event_${slug}`, JSON.stringify(event));
    } catch (_e) { }
  }

  async upgradeStorageTier(
    slug: string,
    tier: StorageTier,
    retentionDays: number,
    quotaMB: number
  ): Promise<EventModel> {
    const current = await this.getEvent(slug);
    const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const updatedStorage: StorageInfo = {
      ...current.storage,
      tier,
      quotaBytes: quotaMB * 1024 * 1024,
      expiresAt,
    };

    const updatedSettings = {
      ...current.settings,
      ...(tier === 'premium' || tier === 'vip'
        ? { isLiveFeedActive: true, allowGuestDownloads: true }
        : {}),
    };

    return await this.saveEvent(slug, {
      storage: updatedStorage,
      settings: updatedSettings,
    });
  }

  private loadSavedAlbumsFromStorage(slug: string): AlbumModel[] {
    try {
      const data = appStorage.getItem(`qr_la_albums_${slug}`);
      if (data) {
        return JSON.parse(data) as AlbumModel[];
      }
    } catch (_e) { }
    return [];
  }

  private saveAlbumsToStorage(slug: string, albums: AlbumModel[]): void {
    try {
      appStorage.setItem(`qr_la_albums_${slug}`, JSON.stringify(albums));
    } catch (_e) { }
  }

  async getAlbums(slug: string): Promise<AlbumModel[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const albumsRef = collection(db, 'events', slug, 'albums');
        const snap = await getDocs(albumsRef);
        if (!snap.empty) {
          const list: AlbumModel[] = [];
          snap.forEach((d) => {
            const data = d.data() as AlbumModel;
            if (!(data as any).isDeleted) {
              list.push(data);
            }
          });
          list.sort((a, b) => a.order - b.order);
          if (list.length > 0) {
            this.albums.set(slug, list);
            this.saveAlbumsToStorage(slug, list);
            return list;
          }
        }
      } catch (err) {
        console.warn('Firestore albums fetch notice:', err);
      }
    }

    const saved = this.loadSavedAlbumsFromStorage(slug);
    if (saved && saved.length > 0) {
      this.albums.set(slug, saved);
      return saved;
    }

    const isDemo =
      slug === DEMO_EVENT.slug || slug === 'demo' || slug === 'demo-panel' || slug === 'samet-ve-sule';
    const defaults = isDemo ? [...DEMO_ALBUMS] : [...DEFAULT_ALBUMS];
    this.albums.set(slug, defaults);
    this.saveAlbumsToStorage(slug, defaults);
    return defaults;
  }

  async saveAlbums(slug: string, albums: AlbumModel[]): Promise<AlbumModel[]> {
    const normalized = albums.map((alb, idx) => ({
      ...alb,
      order: idx,
    }));
    this.albums.set(slug, normalized);
    this.saveAlbumsToStorage(slug, normalized);

    if (isRealFirebaseConfigured && db) {
      try {
        const albumsRef = collection(db, 'events', slug, 'albums');
        for (const album of normalized) {
          await setDoc(doc(albumsRef, album.id), album, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore albums save error:', err);
      }
    }

    return normalized;
  }

  async addAlbum(slug: string, name: string): Promise<AlbumModel> {
    const current = await this.getAlbums(slug);
    const cleanName = name.trim();
    const newAlbum: AlbumModel = {
      id: `alb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: slugify(cleanName) || `cat-${Date.now()}`,
      name: cleanName,
      order: current.length,
      photoCount: 0,
    };
    const updated = [...current, newAlbum];
    await this.saveAlbums(slug, updated);
    return newAlbum;
  }

  async updateAlbum(slug: string, albumId: string, newName: string): Promise<AlbumModel[]> {
    const current = await this.getAlbums(slug);
    const cleanName = newName.trim();
    const updated = current.map((a) =>
      a.id === albumId ? { ...a, name: cleanName, slug: slugify(cleanName) || a.slug } : a
    );
    await this.saveAlbums(slug, updated);
    return updated;
  }

  async deleteAlbum(slug: string, albumId: string): Promise<AlbumModel[]> {
    const current = await this.getAlbums(slug);
    if (albumId === 'alb-all' || albumId === 'alb-genel' || albumId === 'all') {
      return current; // Core categories cannot be deleted
    }
    const updated = current.filter((a) => a.id !== albumId);
    await this.saveAlbums(slug, updated);

    if (isRealFirebaseConfigured && db) {
      try {
        const albumDoc = doc(db, 'events', slug, 'albums', albumId);
        await setDoc(albumDoc, { isDeleted: true }, { merge: true });
      } catch (_err) { }
    }
    return updated;
  }

  private loadSavedPhotosFromStorage(slug: string): PhotoModel[] {
    try {
      const data = appStorage.getItem(`qr_la_photos_${slug}`);
      if (data) {
        return JSON.parse(data) as PhotoModel[];
      }
    } catch (_e) { }
    return [];
  }

  private savePhotosToStorage(slug: string, photos: PhotoModel[]): void {
    try {
      appStorage.setItem(`qr_la_photos_${slug}`, JSON.stringify(photos));
    } catch (_e) { }
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
          this.savePhotosToStorage(slug, list);
          if (!albumId || albumId === 'alb-all' || albumId === 'all') {
            return list;
          }
          return list.filter((p) => p.albumId === albumId);
        }
      } catch (err: any) {
        if (
          err?.code === 'permission-denied' ||
          err?.message?.includes('Missing or insufficient permissions')
        ) {
          console.info(
            'ℹ️ [Firestore Bilgisi]: Firestore Güvenlik Kuralları (Security Rules) izni kısıtlı. Firebase Console > Firestore > Rules sekmesinden "allow read, write: if true;" yapılarak yayınlanmalıdır.'
          );
        } else {
          console.warn('Firestore photos fetch failed:', err);
        }
      }
    }

    const saved = this.loadSavedPhotosFromStorage(slug);
    const memory = this.photos.get(slug) || [];
    const combinedMap = new Map<string, PhotoModel>();
    memory.forEach((p) => combinedMap.set(p.id, p));
    saved.forEach((p) => combinedMap.set(p.id, p));

    const isDemo =
      slug === DEMO_EVENT.slug || slug === 'demo' || slug === 'demo-panel' || slug === 'samet-ve-sule';
    if (combinedMap.size === 0 && isDemo) {
      DEMO_PHOTOS.forEach((p) => combinedMap.set(p.id, p));
    }

    const all = Array.from(combinedMap.values());
    this.photos.set(slug, all);

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

    // Upload to Firebase Storage with a 25-second timeout
    if (isRealFirebaseConfigured && storage && newPhoto.originalUrl) {
      try {
        const uploadTask = (async () => {
          const response = await fetch(newPhoto.originalUrl);
          const blob = await response.blob();
          const fileRef = ref(storage, `events/${slug}/photos/${photoId}.jpg`);
          await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' });
          return await getDownloadURL(fileRef);
        })();

        const timeout = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Storage upload timed out')), 25000)
        );

        finalUrl = await Promise.race([uploadTask, timeout]);
      } catch (err) {
        console.warn('Firebase Storage upload notice (using fallback):', err);
        // If Storage failed and URI is a temporary blob:, convert to persistent base64 Data URL so it is never lost
        if (newPhoto.originalUrl.startsWith('blob:') && typeof window !== 'undefined') {
          try {
            const res = await fetch(newPhoto.originalUrl);
            const blob = await res.blob();
            finalUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (_blobErr) { }
        }
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

    // Save to In-Memory & LocalStorage immediately so it is 100% persistent
    const currentList = this.photos.get(slug) || this.loadSavedPhotosFromStorage(slug);
    const updatedList = [createdPhoto, ...currentList.filter((p) => p.id !== photoId)];
    this.photos.set(slug, updatedList);
    this.savePhotosToStorage(slug, updatedList);

    const event = this.events.get(slug);
    if (event) {
      event.storage.photoCount = updatedList.length;
      event.storage.usedBytes += newPhoto.sizeBytes || 650000;
      this.events.set(slug, { ...event });
    }

    this.notifyPhotoSubscribers(slug, updatedList);

    // Save to Firestore with sanitized payload
    if (isRealFirebaseConfigured && db) {
      try {
        const photoDocRef = doc(db, 'events', slug, 'photos', photoId);
        const firestorePhoto = sanitizeForFirestore(createdPhoto);
        await setDoc(photoDocRef, firestorePhoto);

        // Update quota and count with setDoc merge
        const eventDocRef = doc(db, 'events', slug);
        const ev = await this.getEvent(slug);
        const updatedPhotoCount = updatedList.length;
        const updatedUsedBytes = (ev.storage?.usedBytes || 0) + (newPhoto.sizeBytes || 650000);
        await setDoc(
          eventDocRef,
          sanitizeForFirestore({
            storage: {
              ...(ev.storage || {}),
              photoCount: updatedPhotoCount,
              usedBytes: updatedUsedBytes,
            },
          }),
          { merge: true }
        );
      } catch (err) {
        console.error('Firestore photo save error:', err);
      }
    }

    return createdPhoto;
  }

  async likePhoto(slug: string, photoId: string): Promise<number> {
    return this.toggleLikePhoto(slug, photoId, true);
  }

  async toggleLikePhoto(slug: string, photoId: string, shouldLike: boolean): Promise<number> {
    const list = this.photos.get(slug) || this.loadSavedPhotosFromStorage(slug);
    const target = list.find((p) => p.id === photoId);
    let newLikes = 0;
    if (target) {
      if (shouldLike) {
        target.likes = (target.likes || 0) + 1;
      } else {
        target.likes = Math.max(0, (target.likes || 0) - 1);
      }
      newLikes = target.likes;
      this.savePhotosToStorage(slug, list);
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
    const list = this.photos.get(slug) || this.loadSavedPhotosFromStorage(slug);
    const filtered = list.filter((p) => p.id !== photoId);
    this.photos.set(slug, filtered);
    this.savePhotosToStorage(slug, filtered);
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

    let unsubscribeFirestore = () => { };

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
              if (data.isApproved !== false && !(data as any).isDeleted) {
                list.push(data);
              }
            });
            if (list.length > 0) {
              this.photos.set(slug, list);
              this.savePhotosToStorage(slug, list);
              callback(list);
            } else {
              const local = this.photos.get(slug) || this.loadSavedPhotosFromStorage(slug);
              if (local.length > 0) {
                callback(local);
              } else {
                this.photos.set(slug, []);
                callback([]);
              }
            }
          },
          (error: any) => {
            if (
              error?.code === 'permission-denied' ||
              error?.message?.includes('Missing or insufficient permissions')
            ) {
              console.info(
                'ℹ️ [Firestore Listener]: Firestore okuma izinleri kapalı olduğundan yerel veriler dinleniyor.'
              );
            } else {
              console.warn('Firestore photo listener error:', error);
            }
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
