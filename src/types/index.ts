export type EventType = 'dugun' | 'nisan' | 'kina' | 'dogumgunu' | 'sunnet' | 'parti' | 'diger';

export type StorageTier = 'free' | 'standart' | 'premium' | 'vip';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface VenueInfo {
  name: string;
  address: string;
  mapUrl: string;
  lat?: number;
  lng?: number;
}

export interface EventTheme {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  textColor?: string;
  fontFamily?: string;
}

export interface EventSettings {
  isPrivate: boolean;
  pinCode?: string;
  enableCompression: boolean;
  allowGuestDownloads: boolean;
  isLiveFeedActive: boolean;
  allowGuestbook: boolean;
  autoApprovePhotos: boolean;
}

export interface StorageInfo {
  quotaBytes: number;
  usedBytes: number;
  photoCount: number;
  tier: StorageTier;
  expiresAt: string;
}

export interface EventModel {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  hosts: {
    brideOrPrimary?: string;
    groomOrSecondary?: string;
  };
  eventType: EventType;
  eventDate: string; // ISO format
  coverPhotoUrl: string;
  invitationUrl?: string;
  theme: EventTheme;
  venue: VenueInfo;
  schedule: ScheduleItem[];
  settings: EventSettings;
  storage: StorageInfo;
  createdAt: string;
}

export interface AlbumModel {
  id: string;
  slug: string;
  name: string;
  order: number;
  photoCount: number;
  coverPhotoUrl?: string;
}

export interface PhotoModel {
  id: string;
  eventSlug: string;
  albumId?: string;
  originalUrl: string;
  thumbnailUrl: string;
  uploaderName?: string;
  tableNumber?: string;
  guestNote?: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  isApproved: boolean;
  likes: number;
  createdAt: string;
}

export interface GuestbookEntryModel {
  id: string;
  eventSlug: string;
  authorName: string;
  tableNumber?: string;
  relationship?: string; // 'Gelin Arkadaşı', 'Kuzen', vb.
  message: string;
  attachedPhotoUrl?: string;
  likes?: number;
  createdAt: string;
}

export interface PlanTierConfig {
  tier: StorageTier;
  name: string;
  priceTL: number;
  quotaMB: number;
  retentionDays: number;
  features: string[];
  isPopular?: boolean;
}
