import { EventModel, AlbumModel, PhotoModel, GuestbookEntryModel, PlanTierConfig } from '@/types';

export const DEMO_EVENT: EventModel = {
  id: 'event-yavuz-merve-2026',
  slug: 'demo-panel',
  title: 'Yavuz & Merve Düğünü',
  subtitle: 'Bu mutlu anımıza ortak olduğunuz için teşekkür ederiz.',
  hosts: {
    brideOrPrimary: 'Merve',
    groomOrSecondary: 'Yavuz',
  },
  eventType: 'dugun',
  eventDate: '2026-10-18T18:30:00.000Z',
  coverPhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  invitationUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  theme: {
    primaryColor: '#C5A059', // Elegant Champagne Gold
    secondaryColor: '#EAD7BB',
    backgroundColor: '#FAF7F2',
    textColor: '#1A1817',
  },
  venue: {
    name: 'Sait Halim Paşa Yalısı',
    address: 'Köybaşı Cad. No:83, Yeniköy, Sarıyer / İstanbul',
    mapUrl: 'https://maps.google.com/?q=Sait+Halim+Pasa+Yalisi+Istanbul',
    lat: 41.1197,
    lng: 29.0601,
  },
  schedule: [
    {
      id: 'sch-1',
      time: '18:30',
      title: 'Karşılama Kokteyli',
      description: 'Giriş bahçesinde canlı caz müzik ve ikramlar eşliğinde karşılama.',
      icon: 'glass-cocktail',
    },
    {
      id: 'sch-2',
      time: '19:30',
      title: 'Nikah Töreni & İlk Dans',
      description: 'Boğaz manzaralı terasta evlilik yemini ve ilk vals.',
      icon: 'ring',
    },
    {
      id: 'sch-3',
      time: '20:30',
      title: 'Akşam Yemeği & Müzik',
      description: 'Zengin düğün menüsü eşliğinde orkestra dinletisi.',
      icon: 'silverware-fork-knife',
    },
    {
      id: 'sch-4',
      time: '22:00',
      title: 'Düğün Pastası Kesimi',
      description: 'Işık gösterisi ve şampanya eşliğinde pasta merasimi.',
      icon: 'cake-variant',
    },
    {
      id: 'sch-5',
      time: '23:00',
      title: 'After Party & Canlı DJ',
      description: 'Gece yarısına kadar sürecek dans ve eğlence.',
      icon: 'music',
    },
  ],
  settings: {
    isPrivate: false,
    pinCode: '1923',
    enableCompression: true,
    allowGuestDownloads: true,
    isLiveFeedActive: true,
    allowGuestbook: true,
    autoApprovePhotos: true,
  },
  storage: {
    quotaBytes: 524288000, // 500 MB
    usedBytes: 134217728,  // ~128 MB used
    photoCount: 42,
    tier: 'free',
    expiresAt: '2026-11-18T18:30:00.000Z',
  },
  createdAt: '2026-10-01T10:00:00.000Z',
};

export const DEMO_ALBUMS: AlbumModel[] = [
  {
    id: 'alb-all',
    slug: 'all',
    name: 'Tüm Kareler',
    order: 0,
    photoCount: 42,
  },
  {
    id: 'alb-1',
    slug: 'nikah-ve-dans',
    name: 'Nikah & İlk Dans',
    order: 1,
    photoCount: 16,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alb-2',
    slug: 'masalar-ve-misafirler',
    name: 'Masalar & Misafirler',
    order: 2,
    photoCount: 14,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alb-3',
    slug: 'eglence-ve-dans',
    name: 'Eğlence & Halay',
    order: 3,
    photoCount: 12,
    coverPhotoUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
  },
];

export const DEMO_PHOTOS: PhotoModel[] = [
  {
    id: 'ph-1',
    eventSlug: 'demo-panel',
    albumId: 'alb-1',
    originalUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Ahmet & Selin',
    tableNumber: 'Masa 4',
    guestNote: 'Gözlerinizdeki mutluluk daim olsun, bir ömür el ele!',
    sizeBytes: 840000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 24,
    createdAt: '2026-10-18T19:45:00.000Z',
  },
  {
    id: 'ph-2',
    eventSlug: 'demo-panel',
    albumId: 'alb-1',
    originalUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Canan Teyze',
    tableNumber: 'Protokol Masası',
    guestNote: 'Masal gibi bir çift oldunuz maşallah.',
    sizeBytes: 720000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 18,
    createdAt: '2026-10-18T20:10:00.000Z',
  },
  {
    id: 'ph-3',
    eventSlug: 'demo-panel',
    albumId: 'alb-2',
    originalUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Berk & Üniversite Ekibi',
    tableNumber: 'Masa 9',
    guestNote: 'Kardeşimizi verdik, çok mutluyuz! 🔥',
    sizeBytes: 950000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 31,
    createdAt: '2026-10-18T20:45:00.000Z',
  },
  {
    id: 'ph-4',
    eventSlug: 'demo-panel',
    albumId: 'alb-3',
    originalUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Ece & Deniz',
    tableNumber: 'Masa 7',
    guestNote: 'Pistten inmiyoruz, harika bir gece!',
    sizeBytes: 810000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 15,
    createdAt: '2026-10-18T21:15:00.000Z',
  },
  {
    id: 'ph-5',
    eventSlug: 'demo-panel',
    albumId: 'alb-2',
    originalUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Kuzenler Grubu',
    tableNumber: 'Masa 3',
    guestNote: 'Mervemiz gelin oldu, gururluyuz ❤️',
    sizeBytes: 670000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 22,
    createdAt: '2026-10-18T21:30:00.000Z',
  },
  {
    id: 'ph-6',
    eventSlug: 'demo-panel',
    albumId: 'alb-1',
    originalUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
    uploaderName: 'Mert Yılmaz',
    tableNumber: 'Damat Tarafı',
    guestNote: 'Muazzam pasta anı!',
    sizeBytes: 780000,
    width: 1400,
    height: 933,
    isApproved: true,
    likes: 40,
    createdAt: '2026-10-18T22:15:00.000Z',
  },
];

