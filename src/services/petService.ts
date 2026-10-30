import {
  collection as fsCollection,
  doc as fsDoc,
  getDoc as fsGetDoc,
  getDocs as fsGetDocs,
  query as fsQuery,
  where as fsWhere,
  updateDoc as fsUpdateDoc,
  addDoc as fsAddDoc,
  increment as fsIncrement,
} from 'firebase/firestore';
import { petguruDb } from './petguruFirebase';
import { appStorage } from './storage';
import { PetData, PetLostInfo, PetScanLog, PetSpecies, PetGender, PetVaccine } from '@/types';
import { notificationService } from './notificationService';

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
    source: 'local',
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
    source: 'local',
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
    source: 'local',
    viewCount: 94,
    scanLogs: [],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
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
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Petguru Firestore `pets` koleksiyonu dokümanını QR-la `PetData` modeline dönüştürür.
 */
function mapPetguruDocToPetData(id: string, raw: any): PetData {
  const isQrTag = Boolean(raw.isQrTag);
  const qrStatus = raw.qrStatus || 'claimed';
  const isClaimed = isQrTag ? qrStatus === 'claimed' : true;
  const claimUrl = `https://petguru.app/evcil-hayvanlarim/${id}/claim`;

  // Yaş formatı
  let ageStr = '-';
  if (raw.age) {
    ageStr = `${raw.age} ${raw.ageUnit || 'Yaşında'}`;
  } else if (raw.petAge) {
    ageStr = `${raw.petAge} Yaşında`;
  }

  // Fotoğraf
  let photo = '';
  if (Array.isArray(raw.imageUrls) && raw.imageUrls.length > 0) {
    photo = raw.imageUrls[0];
  } else if (raw.photoURL) {
    photo = raw.photoURL;
  } else if (raw.imageUrl) {
    photo = raw.imageUrl;
  }

  // Sahip Bilgisi
  const ownerName =
    raw.ownerName ||
    raw.emergencyContact?.name ||
    raw.user?.name ||
    raw.userName ||
    'Petguru Kullanıcısı';

  const ownerPhone =
    raw.emergencyContact?.phone ||
    raw.ownerPhone ||
    raw.contactPhone ||
    raw.user?.phoneNumber ||
    '';

  const ownerWhatsapp =
    raw.ownerWhatsapp ||
    (ownerPhone ? ownerPhone.replace(/\D/g, '') : '');

  const ownerAddress =
    raw.location ||
    raw.lastSeenLocation ||
    (raw.user?.city ? `${raw.user.district ? raw.user.district + ', ' : ''}${raw.user.city}` : '');

  // Alerjiler
  let allergiesList: string[] = [];
  if (Array.isArray(raw.allergies)) {
    allergiesList = raw.allergies;
  } else if (typeof raw.allergies === 'string' && raw.allergies) {
    allergiesList = [raw.allergies];
  }

  // Aşı Karnesi
  const vaccinesList: PetVaccine[] = [];
  if (Array.isArray(raw.healthRecords)) {
    raw.healthRecords.forEach((hr: any, idx: number) => {
      const dStr = hr.date
        ? typeof hr.date === 'string'
          ? hr.date
          : new Date(hr.date.seconds ? hr.date.seconds * 1000 : hr.date).toLocaleDateString('tr-TR')
        : '';
      const vStr = hr.nextVisitDate
        ? typeof hr.nextVisitDate === 'string'
          ? hr.nextVisitDate
          : new Date(hr.nextVisitDate.seconds ? hr.nextVisitDate.seconds * 1000 : hr.nextVisitDate).toLocaleDateString('tr-TR')
        : '';

      vaccinesList.push({
        id: hr.id || `vac-${idx}`,
        name: hr.title || hr.type || 'Aşı',
        date: dStr,
        validUntil: vStr,
        isUpToDate: true,
      });
    });
  } else if (raw.nextVaccine) {
    vaccinesList.push({
      id: 'vac-next',
      name: raw.nextVaccine,
      date: 'Kayıtlı',
      validUntil: raw.nextVaccineDate
        ? new Date(raw.nextVaccineDate.seconds ? raw.nextVaccineDate.seconds * 1000 : raw.nextVaccineDate).toLocaleDateString('tr-TR')
        : '',
      isUpToDate: true,
    });
  }

  // Kayıp Durumu
  const isLost = Boolean(
    raw.lostInfo?.isLost ||
    raw.isLost ||
    raw.status === 'lost' ||
    (Array.isArray(raw.lostPets) && raw.lostPets.some((lp: any) => lp.status === 'lost'))
  );

  const lostInfo: PetLostInfo = {
    isLost,
    lostDate: raw.lostInfo?.lostDate || raw.lostDate || 'Yakın Zamanda',
    lostLocation: raw.lostInfo?.lostLocation || raw.lastSeenLocation || raw.location || 'Konum Bildirilmedi',
    rewardAmount: raw.lostInfo?.rewardAmount || (raw.reward ? `${raw.reward.toLocaleString('tr-TR')} ₺` : undefined),
    notes: raw.lostInfo?.notes || raw.description || 'Lütfen bulanların iletişime geçmesini rica ederiz.',
    emergencyPhone: raw.lostInfo?.emergencyPhone || ownerPhone,
  };

  // Tarama Geçmişi
  const scanLogs: PetScanLog[] = (raw.qrScans || []).map((s: any) => ({
    id: s.id || `sl-${Math.random()}`,
    timestamp: s.scannedAt
      ? typeof s.scannedAt === 'string'
        ? s.scannedAt
        : new Date(s.scannedAt.seconds ? s.scannedAt.seconds * 1000 : s.scannedAt).toISOString()
      : new Date().toISOString(),
    lat: s.location?.latitude || s.lat,
    lng: s.location?.longitude || s.lng,
    accuracy: s.location?.accuracy || s.accuracy,
    address: s.location?.city
      ? `${s.location.district ? s.location.district + ', ' : ''}${s.location.city}`
      : s.address || '',
    userAgent: s.userAgent,
  }));

  return {
    id,
    slug: raw.slug || id,
    userId: raw.userId || '',
    name: raw.name || raw.petName || 'İsimsiz Can Dostumuz',
    species: (raw.type || raw.petType || 'dog') as PetSpecies,
    breed: raw.breed || raw.petBreed || 'Karma / Melez',
    gender: (raw.gender || raw.petGender || 'male') as PetGender,
    age: ageStr,
    color: raw.color || '',
    photoUrl: photo,
    microchipNumber: raw.microchipId || raw.microchipNumber || '',
    ownerName,
    ownerPhone,
    ownerWhatsapp,
    ownerAddress,
    vetClinicName: raw.vetClinicName || raw.vetName || '',
    vetPhone: raw.vetPhone || '',
    vetAddress: raw.vetAddress || '',
    allergies: allergiesList,
    personality: Array.isArray(raw.personality) ? raw.personality : [],
    specialNotes: raw.notes || raw.description || '',
    lostInfo,
    vaccines: vaccinesList,
    isClaimed,
    claimUrl,
    uniqueTagCode: raw.uniqueTagCode || id,
    viewCount: raw.qrScanCount || raw.viewCount || 0,
    scanLogs,
    source: 'petguru',
    createdAt: raw.createdAt
      ? new Date(raw.createdAt.seconds ? raw.createdAt.seconds * 1000 : raw.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: raw.updatedAt
      ? new Date(raw.updatedAt.seconds ? raw.updatedAt.seconds * 1000 : raw.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

export const petService = {
  /**
   * Slug veya Pet ID ile kaydı DOĞRUDAN Petguru Firestore'undan çeker.
   */
  async getPetBySlug(slug: string): Promise<PetData | null> {
    const clean = cleanPetSlug(slug);
    if (!clean) return null;

    // 1. Petguru Canlı Firestore Sorgusu
    if (petguruDb) {
      try {
        const petDocRef = fsDoc(petguruDb, 'pets', clean);
        const petSnap = await fsGetDoc(petDocRef);

        if (petSnap.exists()) {
          const raw = petSnap.data();

          // Eğer bu kayıt bir QR Tag ise ve linkedPetId varsa, gerçek hayvan profilini getir
          if (raw.isQrTag && raw.linkedPetId) {
            const linkedSnap = await fsGetDoc(fsDoc(petguruDb, 'pets', raw.linkedPetId));
            if (linkedSnap.exists()) {
              return mapPetguruDocToPetData(clean, {
                ...linkedSnap.data(),
                isQrTag: raw.isQrTag,
                qrStatus: raw.qrStatus,
                linkedPetId: raw.linkedPetId,
              });
            }
          }

          return mapPetguruDocToPetData(clean, raw);
        }

        // Slug alanı ile ara (örn: /p/duman)
        const petsCol = fsCollection(petguruDb, 'pets');
        const qSlug = fsQuery(petsCol, fsWhere('slug', '==', clean));
        const slugSnap = await fsGetDocs(qSlug);
        if (!slugSnap.empty) {
          const docData = slugSnap.docs[0].data();
          return mapPetguruDocToPetData(slugSnap.docs[0].id, docData);
        }
      } catch (err) {
        console.warn('Petguru Firestore fetch error, falling back to local demo:', err);
      }
    }

    // 2. Demo / Yerel fallback (Bağlantı yoksa veya örnek kayıtlar için)
    const localMap = getLocalPets();
    if (localMap[clean]) {
      return localMap[clean];
    }

    const foundById = Object.values(localMap).find((p) => p.id === clean);
    return foundById || null;
  },

  /**
   * Kullanıcının sahip olduğu evcil hayvanları Petguru'dan listeler
   */
  async getUserPets(userId: string): Promise<PetData[]> {
    if (petguruDb && userId) {
      try {
        const petsCol = fsCollection(petguruDb, 'pets');
        const q = fsQuery(petsCol, fsWhere('userId', '==', userId));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => mapPetguruDocToPetData(d.id, d.data()));
        }
      } catch (err) {
        console.warn('Petguru getUserPets failed, falling back to local:', err);
      }
    }

    const localMap = getLocalPets();
    return Object.values(localMap).filter((p) => p.userId === userId);
  },

  /**
   * Künye okutulduğunda tarama ve GPS bilgisini DOĞRUDAN Petguru Firestore'una yazar.
   * Bu işlem Petguru Cloud Functions'larını ve push bildirimlerini tetikler.
   */
  async recordScan(
    slug: string,
    location?: { lat: number; lng: number; accuracy?: number; address?: string }
  ): Promise<void> {
    const clean = cleanPetSlug(slug);

    if (petguruDb) {
      try {
        const petDocRef = fsDoc(petguruDb, 'pets', clean);
        const petSnap = await fsGetDoc(petDocRef);
        let targetId = clean;
        let ownerId = '';

        if (petSnap.exists()) {
          const data = petSnap.data();
          if (data.linkedPetId) targetId = data.linkedPetId;
          ownerId = data.userId || '';
        }

        const newScanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const scanObj = {
          id: newScanId,
          scannedAt: new Date(),
          location: location
            ? {
                latitude: location.lat,
                longitude: location.lng,
                accuracy: location.accuracy,
                city: location.address,
              }
            : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'QR-la Collar Gateway',
        };

        // 1. Petguru `pets` dokümanını güncelle
        await fsUpdateDoc(fsDoc(petguruDb, 'pets', targetId), {
          lastQrScan: scanObj,
          qrScanCount: fsIncrement(1),
          updatedAt: new Date(),
        }).catch(() => {});

        // 2. Petguru `qrScans` koleksiyonuna yaz (Petguru Cloud Functions'ı anında tetikler)
        await fsAddDoc(fsCollection(petguruDb, 'qrScans'), {
          petId: targetId,
          petOwnerId: ownerId,
          qrTagId: clean,
          ...scanObj,
          source: 'qr-la-gateway',
          createdAt: new Date(),
        }).catch(() => {});
      } catch (err) {
        console.warn('Petguru recordScan write error:', err);
      }
    }

    // QR-la bildirim merkezine de anlık bildirim düşür
    try {
      notificationService.triggerNotification({
        category: 'pet',
        title: '🐾 Petguru Künye Taraması',
        body: `${slug} etiketli Petguru künyesi okutuldu.${location ? ' Canlı GPS konumu alındı.' : ''}`,
        url: `/p/${slug}`,
      });
    } catch (_e) {}
  },

  /**
   * Bulan kişinin canlı GPS koordinatlarını Petguru'ya kaydeder
   */
  async reportFoundWithGps(
    slug: string,
    lat: number,
    lng: number,
    address?: string
  ): Promise<void> {
    await this.recordScan(slug, { lat, lng, address });
  },

  /**
   * Sahipsiz bir tasmayı (unclaimed tag) claim etme yönlendirmesi
   */
  getClaimUrl(slug: string): string {
    return `https://petguru.app/evcil-hayvanlarim/${cleanPetSlug(slug)}/claim`;
  },

  /**
   * Evcil hayvan ekler veya günceller (yerel/demo önbellek için)
   */
  async savePet(data: Partial<PetData> & { name: string; slug: string }): Promise<PetData> {
    const clean = cleanPetSlug(data.slug);
    const localMap = getLocalPets();
    const existing = localMap[clean] || Object.values(localMap).find((p) => p.id === data.id);

    const now = new Date().toISOString();
    const petToSave: PetData = {
      ...(existing || {}),
      ...data,
      id: existing?.id || data.id || `pet-${Date.now()}`,
      slug: clean,
      userId: data.userId || existing?.userId || 'demo-host-ayse',
      name: data.name,
      species: data.species || 'dog',
      breed: data.breed || 'Melez',
      gender: data.gender || 'male',
      age: data.age || '-',
      photoUrl: data.photoUrl || '',
      ownerName: data.ownerName || 'Evcil Hayvan Sahibi',
      ownerPhone: data.ownerPhone || '',
      isClaimed: true,
      lostInfo: data.lostInfo || existing?.lostInfo || { isLost: false },
      vaccines: data.vaccines || existing?.vaccines || [],
      viewCount: existing?.viewCount || 0,
      scanLogs: existing?.scanLogs || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    localMap[clean] = petToSave;
    saveLocalPets(localMap);
    return petToSave;
  },

  /**
   * Acil Kayıp Alarmı durumunu açar/kapatır
   */
  async toggleLostStatus(
    id: string,
    isLost: boolean,
    lostDetails?: Partial<PetLostInfo>
  ): Promise<PetData | null> {
    const localMap = getLocalPets();
    const existing = Object.values(localMap).find((p) => p.id === id || p.slug === id);
    if (!existing) return null;

    const updated: PetData = {
      ...existing,
      lostInfo: {
        ...existing.lostInfo,
        ...lostDetails,
        isLost,
      },
      updatedAt: new Date().toISOString(),
    };

    localMap[existing.slug] = updated;
    saveLocalPets(localMap);
    return updated;
  },

  /**
   * Evcil hayvanı siler
   */
  async deletePet(id: string): Promise<void> {
    const localMap = getLocalPets();
    const target = Object.values(localMap).find((p) => p.id === id || p.slug === id);
    if (target) {
      delete localMap[target.slug];
      saveLocalPets(localMap);
    }
  },
};
