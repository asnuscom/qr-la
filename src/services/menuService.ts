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
import { RestaurantData } from '@/types';

const STORAGE_KEY_RESTAURANTS = 'qr_la_restaurants_data';

export const DEMO_RESTAURANTS: Record<string, RestaurantData> = {
  'lucca-bistrot': {
    id: 'rest-demo-lucca',
    slug: 'lucca-bistrot',
    userId: 'demo-rest-lucca',
    name: 'Lucca Bistrot & Cocktail Bar',
    cuisine: 'Modern Akdeniz & Dünya Mutfağı',
    logoUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description:
      'Bebek sahilinin buluşma noktası. Taze yerel malzemelerle hazırlanan imza tabaklar ve zanaatkar kokteyller.',
    currency: '₺',
    phone: '02122571255',
    address: 'Cevdet Paşa Cad. No:51 Bebek, Beşiktaş / İstanbul',
    mapUrl: 'https://maps.google.com/?q=Bebek,Beşiktaş,İstanbul',
    wifiSsid: 'Lucca_Guest',
    wifiPassword: 'lucca_bebek_2026',
    openingHours: 'Her gün 10:00 - 02:00',
    theme: 'bistro_dark',
    tableCount: 25,
    enableWaiterCall: true,
    enableBillRequest: true,
    viewCount: 1840,
    categories: [
      { id: 'cat-1', name: 'Başlangıçlar & Tapas', order: 1 },
      { id: 'cat-2', name: 'El Açması Makarna & Risotto', order: 2 },
      { id: 'cat-3', name: 'İmza Ana Yemekler', order: 3 },
      { id: 'cat-4', name: 'Tatlılar & Çikolata', order: 4 },
      { id: 'cat-5', name: 'İmza Kokteyller & İçecekler', order: 5 },
    ],
    items: [
      {
        id: 'item-1',
        categoryId: 'cat-1',
        name: 'Trüflü Dana Carpaccio',
        description: 'İnce dilimlenmiş bonfile, taze siyah trüf mantarı rendesi, roka, parmesan pulları ve trüf yağı.',
        price: 540,
        photoUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        tags: ['chef_pick', 'popular'],
        allergens: ['Laktoz'],
        isAvailable: true,
        calories: 420,
      },
      {
        id: 'item-2',
        categoryId: 'cat-1',
        name: 'Çıtır Kalamar & Aioli',
        description: 'Ege usulü taze kalamar tava, taze narenciyeli aioli sos ve karamelize limon ile.',
        price: 460,
        photoUrl:
          'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        tags: ['popular'],
        allergens: ['Glüten', 'Kabuklu'],
        isAvailable: true,
        calories: 380,
      },
      {
        id: 'item-3',
        categoryId: 'cat-1',
        name: 'Burrata & İncirli Domates',
        description: 'İtalyan burrata peyniri, balsamik havyarı, fesleğen pesto sos ve taze incir.',
        price: 490,
        photoUrl:
          'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
        tags: ['vegetarian', 'gluten_free'],
        allergens: ['Laktoz'],
        isAvailable: true,
        calories: 350,
      },
      {
        id: 'item-4',
        categoryId: 'cat-2',
        name: 'Pappardelle Porcini Ragu',
        description: 'El açması taze pappardelle, yabani porcini mantarı, ağır ateşte pişmiş ragu sos ve eski kaşar.',
        price: 580,
        photoUrl:
          'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80',
        tags: ['chef_pick'],
        allergens: ['Glüten', 'Laktoz'],
        isAvailable: true,
        calories: 650,
      },
      {
        id: 'item-5',
        categoryId: 'cat-2',
        name: 'Safranlı Deniz Mahsüllü Risotto',
        description: 'Karnaroli pirinci, taze safran, jumbo karides, midye, kalamar ve limon kabuğu rendesi.',
        price: 620,
        photoUrl:
          'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
        tags: ['gluten_free', 'popular'],
        allergens: ['Kabuklu', 'Laktoz'],
        isAvailable: true,
        calories: 580,
      },
      {
        id: 'item-6',
        categoryId: 'cat-3',
        name: 'Dry-Aged Antrikot (28 Gün)',
        description: 'Kömür ateşinde ızgara 300g dinlendirilmiş antrikot, trüflü patates püresi ve biberiye demi-glace.',
        price: 890,
        photoUrl:
          'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
        tags: ['chef_pick', 'gluten_free'],
        allergens: ['Laktoz'],
        isAvailable: true,
        calories: 780,
      },
      {
        id: 'item-7',
        categoryId: 'cat-3',
        name: 'Fırınlanmış Norveç Somonu',
        description: 'Glaze edilmiş taze somon fileto, kuşkonmaz sote, limonlu hollandez sos ve yabani pirinç.',
        price: 720,
        photoUrl:
          'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        tags: ['gluten_free'],
        allergens: ['Balık', 'Laktoz'],
        isAvailable: true,
        calories: 520,
      },
      {
        id: 'item-8',
        categoryId: 'cat-4',
        name: 'İmza San Sebastian Cheesecake',
        description: 'Karamelize üst kabuk, akışkan Belçika çikolatası sosu ile servis edilir.',
        price: 280,
        photoUrl:
          'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
        tags: ['popular', 'vegetarian'],
        allergens: ['Glüten', 'Laktoz', 'Yumurta'],
        isAvailable: true,
        calories: 440,
      },
      {
        id: 'item-9',
        categoryId: 'cat-4',
        name: 'Klasik İtalyan Tiramisu',
        description: 'Mascarpone kreması, espressoya batırılmış savoyardi bisküvisi ve Valrhona kakao.',
        price: 260,
        photoUrl:
          'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
        tags: ['vegetarian'],
        allergens: ['Glüten', 'Laktoz'],
        isAvailable: true,
        calories: 390,
      },
      {
        id: 'item-10',
        categoryId: 'cat-5',
        name: 'Spicy Passion Mezcalita',
        description: 'Oaxacan mezcal, çarkıfelek meyvesi püresi, taze lime suyu, agave şurubu ve chili tuz kenarlık.',
        price: 390,
        photoUrl:
          'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
        tags: ['chef_pick', 'spicy'],
        isAvailable: true,
        calories: 180,
      },
      {
        id: 'item-11',
        categoryId: 'cat-5',
        name: 'Ev Yapımı Lavantalı Limonata',
        description: 'Taze sıkılmış Bodrum limonu, lavanta infüzyonu, nane yaprakları ve bal.',
        price: 160,
        photoUrl:
          'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        tags: ['vegan'],
        isAvailable: true,
        calories: 95,
      },
    ],
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'bogazici-balik': {
    id: 'rest-demo-balik',
    slug: 'bogazici-balik',
    userId: 'demo-rest-balik',
    name: 'Boğaziçi Balık & Ege Mezeleri',
    cuisine: 'Taze Deniz Mahsülleri & Ege Mutfağı',
    logoUrl:
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Boğaz kıyısında taze mevsim balıkları, zeytinyağlı Ege mezeleri ve deniz esintisi.',
    currency: '₺',
    phone: '02163321122',
    address: 'Kandilli Cad. No:14 Üsküdar / İstanbul',
    mapUrl: 'https://maps.google.com/?q=Kandilli,Üsküdar,İstanbul',
    wifiSsid: 'Bogazici_Guest',
    wifiPassword: 'balik_kandilli',
    openingHours: 'Her gün 12:00 - 00:00',
    theme: 'ocean_blue',
    tableCount: 20,
    enableWaiterCall: true,
    enableBillRequest: true,
    viewCount: 780,
    categories: [
      { id: 'cat-b1', name: 'Zeytinyağlı Mezeler', order: 1 },
      { id: 'cat-b2', name: 'Deniz Mahsülü Ara Sıcaklar', order: 2 },
      { id: 'cat-b3', name: 'Günün Taze Balıkları', order: 3 },
    ],
    items: [
      {
        id: 'b-1',
        categoryId: 'cat-b1',
        name: 'Levrek Marin',
        description: 'Hardal tohumu, taze rezene ve kapari taneleriyle marine edilmiş çiğ levrek fileto.',
        price: 360,
        tags: ['popular'],
        allergens: ['Balık', 'Hardal'],
        isAvailable: true,
      },
      {
        id: 'b-2',
        categoryId: 'cat-b2',
        name: 'Tereyağlı Karides Güveç',
        description: 'Sarımsak, pul biber ve taş fırın tereyağında cızırdayan taze karides.',
        price: 440,
        tags: ['chef_pick'],
        allergens: ['Kabuklu', 'Laktoz'],
        isAvailable: true,
      },
      {
        id: 'b-3',
        categoryId: 'cat-b3',
        name: 'Kömürde Izgara Kalkan',
        description: 'Közlenmiş biber, taze roka ve kırmızı soğan ile servis edilir.',
        price: 980,
        tags: ['chef_pick', 'gluten_free'],
        allergens: ['Balık'],
        isAvailable: true,
      },
    ],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function getLocalRestaurants(): Record<string, RestaurantData> {
  try {
    const raw = appStorage.getItem(STORAGE_KEY_RESTAURANTS);
    if (!raw) return { ...DEMO_RESTAURANTS };
    return { ...DEMO_RESTAURANTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEMO_RESTAURANTS };
  }
}

function saveLocalRestaurants(data: Record<string, RestaurantData>): void {
  try {
    appStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(data));
  } catch {}
}

export function cleanMenuSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '');
}