export const DEMO_GUESTBOOK: GuestbookEntryModel[] = [
  {
    id: 'gb-1',
    eventSlug: 'demo-panel',
    authorName: 'Selin & Burak Özkan',
    tableNumber: 'Masa 4',
    relationship: 'Lise Dostları',
    message: 'Canımız Merve ve Yavuz! Yıllar süren güzel hikayenizin bu muhteşem taçlanışında yanınızda olmak tarifsiz bir mutluluk. Yuvanızdan neşe, sevgi ve huzur hiç eksik olmasın!',
    attachedPhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    likes: 12,
    createdAt: '2026-10-18T20:15:00.000Z',
  },
  {
    id: 'gb-2',
    eventSlug: 'demo-panel',
    authorName: 'Kemal Amcan & Fatma Teyzen',
    tableNumber: 'Masa 1',
    relationship: 'Aile Büyükleri',
    message: 'Sevgili yavrularımız, birbirinize gösterdiğiniz bu derin saygı ve sevgi daim olsun. Ömrünüz bir yastıkta, sağlık ve afiyetle geçsin inşallah.',
    likes: 8,
    createdAt: '2026-10-18T20:45:00.000Z',
  },
  {
    id: 'gb-3',
    eventSlug: 'demo-panel',
    authorName: 'Yazılım & Şirket Ekibi',
    tableNumber: 'Masa 8',
    relationship: 'İş Arkadaşları',
    message: 'Yavuz’u ilk defa bu kadar duygusal ve heyecanlı görüyoruz! Harika bir çiftsiniz. Merve’ye bol sabır, Yavuz’a ömür boyu mutluluklar dileriz! 🚀🎉',
    likes: 19,
    createdAt: '2026-10-18T21:20:00.000Z',
  },
  {
    id: 'gb-4',
    eventSlug: 'demo-panel',
    authorName: 'Zeynep Kaya',
    tableNumber: 'Masa 6',
    relationship: 'Nedime',
    message: 'Merveciğim hayatımın en güzel gelini oldun. İkinizi de çok ama çok seviyorum, balayı fotoğraflarını sabırsızlıkla bekliyoruz!',
    likes: 14,
    createdAt: '2026-10-18T21:50:00.000Z',
  },
];

export const PLAN_TIERS: PlanTierConfig[] = [
  {
    tier: 'free',
    name: 'Ücretsiz Başlangıç',
    priceTL: 0,
    quotaMB: 500,
    retentionDays: 30,
    features: [
      '500 MB Bulut Depolama (~500 Fotoğraf)',
      '30 Gün Boyunca Güvenli Saklama',
      'Standart QR Masa Kartı Tasarımı',
      'Toplu Fotoğraf Yükleme (Sıkıştırmalı)',
      'Ziyaretçi Anı Defteri',
      'Tüm Fotoğrafları Tek Tıkla ZIP İndirme',
    ],
  },
  {
    tier: 'standart',
    name: 'Standart Kutlama',
    priceTL: 249,
    quotaMB: 2048,
    retentionDays: 90,
    features: [
      '2 GB Bulut Depolama (~2.500 Fotoğraf)',
      '90 Gün Boyunca Saklama',
      '3 Farklı Premium QR Masa Kartı Şablonu',
      'Özel Albüm Kategorileri (Nikah, Halay vb.)',
      'ZIP Arşiv İndirme',
      'PIN Kodu ile Özel Giriş Koruması',
    ],
  },
  {
    tier: 'premium',
    name: 'Premium Düğün',
    priceTL: 499,
    quotaMB: 5120,
    retentionDays: 180,
    isPopular: true,
    features: [
      '5 GB Bulut Depolama (~6.000 Fotoğraf)',
      '180 Gün (6 Ay) Arşivleme',
      'Salona Özel Canlı Projeksiyon Ekranı',
      'Özel Alan Adı / QR Masa Standı Tasarımı',
      'Misafir İndirme İzni Yönetimi',
      'Öncelikli WhatsApp Destek Hattı',
    ],
  },
  {
    tier: 'vip',
    name: 'VIP Masalsı Düğün',
    priceTL: 899,
    quotaMB: 15360,
    retentionDays: 365,
    features: [
      '15 GB Devasa Depolama (~18.000 Fotoğraf)',
      '1 Tam Yıl Kesintisiz Bulut Arşivi',
      'Orijinal RAW / Full HD Kalite İndirme',
      'Canlı Projeksiyon + Canlı Tebrik Pop-up',
      'Yapay Zeka Destekli Yüz Tanıma & Filtreleme',
      'Kişiye Özel Matbaa Baskı Şablon Hazırlığı',
    ],
  },
];

