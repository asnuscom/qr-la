import {
  collection as fsCollection,
  doc as fsDoc,
  getDocs as fsGetDocs,
  query as fsQuery,
  setDoc as fsSetDoc,
  where as fsWhere,
  deleteDoc as fsDeleteDoc,
  updateDoc as fsUpdateDoc,
  increment as fsIncrement,
} from 'firebase/firestore';
import { db, isRealFirebaseConfigured } from './firebase';
import { appStorage } from './storage';
import { VehicleData } from '@/types';
import { DEFAULT_PRESET_MESSAGES } from '@/modules/vehicle/themes';

const STORAGE_KEY_VEHICLES = 'qr_la_vehicles_data';

export function cleanPlate(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .toLowerCase();
}

export function formatPlate(input: string): string {
  if (!input) return '';
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Match standard Turkish plate format e.g. 34ABC123 -> 34 ABC 123
  const match = clean.match(/^(\d{2})([A-Z]{1,3})(\d{2,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return clean;
}

export const DEMO_VEHICLES: Record<string, VehicleData> = {
  '34abc123': {
    id: 'veh-demo-cbr650r',
    slug: '34abc123',
    userId: 'demo-sample-vehicle',
    plateNumber: '34 ABC 123',
    ownerName: 'Samet Sunman',
    ownerPhone: '05415779166',
    ownerEmail: 'samet@qr-la.com',
    instagram: 'sametsunman',
    bloodType: 'A Rh+',
    emergencyContact: {
      name: 'Şule Sunman',
      phone: '+905551234567',
      relationship: 'Eşi',
    },
    vehicleType: 'motorcycle',
    brand: 'honda',
    model: 'CBR 650R E-Clutch',
    theme: 'honda',
    privacyMode: true,
    presetMessages: DEFAULT_PRESET_MESSAGES,
    note: 'Geçici olarak kısa süreliğine park halindeyim. Çıkışınız kapandıysa lütfen WhatsApp butonuna dokunarak haber verin.',
    isClaimed: true,
    viewCount: 142,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  '06ank06': {
    id: 'veh-demo-bmw320i',
    slug: '06ank06',
    userId: 'demo-sample-vehicle-2',
    plateNumber: '06 ANK 06',
    ownerName: 'Yavuz Selim',
    ownerPhone: '05321234567',
    bloodType: '0 Rh+',
    emergencyContact: {
      name: 'Ahmet Selim',
      phone: '+905329876543',
      relationship: 'Kardeşi',
    },
    vehicleType: 'car',
    brand: 'bmw',
    model: '320i M Sport',
    theme: 'bmw',
    privacyMode: true,
    presetMessages: DEFAULT_PRESET_MESSAGES,
    note: 'Market/banka işlemi için 5 dakikalığına durdum. Gerekirse lütfen hemen arayın.',
    isClaimed: true,
    viewCount: 89,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function getLocalVehicles(): Record<string, VehicleData> {
  try {
    const raw = appStorage.getItem(STORAGE_KEY_VEHICLES);
    if (!raw) return { ...DEMO_VEHICLES };
    return { ...DEMO_VEHICLES, ...JSON.parse(raw) };
  } catch (_e) {
    return { ...DEMO_VEHICLES };
  }
}

function saveLocalVehicles(map: Record<string, VehicleData>): void {
  try {
    appStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(map));
  } catch (_e) {}
}

export const vehicleService = {
  cleanPlate,
  formatPlate,

  async getVehicleBySlug(rawSlug: string): Promise<VehicleData | null> {
    const slug = cleanPlate(rawSlug);
    if (!slug) return null;

    // 1. Try Firestore if configured
    if (isRealFirebaseConfigured && db) {
      try {
        const q = fsQuery(fsCollection(db, 'vehicles'), fsWhere('slug', '==', slug));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as VehicleData;
          return { ...docData, id: snap.docs[0].id };
        }
      } catch (err) {
        console.warn('Firestore getVehicleBySlug failed, trying local fallback:', err);
      }
    }

    // 2. Local fallback
    const local = getLocalVehicles();
    return local[slug] || null;
  },

  async getUserVehicles(userId: string): Promise<VehicleData[]> {
    if (!userId) return [];

    // 1. Try Firestore
    if (isRealFirebaseConfigured && db) {
      try {
        const q = fsQuery(fsCollection(db, 'vehicles'), fsWhere('userId', '==', userId));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => ({ ...(d.data() as VehicleData), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore getUserVehicles failed, trying local:', err);
      }
    }

    // 2. Local fallback
    const local = getLocalVehicles();
    return Object.values(local).filter((v) => v.userId === userId);
  },

  async saveVehicle(
    input: Partial<VehicleData> & { plateNumber: string; ownerName: string; ownerPhone: string; userId: string }
  ): Promise<VehicleData> {
    const slug = cleanPlate(input.plateNumber);
    if (!slug) throw new Error('Geçerli bir araç plakası girilmelidir.');

    const now = new Date().toISOString();
    const existing = await this.getVehicleBySlug(slug);

    const vehicleData: VehicleData = {
      id: existing?.id || input.id || `veh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug,
      userId: input.userId,
      plateNumber: formatPlate(input.plateNumber),
      ownerName: input.ownerName.trim(),
      ownerPhone: input.ownerPhone.trim(),
      ownerEmail: input.ownerEmail?.trim() || '',
      instagram: input.instagram?.replace(/^@/, '').trim() || '',
      bloodType: input.bloodType || 'Bilinmiyor',
      emergencyContact: input.emergencyContact || undefined,
      vehicleType: input.vehicleType || 'motorcycle',
      brand: input.brand || 'honda',
      model: input.model?.trim() || '',
      theme: input.theme || input.brand || 'honda',
      privacyMode: input.privacyMode !== undefined ? input.privacyMode : true,
      presetMessages: input.presetMessages && input.presetMessages.length > 0 ? input.presetMessages : DEFAULT_PRESET_MESSAGES,
      note: input.note?.trim() || '',
      isClaimed: true,
      viewCount: existing?.viewCount || 0,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    // Save to Firestore if available
    if (isRealFirebaseConfigured && db) {
      try {
        await fsSetDoc(fsDoc(db, 'vehicles', vehicleData.id), vehicleData, { merge: true });
      } catch (err) {
        console.warn('Firestore saveVehicle failed, saving local:', err);
      }
    }

    // Always update local cache
    const local = getLocalVehicles();
    local[slug] = vehicleData;
    saveLocalVehicles(local);

    return vehicleData;
  },

  async deleteVehicle(id: string, slug: string): Promise<void> {
    if (isRealFirebaseConfigured && db) {
      try {
        await fsDeleteDoc(fsDoc(db, 'vehicles', id));
      } catch (err) {
        console.warn('Firestore deleteVehicle failed:', err);
      }
    }

    const local = getLocalVehicles();
    delete local[cleanPlate(slug)];
    saveLocalVehicles(local);
  },

  async incrementVehicleScans(slug: string): Promise<void> {
    const clean = cleanPlate(slug);
    if (isRealFirebaseConfigured && db) {
      try {
        const q = fsQuery(fsCollection(db, 'vehicles'), fsWhere('slug', '==', clean));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          await fsUpdateDoc(docRef, { viewCount: fsIncrement(1) });
        }
      } catch (_e) {}
    }

    const local = getLocalVehicles();
    if (local[clean]) {
      local[clean].viewCount = (local[clean].viewCount || 0) + 1;
      saveLocalVehicles(local);
    }
  },
};
