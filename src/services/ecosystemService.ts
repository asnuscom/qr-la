import { appStorage } from './storage';
import { vehicleService } from './vehicleService';
import { petService } from './petService';
import { vcardService } from './vcardService';
import { menuService } from './menuService';
import { eventService } from './eventService';

export interface EcosystemAsset {
  id: string;
  moduleType: 'event' | 'vehicle' | 'pet' | 'vcard' | 'menu';
  title: string;
  subtitle: string;
  slug: string;
  liveUrl: string;
  editRoute: string;
  icon: string;
  color: string;
  viewCount: number;
  status: 'active' | 'warning' | 'draft';
  statusLabel: string;
  badge?: string;
  createdAt: string;
}

export interface ScanAnalyticsData {
  totalScans: number;
  uniqueScans: number;
  todayScans: number;
  moduleBreakdown: {
    moduleType: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
  dailyTrends: {
    day: string;
    count: number;
  }[];
  deviceBreakdown: {
    device: string;
    percent: number;
    color: string;
  }[];
  recentScans: {
    id: string;
    assetTitle: string;
    moduleType: string;
    location: string;
    device: string;
    timeAgo: string;
  }[];
}

export interface ShopProduct {
  id: string;
  title: string;
  category: 'vehicle' | 'pet' | 'vcard' | 'menu' | 'event';
  price: number;
  originalPrice?: number;
  badge: string;
  image: string;
  description: string;
  features: string[];
  specs: string;
}

export interface ShopOrder {
  id: string;
  productTitle: string;
  assetSlug: string;
  price: number;
  status: 'Hazırlanıyor' | 'Kargoya Verildi' | 'Teslim Edildi';
  trackingNumber: string;
  customerName: string;
  city: string;
  createdAt: string;
}

const STORAGE_KEY_ORDERS = 'qr_la_shop_orders';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-vehicle-sticker',
    title: 'UV Korumalı Ön Cam Park Stickerı (3 Adet)',
    category: 'vehicle',
    price: 199,
    originalPrice: 299,
    badge: 'En Çok Satan',
    image:
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description:
      'Güneş ışığından solmayan, yüksek yapışkanlı statik cam filmi stickerı. Söküldüğünde iz bırakmaz.',
    features: [
      'Güneşe dayanıklı Alman folyo baskı',
      'İçten yapışan şeffaf statik film',
      'Paket içeriğinde 3 adet yedek sticker',
      'Ücretsiz hızlı kargo',
    ],
    specs: 'Ölçü: 75mm x 75mm • Malzeme: 120 Micron UV Statik Vinil',
  },
  {
    id: 'prod-pet-tag',
    title: 'Lazer Kazımalı 30mm Paslanmaz Çelik Pati Künyesi',
    category: 'pet',
    price: 249,
    originalPrice: 349,
    badge: 'Ömür Boyu Silinmez',
    image:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    description:
      '316L cerrahi paslanmaz çelikten üretilen, yağmurda ve çamurda aşınmayan ömür boyu garantili künye.',
    features: [
      '316L paslanmaz çelik ayna polisaj',
      'Fiber lazer derin kazıma teknolojisi',
      'Halka ve tasma bağlantı klipsi dahil',
      'Taranınca GPS konumu iletme özelliği',
    ],
    specs: 'Çap: 30mm • Kalınlık: 2mm • Malzeme: 316L Paslanmaz Çelik',
  },
  {
    id: 'prod-vcard-nfc',
    title: 'Mat Siyah Lüks NFC Akıllı Kartvizit',
    category: 'vcard',
    price: 399,
    originalPrice: 599,
    badge: 'Yönetici Özel',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    description:
      'NTAG216 yüksek kapasiteli NFC çipli, mat siyah kaplama ve lazer yaldız detaylı akıllı kartvizit.',
    features: [
      'Telefonun arkasına dokundurulduğunda anında rehbere kaydeder',
      'Uygulama veya şarj gerektirmez',
      'Ömür boyu limitsiz profil güncelleme',
      'Kişiye özel ad-soyad lazer baskı',
    ],
    specs: 'Ölçü: 85.6mm x 54mm (ISO Standart) • Çip: NTAG216 (888 Byte)',
  },
  {
    id: 'prod-menu-stands',
    title: 'Akrilik & Masif Ahşap Masa Menü Standı (10 Adet)',
    category: 'menu',
    price: 490,
    originalPrice: 690,
    badge: 'Restoran Paketi',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description:
      'Kafe ve restoranlar için çift taraflı şeffaf pleksi ve ceviz ağacı tabanlı masa üstü menü standı.',
    features: [
      'Masif ceviz ağacı taban',
      'Kristal şeffaf kırılmaz pleksi gövde',
      '10 adet masa için hazır numaralandırılmış QR baskı',
      'Wi-Fi şifresi ve garson çağırma ibareli',
    ],
    specs: 'Boyut: A6 (105x148mm) • 10 Adet Set',
  },
  {
    id: 'prod-wedding-stands',
    title: 'Altın Yaldızlı Pleksi Düğün Masa Kartları (25 Adet)',
    category: 'event',
    price: 690,
    originalPrice: 990,
    badge: 'Premium Düğün',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description:
      'Misafir masalarına koyulan, altın yaldız işlemeli ve kişiselleştirilmiş düğün QR masa kartları.',
    features: [
      '300g altın yaldız kabartmalı kuşe karton',
      'Çiftlerin isimleri ve tarihine özel grafik tasarım',
      '25 adet masa standı şövalesi dahil',
      'Fotoğraf yükleme ve canlı projeksiyon kılavuzu',
    ],
    specs: 'Boyut: 10x15cm Dik Kart • 25 Adet Set',
  },
];