export function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateDefaultEvent(slug: string, hostDisplayName?: string): EventModel {
  const cleanSlug = slugify(slug || 'etkinlik') || 'etkinlik';
  const parts = cleanSlug.split(/-ve-|-ile-|-and-|-/);

  const capitalize = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

  let brideName = 'Merve';
  let groomName = 'Yavuz';
  let title = 'Özel Düğün Kutlaması';

  if (hostDisplayName && hostDisplayName.trim()) {
    const trimmed = hostDisplayName.trim();
    if (trimmed.includes('&')) {
      const hParts = trimmed.split('&');
      brideName = hParts[0].trim();
      groomName = hParts[1]?.trim() || '';
      title = `${brideName} & ${groomName} Düğünü`;
    } else {
      const hParts = trimmed.split(' ');
      brideName = hParts[0] || 'Ev Sahibi';
      groomName = hParts.slice(1).join(' ') || '';
      title = `${trimmed} Etkinliği`;
    }
  } else if (parts.length >= 2) {
    brideName = capitalize(parts[0]);
    groomName = capitalize(parts[1]);
    title = `${brideName} & ${groomName} Düğünü`;
  } else if (parts.length === 1 && parts[0]) {
    brideName = capitalize(parts[0]);
    title = `${brideName} Etkinliği`;
  }

  // 30 days from now as sensible default event date
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  defaultDate.setHours(19, 0, 0, 0);

  return {
    id: `event-${cleanSlug}-${Date.now()}`,
    slug: cleanSlug,
    title,
    subtitle: 'Bu mutlu anımıza ortak olduğunuz için teşekkür ederiz. Masanızdaki QR kodu okutarak anılarınızı hemen paylaşabilirsiniz.',
    hosts: {
      brideOrPrimary: brideName,
      groomOrSecondary: groomName,
    },
    eventType: 'dugun',
    eventDate: defaultDate.toISOString(),
    coverPhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    invitationUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    theme: {
      primaryColor: '#C5A059',
      secondaryColor: '#EAD7BB',
      backgroundColor: '#FAF7F2',
      textColor: '#1A1817',
    },
    venue: {
      name: 'Etkinlik & Düğün Davet Salonu',
      address: 'Merkez Mah. No:1, İstanbul / Türkiye',
      mapUrl: 'https://maps.google.com/?q=Istanbul',
      lat: 41.0082,
      lng: 28.9784,
    },
    schedule: [
      {
        id: 'sch-1',
        time: '19:00',
        title: 'Karşılama Kokteyli',
        description: 'Canlı müzik ve ikramlar eşliğinde karşılama.',
        icon: 'glass-cocktail',
      },
      {
        id: 'sch-2',
        time: '20:00',
        title: 'Nikah Töreni & İlk Dans',
        description: 'Evlilik yemini ve ilk dans merasimi.',
        icon: 'ring',
      },
      {
        id: 'sch-3',
        time: '20:45',
        title: 'Akşam Yemeği & Müzik',
        description: 'Zengin kutlama menüsü ve müzik dinletisi.',
        icon: 'silverware-fork-knife',
      },
      {
        id: 'sch-4',
        time: '22:00',
        title: 'Kutlama Pastası Kesimi',
        description: 'Tebrikler ve pasta merasimi.',
        icon: 'cake-variant',
      },
      {
        id: 'sch-5',
        time: '23:00',
        title: 'Eğlence & After Party',
        description: 'Gece boyu sürecek müzik ve dans.',
        icon: 'music',
      },
    ],
    settings: {
      isPrivate: false,
      pinCode: '1923',
      enableCompression: true,
      allowGuestDownloads: true,
      isLiveFeedActive: true,
      allowGuestbook: true,
      autoApprovePhotos: true,
    },
    storage: {
      quotaBytes: 524288000, // 500 MB
      usedBytes: 0,          // Clean for new users
      photoCount: 0,         // Clean for new users
      tier: 'free',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  };
}

