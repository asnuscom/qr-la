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
import { VCardData } from '@/types';

const STORAGE_KEY_VCARDS = 'qr_la_vcards_data';

export const DEMO_VCARDS: Record<string, VCardData> = {
  'samet-sunman': {
    id: 'vcard-demo-samet',
    slug: 'samet-sunman',
    userId: 'demo-host-yavuz',
    fullName: 'Samet Sunman',
    jobTitle: 'Kurucu & Kıdemli Yazılım Mimarı',
    company: 'Asnus Bilişim & QR-la',
    department: 'Yazılım & Ürün Geliştirme',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    bio: 'Mobil ve bulut tabanlı modern yazılım ekosistemleri geliştiriyorum. Fiziksel dünyadaki nesneleri dinamik QR ve NFC teknolojileriyle dijitale bağlıyoruz.',
    phone: '+90 541 577 91 66',
    phoneSecondary: '+90 216 555 44 33',
    whatsapp: '905415779166',
    email: 'samet@asnus.com',
    emailSecondary: 'info@qr-la.com',
    website: 'https://asnus.com',
    location: 'Ataşehir, İstanbul / Türkiye',
    mapUrl: 'https://maps.google.com/?q=Ataşehir,İstanbul',
    theme: 'executive_dark',
    socials: {
      linkedin: 'https://linkedin.com/in/sametsunman',
      github: 'https://github.com/sametsunman',
      instagram: 'https://instagram.com/sametsunman',
      twitter: 'https://x.com/sametsunman',
    },
    bankAccounts: [
      {
        bankName: 'Garanti BBVA',
        iban: 'TR12 0006 2000 0001 2345 6789 01',
        accountHolder: 'Samet Sunman',
      },
      {
        bankName: 'İş Bankası',
        iban: 'TR88 0006 4000 0002 9876 5432 10',
        accountHolder: 'Asnus Bilişim Ltd. Şti.',
      },
    ],
    portfolioLinks: [
      {
        title: 'Asnus Bilişim Kurumsal Hizmet Sunumu (PDF)',
        url: 'https://asnus.com/sunum.pdf',
        type: 'pdf',
      },
      {
        title: 'QR-la Çok Modüllü Mikro-SaaS Ekosistemi',
        url: 'https://qr-la.com',
        type: 'link',
      },
    ],
    isNfcCardClaimed: true,
    nfcSerial: 'NFC-ASNS-991',
    viewCount: 524,
    vcfDownloads: 182,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'avukat-ali-yilmaz': {
    id: 'vcard-demo-ali',
    slug: 'avukat-ali-yilmaz',
    userId: 'demo-host-ali',
    fullName: 'Av. Ali Yılmaz',
    jobTitle: 'Kurucu Ortak / Hukuk Müşaviri',
    company: 'Yılmaz Hukuk & Danışmanlık',
    department: 'Bilişim & Şirketler Hukuku',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Ticaret Hukuku, Bilişim Suçları, KVKK Uyum Süreçleri ve Şirket Birleşmeleri konularında hukuki danışmanlık.',
    phone: '+90 532 111 22 33',
    whatsapp: '905321112233',
    email: 'ali@yilmazhukuk.com',
    website: 'https://yilmazhukuk.com',
    location: 'Levent, Beşiktaş / İstanbul',
    mapUrl: 'https://maps.google.com/?q=Levent,Beşiktaş,İstanbul',
    theme: 'navy_prestige',
    socials: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://x.com',
    },
    bankAccounts: [
      {
        bankName: 'Yapı Kredi',
        iban: 'TR45 0006 7000 0003 4567 8901 23',
        accountHolder: 'Ali Yılmaz',
      },
    ],
    portfolioLinks: [
      {
        title: 'KVKK & Bilişim Hukuku Uyum Rehberi',
        url: 'https://yilmazhukuk.com/rehber',
        type: 'link',
      },
    ],
    isNfcCardClaimed: true,
    nfcSerial: 'NFC-LEVENT-04',
    viewCount: 219,
    vcfDownloads: 94,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function getLocalCards(): Record<string, VCardData> {
  try {
    const raw = appStorage.getItem(STORAGE_KEY_VCARDS);
    if (!raw) return { ...DEMO_VCARDS };
    return { ...DEMO_VCARDS, ...JSON.parse(raw) };
  } catch {
    return { ...DEMO_VCARDS };
  }
}

function saveLocalCards(cards: Record<string, VCardData>): void {
  try {
    appStorage.setItem(STORAGE_KEY_VCARDS, JSON.stringify(cards));
  } catch {}
}

export function cleanVCardSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '');
}