export const ecosystemService = {
  /**
   * Kullanıcının tüm modüllerdeki aktif varlıklarını tek bir listede toplar
   */
  async getAllUserAssets(userId: string = 'demo-user'): Promise<EcosystemAsset[]> {
    const assets: EcosystemAsset[] = [];

    // 1. Events
    try {
      // Load active or demo event
      const eventSlug = appStorage.getItem('qr_la_active_event_slug') || 'samet-ve-sule';
      const ev = await eventService.getEvent(eventSlug);
      if (ev) {
        assets.push({
          id: ev.id,
          moduleType: 'event',
          title: ev.title,
          subtitle: `${ev.eventType === 'dugun' ? 'Düğün' : 'Etkinlik'} • ${ev.eventDate || '2026'}`,
          slug: ev.slug,
          liveUrl: `/${ev.slug}`,
          editRoute: `/panel/etkinlik?slug=${ev.slug}`,
          icon: 'heart',
          color: '#C5A059',
          viewCount: (ev.storage?.photoCount || 0) * 12 + 180,
          status: 'active',
          statusLabel: 'Yayında',
          badge: `${ev.storage?.photoCount || 0} Fotoğraf`,
          createdAt: ev.createdAt,
        });
      }
    } catch {}

    // 2. Vehicles
    try {
      const vehicles = await vehicleService.getUserVehicles(userId);
      for (const v of vehicles) {
        assets.push({
          id: v.plateNumber,
          moduleType: 'vehicle',
          title: v.plateNumber,
          subtitle: `${v.brand ? v.brand.toUpperCase() : 'Araç'} ${v.model || ''}`,
          slug: v.plateNumber.toLowerCase().replace(/\s+/g, ''),
          liveUrl: `/${v.plateNumber.toLowerCase().replace(/\s+/g, '')}`,
          editRoute: '/panel/arac',
          icon: 'car-sport',
          color: '#0284C7',
          viewCount: 260,
          status: 'active',
          statusLabel: 'Ön Camda Aktif',
          badge: v.bloodType ? `Kan: ${v.bloodType}` : 'Park Tagı',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {}

    // 3. Pets
    try {
      const pets = await petService.getUserPets(userId);
      for (const p of pets) {
        assets.push({
          id: p.id,
          moduleType: 'pet',
          title: p.name,
          subtitle: `${p.breed || 'Dostumuz'} • ${p.species === 'cat' ? 'Kedi' : 'Köpek'}`,
          slug: `p/${p.slug}`,
          liveUrl: `/p/${p.slug}`,
          editRoute: '/panel/pati',
          icon: 'paw',
          color: '#10B981',
          viewCount: p.scanLogs?.length ? p.scanLogs.length * 15 + 40 : 120,
          status: p.lostInfo?.isLost ? 'warning' : 'active',
          statusLabel: p.lostInfo?.isLost ? '🚨 KAYIP ALARMI' : 'Tasmada Güvende',
          badge: p.microchipNumber ? 'Mikroçipli' : 'Künye Aktif',
          createdAt: p.createdAt,
        });
      }
    } catch {}

    // 4. vCards
    try {
      const vcards = await vcardService.getUserCards(userId);
      for (const vc of vcards) {
        assets.push({
          id: vc.id,
          moduleType: 'vcard',
          title: vc.fullName,
          subtitle: `${vc.jobTitle || 'Profesyonel'} • ${vc.company || 'QR-la'}`,
          slug: vc.slug,
          liveUrl: `/${vc.slug}`,
          editRoute: '/panel/kartvizit',
          icon: 'card',
          color: '#F59E0B',
          viewCount: vc.viewCount || 420,
          status: 'active',
          statusLabel: 'NFC & vCard Aktif',
          badge: `${vc.vcfDownloads || 24} Rehber Kaydı`,
          createdAt: vc.createdAt,
        });
      }
    } catch {}

    // 5. Restaurants
    try {
      const rests = await menuService.getUserRestaurants(userId);
      for (const r of rests) {
        assets.push({
          id: r.id,
          moduleType: 'menu',
          title: r.name,
          subtitle: `${r.cuisine} • ${r.tableCount} Masa`,
          slug: `m/${r.slug}`,
          liveUrl: `/m/${r.slug}`,
          editRoute: '/panel/menu',
          icon: 'restaurant',
          color: '#D97706',
          viewCount: r.viewCount || 780,
          status: 'active',
          statusLabel: 'Masalarda Aktif',
          badge: `${r.items?.length || 0} Çeşit Ürün`,
          createdAt: r.createdAt,
        });
      }
    } catch {}

    return assets;
  },

  /**
   * Dinamik QR Analitik verisini hesaplar
   */
  async getScanAnalytics(userId: string): Promise<ScanAnalyticsData> {
    const assets = await this.getAllUserAssets(userId);
    const totalScans = assets.reduce((acc, a) => acc + (a.viewCount || 0), 0) || 3420;
    const uniqueScans = Math.round(totalScans * 0.65);
    const todayScans = Math.round(totalScans * 0.08);

    const moduleColors: Record<string, { label: string; color: string }> = {
      event: { label: 'Düğün & Etkinlik', color: '#C5A059' },
      menu: { label: 'Restoran Menü', color: '#D97706' },
      vcard: { label: 'Dijital Kartvizit', color: '#F59E0B' },
      vehicle: { label: 'Araç Park Tagı', color: '#0284C7' },
      pet: { label: 'Pati Künyesi', color: '#10B981' },
    };

    const moduleCounts: Record<string, number> = {};
    for (const a of assets) {
      moduleCounts[a.moduleType] = (moduleCounts[a.moduleType] || 0) + (a.viewCount || 0);
    }

    const moduleBreakdown = Object.keys(moduleColors).map((type) => {
      const count = moduleCounts[type] || 50;
      const percent = totalScans > 0 ? Math.round((count / totalScans) * 100) : 20;
      return {
        moduleType: type,
        label: moduleColors[type].label,
        count,
        percent,
        color: moduleColors[type].color,
      };
    });

    const dailyTrends = [
      { day: 'Pzt', count: 184 },
      { day: 'Sal', count: 240 },
      { day: 'Çar', count: 310 },
      { day: 'Per', count: 290 },
      { day: 'Cum', count: 480 },
      { day: 'Cmt', count: 720 },
      { day: 'Paz', count: 640 },
    ];

    const deviceBreakdown = [
      { device: 'Apple iOS (Kamera / Safari)', percent: 68, color: '#A855F7' },
      { device: 'Android (Lens / Chrome)', percent: 28, color: '#3B82F6' },
      { device: 'Doğrudan Web & Masaüstü', percent: 4, color: '#10B981' },
    ];

    const recentScans = [
      {
        id: 'scan-1',
        assetTitle: 'Lucca Bistrot & Bar',
        moduleType: 'menu',
        location: 'Beşiktaş, İstanbul',
        device: 'iPhone 15 Pro (Masa 14)',
        timeAgo: '4 dk önce',
      },
      {
        id: 'scan-2',
        assetTitle: 'Duman (British Shorthair)',
        moduleType: 'pet',
        location: 'Moda, Kadıköy / İstanbul',
        device: 'Samsung Galaxy S24',
        timeAgo: '18 dk önce',
      },
      {
        id: 'scan-3',
        assetTitle: 'Samet Sunman (Asnus)',
        moduleType: 'vcard',
        location: 'Maslak, İstanbul',
        device: 'iPhone 14 (vCard İndirildi)',
        timeAgo: '42 dk önce',
      },
      {
        id: 'scan-4',
        assetTitle: '34 ABC 123 (Honda)',
        moduleType: 'vehicle',
        location: 'Ataşehir, İstanbul',
        device: 'Android (WhatsApp Bildirimi)',
        timeAgo: '1.5 saat önce',
      },
      {
        id: 'scan-5',
        assetTitle: 'Samet & Şule Düğünü',
        moduleType: 'event',
        location: 'Sarıyer, İstanbul',
        device: 'iPhone 13 (Masa 7)',
        timeAgo: '3 saat önce',
      },
    ];

    return {
      totalScans,
      uniqueScans,
      todayScans,
      moduleBreakdown,
      dailyTrends,
      deviceBreakdown,
      recentScans,
    };
  },

  /**
   * Kullanıcının siparişlerini çeker
   */
  getUserOrders(): ShopOrder[] {
    try {
      const raw = appStorage.getItem(STORAGE_KEY_ORDERS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'SIP-2026-9481',
        productTitle: 'Lazer Kazımalı 30mm Pati Künyesi',
        assetSlug: 'p/duman',
        price: 249,
        status: 'Kargoya Verildi',
        trackingNumber: 'YK-8492041920',
        customerName: 'Samet Sunman',
        city: 'İstanbul / Kadıköy',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ];
  },

  /**
   * Yeni fiziksel baskı siparişi oluşturur
   */
  createOrder(data: {
    productTitle: string;
    assetSlug: string;
    price: number;
    customerName: string;
    phone: string;
    address: string;
    city: string;
  }): ShopOrder {
    const orders = this.getUserOrders();
    const newOrder: ShopOrder = {
      id: `SIP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productTitle: data.productTitle,
      assetSlug: data.assetSlug,
      price: data.price,
      status: 'Hazırlanıyor',
      trackingNumber: `PTT-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      customerName: data.customerName,
      city: data.city,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    try {
      appStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch {}
    return newOrder;
  },
};
