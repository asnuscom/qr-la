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
import { PetData, PetLostInfo, PetScanLog } from '@/types';

const STORAGE_KEY_PETS = 'qr_la_pets_data';

export const DEMO_PETS: Record<string, PetData> = {
  duman: {
    id: 'pet-demo-duman',
    slug: 'duman',
    userId: 'demo-host-ayse',
    name: 'Duman',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    age: '2.5 Yaşında',
    color: 'Bal Köpüğü / Altın Sarısı',
    photoUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    microchipNumber: '990000018492019',
    ownerName: 'Ayşe Yılmaz',
    ownerPhone: '05321234567',
    ownerWhatsapp: '905321234567',
    ownerAddress: 'Moda, Kadıköy / İstanbul',
    vetClinicName: 'Kadıköy Pati Veteriner Polikliniği',
    vetPhone: '02163456789',
    vetAddress: 'Caferağa Mah. Moda Cad. No:42 Kadıköy',
    allergies: ['Tavuk Proteini Alerjisi', 'Yabani Arı Sokmasına Duyarlı'],
    personality: ['İnsan Canlısı', 'Oyunbaz', 'Çocukları Çok Sever', 'Suda Yüzmeye Bayılır'],
    specialNotes:
      'Günde 2 kez eklem güçlendirici ödül maması alır. Çok sevecendir, yanına yaklaştığınızda heyecanlanır.',
    lostInfo: {
      isLost: false,
    },
    vaccines: [
      { id: 'v1', name: 'Karma Aşı (DHPP)', date: '15.01.2026', validUntil: '15.01.2027', isUpToDate: true },
      { id: 'v2', name: 'Kuduz Aşısı (Rabies)', date: '10.02.2026', validUntil: '10.02.2027', isUpToDate: true },
      { id: 'v3', name: 'Bronchine (Kennel Cough)', date: '01.03.2026', validUntil: '01.03.2027', isUpToDate: true },
      { id: 'v4', name: 'İç & Dış Parazit Kürü', date: '20.03.2026', validUntil: '20.05.2026', isUpToDate: true },
    ],
    isClaimed: true,
    uniqueTagCode: 'PET-KADIKOY-01',
    viewCount: 184,
    scanLogs: [
      {
        id: 'sl1',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        lat: 40.9833,
        lng: 29.0285,
        address: 'Moda Sahil Parkı, Kadıköy',
      },
    ],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  pamuk: {
    id: 'pet-demo-pamuk',
    slug: 'pamuk',
    userId: 'demo-host-mert',
    name: 'Pamuk',
    species: 'cat',
    breed: 'British Shorthair',
    gender: 'female',
    age: '1.5 Yaşında',
    color: 'Duman Grisi & Zümrüt Gözlü',
    photoUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    microchipNumber: '990000029384751',
    ownerName: 'Mert Erdem',
    ownerPhone: '05429876543',
    ownerWhatsapp: '905429876543',
    ownerAddress: 'Akaretler, Beşiktaş / İstanbul',
    vetClinicName: 'Beşiktaş Şifa Veteriner Kliniği',
    vetPhone: '02122345678',
    vetAddress: 'Vişnezade Mah. Süleyman Seba Cad. No:18 Beşiktaş',
    allergies: ['Tahılsız Mama Yer', 'Süt Ürünlerine İntolerans'],
    personality: ['Ürkek', 'Gürültüden Korkar', 'Yumuşak Sesle Konuşulmalı'],
    specialNotes:
      'Dışarıya alışık değildir, ürktüğü için araç altlarına saklanmış olabilir. Lütfen ani hareket yapmayın, mamayı hafifçe uzatın.',
    lostInfo: {
      isLost: true, // 🚨 LOST ALERT ACTIVE!
      lostDate: 'Dün Akşam (21:30 suları)',
      lostLocation: 'Beşiktaş Barbaros Bulvarı / Abbasağa Parkı Civarı',
      rewardAmount: '7.500 ₺ Ödül',
      notes: 'Gören veya bulanların derhal aramasını veya WhatsApp üzerinden konum atmasını rica ediyoruz.',
      emergencyPhone: '05429876543',
    },
    vaccines: [
      { id: 'pv1', name: 'Karma Aşı (FVRCP)', date: '12.11.2025', validUntil: '12.11.2026', isUpToDate: true },
      { id: 'pv2', name: 'Kuduz Aşısı', date: '05.12.2025', validUntil: '05.12.2026', isUpToDate: true },
      { id: 'pv3', name: 'Lösemi Aşısı (FeLV)', date: '15.01.2026', validUntil: '15.01.2027', isUpToDate: true },
      { id: 'pv4', name: 'İç / Dış Parazit', date: '28.02.2026', validUntil: '28.04.2026', isUpToDate: true },
    ],
    isClaimed: true,
    uniqueTagCode: 'PET-BESIKTAS-02',
    viewCount: 429,
    scanLogs: [
      {
        id: 'sl2',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        lat: 41.0428,
        lng: 29.0067,
        address: 'Abbasağa Parkı Yakınları, Beşiktaş',
      },
    ],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  k9x2: {
    id: 'pet-demo-ares',
    slug: 'k9x2',
    userId: 'demo-host-burak',
    name: 'Ares',
    species: 'dog',
    breed: 'Alman Çoban Köpeği',
    gender: 'male',
    age: '3 Yaşında',
    color: 'Siyah / Samur',
    photoUrl:
      'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    microchipNumber: '990000078129034',
    ownerName: 'Burak Çelik',
    ownerPhone: '05335554433',
    ownerWhatsapp: '905335554433',
    ownerAddress: 'Çankaya / Ankara',
    vetClinicName: 'Ankara Başkent Veteriner Tıp Merkezi',
    vetPhone: '03124445566',
    vetAddress: 'Turan Güneş Bulvarı No:88 Çankaya',
    allergies: ['Mantar / Nem Duyarlılığı'],
    personality: ['Koruyucu', 'Eğitimli', 'Akıllı', 'Görev Odaklı'],
    specialNotes: 'Temel ve ileri itaat eğitimi tamdır. Komutları dinler.',
    lostInfo: {
      isLost: false,
    },
    vaccines: [
      { id: 'av1', name: 'Karma Aşı (DHPP)', date: '10.01.2026', validUntil: '10.01.2027', isUpToDate: true },
      { id: 'av2', name: 'Kuduz Aşısı', date: '10.01.2026', validUntil: '10.01.2027', isUpToDate: true },
    ],
    isClaimed: true,
    uniqueTagCode: 'PET-K9X2',
    viewCount: 94,
    scanLogs: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'yeni-tasma': {
    id: 'pet-demo-unclaimed',
    slug: 'yeni-tasma',
    userId: '',
    name: 'Henüz Eşleştirilmemiş Künye',
    species: 'other',
    breed: 'Lazer Kazımalı Paslanmaz Çelik Künye',
    gender: 'male',
    age: '-',
    photoUrl: '',
    ownerName: '',
    ownerPhone: '',
    lostInfo: { isLost: false },
    vaccines: [],
    isClaimed: false,
    uniqueTagCode: 'PET-LASER-99X',
    viewCount: 5,
    scanLogs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function getLocalPets(): Record<string, PetData> {
  try {
    const raw = appStorage.getItem(STORAGE_KEY_PETS);
    if (!raw) return { ...DEMO_PETS };
    return { ...DEMO_PETS, ...JSON.parse(raw) };
  } catch (_e) {
    return { ...DEMO_PETS };
  }
}

function saveLocalPets(pets: Record<string, PetData>): void {
  try {
    appStorage.setItem(STORAGE_KEY_PETS, JSON.stringify(pets));
  } catch (_e) {}
}

export function cleanPetSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '');
}

export const petService = {
  /**
   * Slug / ID ile evcil hayvan kaydını bulur
   */
  async getPetBySlug(slug: string): Promise<PetData | null> {
    const clean = cleanPetSlug(slug);
    if (!clean) return null;

    if (isRealFirebaseConfigured && db) {
      try {
        const petsCol = fsCollection(db, 'pets');
        const q = fsQuery(petsCol, fsWhere('slug', '==', clean));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as PetData;
          return { ...docData, id: snap.docs[0].id };
        }
      } catch (err) {
        console.warn('Firebase pet get failed, falling back to local:', err);
      }
    }

    const localMap = getLocalPets();
    if (localMap[clean]) {
      return localMap[clean];
    }

    // Direct ID search fallback
    const foundById = Object.values(localMap).find(p => p.id === clean);
    return foundById || null;
  },

  /**
   * Kullanıcının sahip olduğu tüm evcil hayvanları getirir
   */
  async getUserPets(userId: string): Promise<PetData[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const petsCol = fsCollection(db, 'pets');
        const q = fsQuery(petsCol, fsWhere('userId', '==', userId));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...(d.data() as PetData), id: d.id }));
        }
      } catch (err) {
        console.warn('Firebase getUserPets failed, falling back to local:', err);
      }
    }

    const localMap = getLocalPets();
    const all = Object.values(localMap);
    return all.filter(p => p.userId === userId);
  },

  /**
   * Evcil hayvan ekler veya günceller
   */
  async savePet(data: Partial<PetData> & { name: string; ownerPhone: string }): Promise<PetData> {
    const rawSlug = data.slug || data.name;
    const slug = cleanPetSlug(rawSlug) || `pet-${Date.now().toString(36)}`;
    const id = data.id || `pet-${Date.now()}`;
    const now = new Date().toISOString();

    const fullRecord: PetData = {
      id,
      slug,
      userId: data.userId || 'demo-host-ayse',
      name: data.name,
      species: data.species || 'dog',
      breed: data.breed || 'Melez',
      gender: data.gender || 'male',
      age: data.age || '1 Yaşında',
      color: data.color || '',
      photoUrl:
        data.photoUrl ||
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      microchipNumber: data.microchipNumber || '',
      ownerName: data.ownerName || 'Evcil Hayvan Sahibi',
      ownerPhone: data.ownerPhone,
      ownerWhatsapp: data.ownerWhatsapp || data.ownerPhone.replace(/\D/g, ''),
      ownerAddress: data.ownerAddress || '',
      vetClinicName: data.vetClinicName || '',
      vetPhone: data.vetPhone || '',
      vetAddress: data.vetAddress || '',
      allergies: data.allergies || [],
      personality: data.personality || [],
      specialNotes: data.specialNotes || '',
      lostInfo: data.lostInfo || { isLost: false },
      vaccines: data.vaccines || [],
      isClaimed: data.isClaimed !== undefined ? data.isClaimed : true,
      uniqueTagCode: data.uniqueTagCode || `PET-${slug.toUpperCase()}`,
      viewCount: data.viewCount || 0,
      scanLogs: data.scanLogs || [],
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const petDocRef = fsDoc(db, 'pets', id);
        await fsSetDoc(petDocRef, fullRecord, { merge: true });
      } catch (err) {
        console.warn('Firebase pet save failed, saving to local:', err);
      }
    }

    const localMap = getLocalPets();
    localMap[slug] = fullRecord;
    saveLocalPets(localMap);

    return fullRecord;
  },

  /**
   * 🚨 Kayıp Alarmı durumunu açar veya kapatır
   */
  async toggleLostStatus(
    id: string,
    isLost: boolean,
    lostDetails?: Partial<PetLostInfo>
  ): Promise<PetData | null> {
    const localMap = getLocalPets();
    const existing = Object.values(localMap).find(p => p.id === id || p.slug === id);
    if (!existing) return null;

    const updatedLostInfo: PetLostInfo = {
      isLost,
      lostDate: isLost ? lostDetails?.lostDate || new Date().toLocaleDateString('tr-TR') : undefined,
      lostLocation: isLost ? lostDetails?.lostLocation || existing.ownerAddress || '' : undefined,
      rewardAmount: isLost ? lostDetails?.rewardAmount || '' : undefined,
      notes: isLost ? lostDetails?.notes || '' : undefined,
      emergencyPhone: isLost ? lostDetails?.emergencyPhone || existing.ownerPhone : undefined,
    };

    const updated: PetData = {
      ...existing,
      lostInfo: updatedLostInfo,
      updatedAt: new Date().toISOString(),
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const petDocRef = fsDoc(db, 'pets', existing.id);
        await fsUpdateDoc(petDocRef, {
          lostInfo: updatedLostInfo,
          updatedAt: updated.updatedAt,
        });
      } catch (err) {
        console.warn('Firebase toggleLostStatus failed:', err);
      }
    }

    localMap[existing.slug] = updated;
    saveLocalPets(localMap);
    return updated;
  },

  /**
   * Künye tarandığında görüntüleme sayısını artırır ve isteğe bağlı GPS konumunu kaydeder
   */
  async recordScan(
    slug: string,
    location?: { lat: number; lng: number; accuracy?: number; address?: string }
  ): Promise<void> {
    const clean = cleanPetSlug(slug);
    const localMap = getLocalPets();
    const pet = localMap[clean] || Object.values(localMap).find(p => p.id === clean);

    const now = new Date().toISOString();
    const newLog: PetScanLog | null = location
      ? {
          id: `scan-${Date.now()}`,
          timestamp: now,
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          address: location.address,
        }
      : null;

    if (pet) {
      pet.viewCount = (pet.viewCount || 0) + 1;
      if (newLog) {
        pet.scanLogs = [newLog, ...(pet.scanLogs || [])].slice(0, 50);
      }
      localMap[pet.slug] = pet;
      saveLocalPets(localMap);
    }

    if (isRealFirebaseConfigured && db && pet) {
      try {
        const petDocRef = fsDoc(db, 'pets', pet.id);
        await fsUpdateDoc(petDocRef, {
          viewCount: fsIncrement(1),
          ...(newLog ? { scanLogs: [newLog, ...(pet.scanLogs || [])].slice(0, 50) } : {}),
        });
      } catch (err) {
        console.warn('Firebase recordScan update failed:', err);
      }
    }
  },

  /**
   * Sahipsiz bir tasmayı (unclaimed tag) kullanıcıya bağlar
   */
  async claimTag(slug: string, ownerData: { name: string; phone: string; petName: string }): Promise<PetData | null> {
    const clean = cleanPetSlug(slug);
    const localMap = getLocalPets();
    const pet = localMap[clean];
    if (!pet) return null;

    const updated: PetData = {
      ...pet,
      isClaimed: true,
      name: ownerData.petName,
      ownerName: ownerData.name,
      ownerPhone: ownerData.phone,
      ownerWhatsapp: ownerData.phone.replace(/\D/g, ''),
      updatedAt: new Date().toISOString(),
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const petDocRef = fsDoc(db, 'pets', pet.id);
        await fsUpdateDoc(petDocRef, {
          isClaimed: true,
          name: updated.name,
          ownerName: updated.ownerName,
          ownerPhone: updated.ownerPhone,
          ownerWhatsapp: updated.ownerWhatsapp,
          updatedAt: updated.updatedAt,
        });
      } catch {}
    }

    localMap[clean] = updated;
    saveLocalPets(localMap);
    return updated;
  },

  /**
   * Evcil hayvan siler
   */
  async deletePet(id: string): Promise<void> {
    const localMap = getLocalPets();
    const target = Object.values(localMap).find(p => p.id === id || p.slug === id);
    if (target) {
      delete localMap[target.slug];
      saveLocalPets(localMap);
    }

    if (isRealFirebaseConfigured && db && target) {
      try {
        await fsDeleteDoc(fsDoc(db, 'pets', target.id));
      } catch (err) {
        console.warn('Firebase deletePet failed:', err);
      }
    }
  },
};