export const vcardService = {
  /**
   * Slug ile dijital kartvizit verisini bulur
   */
  async getCardBySlug(slug: string): Promise<VCardData | null> {
    const clean = cleanVCardSlug(slug);
    if (!clean) return null;

    if (isRealFirebaseConfigured && db) {
      try {
        const vcardsCol = fsCollection(db, 'vcards');
        const q = fsQuery(vcardsCol, fsWhere('slug', '==', clean));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as VCardData;
          return { ...docData, id: snap.docs[0].id };
        }
      } catch (err) {
        console.warn('Firebase vcard get failed, falling back to local:', err);
      }
    }

    const localMap = getLocalCards();
    if (localMap[clean]) {
      return localMap[clean];
    }

    const foundById = Object.values(localMap).find(c => c.id === clean);
    return foundById || null;
  },

  /**
   * Kullanıcının sahip olduğu tüm kartvizitleri getirir
   */
  async getUserCards(userId: string): Promise<VCardData[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const vcardsCol = fsCollection(db, 'vcards');
        const q = fsQuery(vcardsCol, fsWhere('userId', '==', userId));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...(d.data() as VCardData), id: d.id }));
        }
      } catch (err) {
        console.warn('Firebase getUserCards failed, falling back to local:', err);
      }
    }

    const localMap = getLocalCards();
    const all = Object.values(localMap);
    const userOwned = all.filter(c => c.userId === userId);
    return userOwned.length > 0 ? userOwned : all; // Demo fallback
  },

  /**
   * Kartvizit kaydeder veya günceller
   */
  async saveCard(
    data: Partial<VCardData> & { fullName: string; phone: string }
  ): Promise<VCardData> {
    const rawSlug = data.slug || data.fullName;
    const slug = cleanVCardSlug(rawSlug) || `card-${Date.now().toString(36)}`;
    const id = data.id || `card-${Date.now()}`;
    const now = new Date().toISOString();

    const fullRecord: VCardData = {
      id,
      slug,
      userId: data.userId || 'demo-host-yavuz',
      fullName: data.fullName,
      jobTitle: data.jobTitle || 'Profesyonel',
      company: data.company || '',
      department: data.department || '',
      avatarUrl:
        data.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      coverUrl: data.coverUrl || '',
      bio: data.bio || '',
      phone: data.phone,
      phoneSecondary: data.phoneSecondary || '',
      whatsapp: data.whatsapp || data.phone.replace(/\D/g, ''),
      email: data.email || '',
      emailSecondary: data.emailSecondary || '',
      website: data.website || '',
      location: data.location || '',
      mapUrl: data.mapUrl || '',
      theme: data.theme || 'executive_dark',
      socials: data.socials || {},
      bankAccounts: data.bankAccounts || [],
      portfolioLinks: data.portfolioLinks || [],
      isNfcCardClaimed: data.isNfcCardClaimed ?? true,
      nfcSerial: data.nfcSerial || `NFC-${slug.toUpperCase()}`,
      viewCount: data.viewCount || 0,
      vcfDownloads: data.vcfDownloads || 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const cardDocRef = fsDoc(db, 'vcards', id);
        await fsSetDoc(cardDocRef, fullRecord, { merge: true });
      } catch (err) {
        console.warn('Firebase saveCard failed:', err);
      }
    }

    const localMap = getLocalCards();
    localMap[slug] = fullRecord;
    saveLocalCards(localMap);

    return fullRecord;
  },

  /**
   * Profil görüntülenme sayısını artırır
   */
  async recordView(slug: string): Promise<void> {
    const clean = cleanVCardSlug(slug);
    const localMap = getLocalCards();
    const card = localMap[clean];

    if (card) {
      card.viewCount = (card.viewCount || 0) + 1;
      localMap[clean] = card;
      saveLocalCards(localMap);
    }

    if (isRealFirebaseConfigured && db && card) {
      try {
        const docRef = fsDoc(db, 'vcards', card.id);
        await fsUpdateDoc(docRef, { viewCount: fsIncrement(1) });
      } catch {}
    }
  },

  /**
   * Rehbere kaydetme (.vcf indirme) sayısını artırır
   */
  async recordVcfDownload(slug: string): Promise<void> {
    const clean = cleanVCardSlug(slug);
    const localMap = getLocalCards();
    const card = localMap[clean];

    if (card) {
      card.vcfDownloads = (card.vcfDownloads || 0) + 1;
      localMap[clean] = card;
      saveLocalCards(localMap);
    }

    if (isRealFirebaseConfigured && db && card) {
      try {
        const docRef = fsDoc(db, 'vcards', card.id);
        await fsUpdateDoc(docRef, { vcfDownloads: fsIncrement(1) });
      } catch {}
    }
  },

  /**
   * Kartvizit siler
   */
  async deleteCard(id: string): Promise<void> {
    const localMap = getLocalCards();
    const target = Object.values(localMap).find(c => c.id === id || c.slug === id);
    if (target) {
      delete localMap[target.slug];
      saveLocalCards(localMap);
    }

    if (isRealFirebaseConfigured && db && target) {
      try {
        await fsDeleteDoc(fsDoc(db, 'vcards', target.id));
      } catch (err) {
        console.warn('Firebase deleteCard failed:', err);
      }
    }
  },
};