export const menuService = {
  /**
   * Slug ile restoran menü verisini bulur
   */
  async getRestaurantBySlug(slug: string): Promise<RestaurantData | null> {
    const clean = cleanMenuSlug(slug);
    if (!clean) return null;

    if (isRealFirebaseConfigured && db) {
      try {
        const restCol = fsCollection(db, 'restaurants');
        const q = fsQuery(restCol, fsWhere('slug', '==', clean));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as RestaurantData;
          return { ...docData, id: snap.docs[0].id };
        }
      } catch (err) {
        console.warn('Firebase menu get failed, falling back to local:', err);
      }
    }

    const localMap = getLocalRestaurants();
    if (localMap[clean]) {
      return localMap[clean];
    }

    const foundById = Object.values(localMap).find(r => r.id === clean);
    return foundById || null;
  },

  /**
   * Kullanıcının restoranlarını getirir
   */
  async getUserRestaurants(userId: string): Promise<RestaurantData[]> {
    if (isRealFirebaseConfigured && db) {
      try {
        const restCol = fsCollection(db, 'restaurants');
        const q = fsQuery(restCol, fsWhere('userId', '==', userId));
        const snap = await fsGetDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...(d.data() as RestaurantData), id: d.id }));
        }
      } catch (err) {
        console.warn('Firebase getUserRestaurants failed:', err);
      }
    }

    const localMap = getLocalRestaurants();
    const all = Object.values(localMap);
    return all.filter(r => r.userId === userId);
  },

  /**
   * Restoran ve menüyü kaydeder veya günceller
   */
  async saveRestaurant(
    data: Partial<RestaurantData> & { name: string; phone: string }
  ): Promise<RestaurantData> {
    const rawSlug = data.slug || data.name;
    const slug = cleanMenuSlug(rawSlug) || `rest-${Date.now().toString(36)}`;
    const id = data.id || `rest-${Date.now()}`;
    const now = new Date().toISOString();

    const fullRecord: RestaurantData = {
      id,
      slug,
      userId: data.userId || 'demo-host-yavuz',
      name: data.name,
      cuisine: data.cuisine || 'Restoran & Kafe',
      logoUrl:
        data.logoUrl ||
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      coverUrl:
        data.coverUrl ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description: data.description || 'Hoş geldiniz!',
      currency: data.currency || '₺',
      phone: data.phone,
      address: data.address || '',
      mapUrl: data.mapUrl || '',
      wifiSsid: data.wifiSsid || '',
      wifiPassword: data.wifiPassword || '',
      openingHours: data.openingHours || '10:00 - 00:00',
      theme: data.theme || 'bistro_dark',
      categories: data.categories || [
        { id: 'c1', name: 'Başlangıçlar', order: 1 },
        { id: 'c2', name: 'Ana Yemekler', order: 2 },
        { id: 'c3', name: 'Tatlılar', order: 3 },
      ],
      items: data.items || [],
      tableCount: data.tableCount || 20,
      enableWaiterCall: data.enableWaiterCall ?? true,
      enableBillRequest: data.enableBillRequest ?? true,
      viewCount: data.viewCount || 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    if (isRealFirebaseConfigured && db) {
      try {
        const docRef = fsDoc(db, 'restaurants', id);
        await fsSetDoc(docRef, fullRecord, { merge: true });
      } catch (err) {
        console.warn('Firebase saveRestaurant failed:', err);
      }
    }

    const localMap = getLocalRestaurants();
    localMap[slug] = fullRecord;
    saveLocalRestaurants(localMap);

    return fullRecord;
  },

  /**
   * Menü görüntüleme sayısını artırır
   */
  async recordView(slug: string): Promise<void> {
    const clean = cleanMenuSlug(slug);
    const localMap = getLocalRestaurants();
    const rest = localMap[clean];

    if (rest) {
      rest.viewCount = (rest.viewCount || 0) + 1;
      localMap[clean] = rest;
      saveLocalRestaurants(localMap);
    }

    if (isRealFirebaseConfigured && db && rest) {
      try {
        const docRef = fsDoc(db, 'restaurants', rest.id);
        await fsUpdateDoc(docRef, { viewCount: fsIncrement(1) });
      } catch {}
    }
  },

  /**
   * Restoranı siler
   */
  async deleteRestaurant(id: string): Promise<void> {
    const localMap = getLocalRestaurants();
    const target = Object.values(localMap).find(r => r.id === id || r.slug === id);
    if (target) {
      delete localMap[target.slug];
      saveLocalRestaurants(localMap);
    }

    if (isRealFirebaseConfigured && db && target) {
      try {
        await fsDeleteDoc(fsDoc(db, 'restaurants', target.id));
      } catch (err) {
        console.warn('Firebase deleteRestaurant failed:', err);
      }
    }
  },
};
