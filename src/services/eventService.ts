import { EventModel, AlbumModel, PhotoModel, GuestbookEntryModel } from '@/types';
import { DEMO_EVENT, DEMO_ALBUMS, DEMO_PHOTOS, DEMO_GUESTBOOK } from './mockData';

// In-memory / dynamic store initialized with demo data
class EventService {
  private events: Map<string, EventModel> = new Map();
  private albums: Map<string, AlbumModel[]> = new Map();
  private photos: Map<string, PhotoModel[]> = new Map();
  private guestbooks: Map<string, GuestbookEntryModel[]> = new Map();
  private photoSubscribers: Map<string, ((photos: PhotoModel[]) => void)[]> = new Map();

  constructor() {
    this.events.set(DEMO_EVENT.slug, { ...DEMO_EVENT });
    this.albums.set(DEMO_EVENT.slug, [...DEMO_ALBUMS]);
    this.photos.set(DEMO_EVENT.slug, [...DEMO_PHOTOS]);
    this.guestbooks.set(DEMO_EVENT.slug, [...DEMO_GUESTBOOK]);
  }

  async getEvent(slug: string): Promise<EventModel | null> {
    const event = this.events.get(slug);
    if (event) return { ...event };
    // If slug is not found, return demo event as fallback so testing any custom slug works
    return {
      ...DEMO_EVENT,
      slug,
      title: `${slug.replace(/-/g, ' ').toUpperCase()} ETKİNLİĞİ`,
    };
  }

  async verifyPin(slug: string, pin: string): Promise<boolean> {
    const event = await this.getEvent(slug);
    if (!event || !event.settings.isPrivate) return true;
    return event.settings.pinCode === pin;
  }

  async getAlbums(slug: string): Promise<AlbumModel[]> {
    return this.albums.get(slug) || [...DEMO_ALBUMS];
  }

  async getPhotos(slug: string, albumId?: string): Promise<PhotoModel[]> {
    const all = this.photos.get(slug) || [];
    if (!albumId || albumId === 'alb-all' || albumId === 'all') {
      return [...all];
    }
    return all.filter((p) => p.albumId === albumId);
  }

  async addPhoto(slug: string, newPhoto: Omit<PhotoModel, 'id' | 'createdAt' | 'likes' | 'isApproved'>): Promise<PhotoModel> {
    const createdPhoto: PhotoModel = {
      ...newPhoto,
      id: `ph-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      isApproved: true,
    };

    const currentList = this.photos.get(slug) || [];
    const updatedList = [createdPhoto, ...currentList];
    this.photos.set(slug, updatedList);

    // Update event storage and photo count
    const event = this.events.get(slug);
    if (event) {
      event.storage.photoCount += 1;
      event.storage.usedBytes += newPhoto.sizeBytes || 650000;
      this.events.set(slug, { ...event });
    }

    // Update album count
    const albums = this.albums.get(slug);
    if (albums) {
      const allAlb = albums.find((a) => a.slug === 'all');
      if (allAlb) allAlb.photoCount += 1;
      if (newPhoto.albumId) {
        const targetAlb = albums.find((a) => a.id === newPhoto.albumId);
        if (targetAlb) targetAlb.photoCount += 1;
      }
    }

    // Notify subscribers (like Live Projector screen)
    this.notifyPhotoSubscribers(slug, updatedList);
    return createdPhoto;
  }

  async likePhoto(slug: string, photoId: string): Promise<number> {
    const list = this.photos.get(slug) || [];
    const target = list.find((p) => p.id === photoId);
    if (target) {
      target.likes += 1;
      this.notifyPhotoSubscribers(slug, [...list]);
      return target.likes;
    }
    return 0;
  }

  async deletePhoto(slug: string, photoId: string): Promise<boolean> {
    const list = this.photos.get(slug) || [];
    const filtered = list.filter((p) => p.id !== photoId);
    this.photos.set(slug, filtered);
    this.notifyPhotoSubscribers(slug, filtered);
    return true;
  }

  async getGuestbook(slug: string): Promise<GuestbookEntryModel[]> {
    return this.guestbooks.get(slug) || [];
  }

  async addGuestbookEntry(slug: string, entry: Omit<GuestbookEntryModel, 'id' | 'createdAt' | 'likes'>): Promise<GuestbookEntryModel> {
    const created: GuestbookEntryModel = {
      ...entry,
      id: `gb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    const current = this.guestbooks.get(slug) || [];
    const updated = [created, ...current];
    this.guestbooks.set(slug, updated);
    return created;
  }

  subscribePhotos(slug: string, callback: (photos: PhotoModel[]) => void): () => void {
    const subscribers = this.photoSubscribers.get(slug) || [];
    subscribers.push(callback);
    this.photoSubscribers.set(slug, subscribers);

    // Initial trigger
    callback(this.photos.get(slug) || []);

    return () => {
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
}

export const eventService = new EventService();
