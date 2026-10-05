# 📸 QR-la (qr-la.com) — Kapsamlı Proje Spesifikasyonu, İş Modeli & Teknik Mimari Dokümanı

> **Proje Adı:** QR-la  
> **Resmi Alan Adı:** `qr-la.com`  
> **Slogan:** *"Masadaki Kodu QR'la, En Mutlu Anları Paylaş & Kutla"*  
> **Platformlar:** Web (Mobil/Masaüstü Uyumlu) & Mobil (iOS / Android)  
> **Temel Altyapı:** React Native (Expo Router) + Google Cloud & Firebase  

---

## 1. Proje Vizyonu ve Çözülen Problem

### 1.1. Mevcut Problem
* Düğün, nişan, kına ve doğum günü gibi etkinliklerde misafirler yüzlerce güzel ve doğal anı fotoğrafı çeker; ancak bu fotoğraflar asla gelin-damada veya ev sahibine ulaşmaz.
* WhatsApp gruplarına atılan fotoğraflar kaybolur, kalitesi ciddi şekilde düşer ve gruplarda karmaşa yaratır.
* Misafirlere "Uygulama indirin" dendiğinde indirme bariyeri nedeniyle katılım oranı %10'lara kadar düşer.

### 1.2. QR-la Çözümü
* Masalara konulan şık **QR Masa Kartı** sayesinde misafir telefonunun kamerasını tuttuğu an **uygulama indirmeden, saniyeler içinde** `qr-la.com/yavuz-ve-merve` sayfasına girer.
* Sayfa üzerinden:
  1. **Toplu Fotoğraf Yükler** (istemcide otomatik sıkıştırılır, 10-20 fotoğraf tek tıkla yüklenir).
  2. **Ziyaretçi Defteri**ne çifte özel tebrik ve iyi dilek notu bırakır.
  3. **Etkinlik Programı**nı (Nikah, İlk Dans, Pasta Kesimi) ve **Mekan Konumu**nu canlı görür.
  4. Salondaki projeksiyona bağlı **Canlı Slayt Ekranı**nda yüklediği fotoğraf anında dev ekranda görünür!

---

## 2. Kullanıcı Rolleri & Detaylı Kullanıcı Hikayeleri (User Personas)

### 2.1. Misafir (Guest)
* **Kayıtsız Giriş:** Üye olma formu doldurmaz. Firebase Anonymous Auth arka planda çalışır.
* **Akıllı Sıkıştırma (Data & Hız Tasarrufu):** 10 MB'lık fotoğraf cihazda saniyesinde optimize edilir (~650 KB). Yükleme anında biter. İsteyen misafir ayarlardan "Orijinal Kalitede Yükle"yi seçebilir.
* **Masa Numarası:** Misafir yüklerken dilerse "Masa 7" veya "Gelin Tarafı" gibi etiketler seçebilir.

### 2.2. Etkinlik Sahibi (Host)
* Etkinliği dakikalar içinde oluşturur (`slug`: `elif-ve-burak`, `yavuzundugunu` vb.).
* Kişiselleştirme: Kapak fotoğrafı, tema rengi, dijital davetiye, akış saatleri.
* **Yazdırılabilir QR Masa Kartı:** İndirip matbaadan veya evdeki yazıcıdan bastırabileceği şık masa kartı şablonu (A6/A5).
* **Tüm Arşivi Tek Tıkla İndirme:** Etkinlik sonrasında tüm misafirlerin çektiği fotoğrafları tek parça ZIP dosyası halinde indirir.

### 2.3. Süper Admin
* Platform geneli kullanıcılar, aktif etkinlikler, toplam depolama tüketimi.
* Paket satışları ve gelir metrikleri.
* Şikayet edilen uygunsuz içeriklerin moderasyonu.

---

## 3. Sayfa & Rota Hiyerarşisi (Route Architecture)

| Rota | İsim | Açıklama & İçerik |
| :--- | :--- | :--- |
| `/` | **Landing Page** | `qr-la.com` ana sayfası. Değer önerisi, interaktif demo etkinlik butonu, fiyatlandırma, "Etkinliğini Başlat" çağrısı. |
| `/[slug]` | **Etkinlik Hub'ı** | Geri sayım sayacı, çift isimleri, kapak görseli, dijital davetiye, mekan konumu (Google Haritalar), akış programı, hızlı menü butonları. |
| `/[slug]/yukle` | **Toplu Yükleme** | Çoklu fotoğraf seçici, ilerleme çubuğu, albüm seçimi (Gelin Alma, Nikah vb.), isim ve not girişi, sıkıştırma switch'i. |
| `/[slug]/galeri` | **Fotoğraf Galerisi** | Klasör/albüm filtreleme, grid görünüm, tam ekran lightbox (fotoğraf büyütme, indirme). |
| `/[slug]/ani-defteri` | **Ziyaretçi Defteri** | Misafirlerin tebrik kartları, mesaj bırakma formu, tarih ve isimle sıralı dilekler. |
| `/[slug]/canli` | **Canlı Projeksiyon** | Salondaki ekranda tam ekran dönen slayt. Yeni fotoğraf geldiğinde animasyonlu tebrik pop-up'ı, Ken Burns efekti, ekran uyumasını önleyici mod. |
| `/panel` | **Ev Sahibi Paneli** | Etkinlik ayarları, canlı depolama çubuğu (500 MB kotası), QR masa kartı PDF oluşturucu, ZIP indirme. |
| `/panel/tarifeler` | **Kota Yükseltme** | Ek 1 GB, 3 GB veya VIP depolama satın alma ekranı. |
| `/admin` | **Süper Admin** | Platform istatistikleri ve genel yönetim. |

---

## 4. İş Modeli, Depolama & Tarifeler (Monetization & Storage Tiers)

| Paket | Fiyat | Kota & Saklama | Özellikler |
| :--- | :--- | :--- | :--- |
| **Ücretsiz** | 0 TL | 500 MB (~500 Fotoğraf), 30 Gün Saklama | Temel QR Kart Şablonu, ZIP İndirme |
| **Standart** | 249 TL | 2 GB (~2500 Fotoğraf), 90 Gün Saklama | Özel QR Masa Kartı Tasarımları, ZIP İndirme |
| **Premium** | 499 TL | 5 GB (~6000 Fotoğraf), 180 Gün Saklama | Canlı Projeksiyon Modu, Şık QR Kartları, Öncelikli Destek |
| **VIP** | 899 TL | 15 GB, Orijinal Kalite İndirme, 1 Yıl Arşiv | Tüm Özellikler + WhatsApp Davet Entegrasyonu |

---

## 5. Güvenlik, Gizlilik & Moderasyon (Security & GDPR)

1. **Gizlilik Seçenekleri:**
   * **Herkese Açık (Public):** QR kodu taratan veya linki alan herkes girer.
   * **PIN Korumalı (Private):** Masadaki kartta QR'ın altında 4 haneli PIN kodu yer alır (Örn: `1923`). Sayfaya ilk girişte PIN sorulur.
2. **Misafir Güvenliği & KVKK:**
   * Fotoğraf yükleme butonunun altında açık rıza onayı.
3. **Fotoğraf Moderasyonu:**
   * Ev sahibi panelinde anında silme/gizleme ve misafirler için "Bildir" butonu.

---

## 6. Cloud Firestore & Storage Şema Mimarisi

```typescript
export interface EventModel {
  id: string;                     // "yavuz-ve-merve"
  slug: string;                   // "yavuz-ve-merve"
  title: string;                  // "Yavuz & Merve Düğünü"
  subtitle?: string;              // "En mutlu günümüzden kareler"
  eventType: 'dugun' | 'nisan' | 'kina' | 'dogumgunu' | 'diger';
  eventDate: string;              // ISO string: "2026-10-15T19:00:00.000Z"
  hostUid: string;
  coverPhotoUrl: string;
  invitationUrl?: string;
  theme: {
    primaryColor: string;         // "#E0A96D"
    backgroundColor: string;      // "#FAF8F5"
    fontFamily: string;
  };
  venue: {
    name: string;
    address: string;
    mapUrl: string;
  };
  schedule: Array<{
    id: string;
    time: string;
    title: string;
    description?: string;
  }>;
  settings: {
    isPrivate: boolean;
    pinCode?: string;
    enableCompression: boolean;
    allowGuestDownloads: boolean;
    isLiveFeedActive: boolean;
  };
  storage: {
    quotaBytes: number;           // 524288000 (500 MB)
    usedBytes: number;
    photoCount: number;
    tier: 'free' | 'standart' | 'premium' | 'vip';
    expiresAt: string;
  };
  createdAt: string;
}

export interface AlbumModel {
  id: string;
  name: string;
  order: number;
  photoCount: number;
  coverPhotoUrl?: string;
}

export interface PhotoModel {
  id: string;
  albumId?: string;
  originalUrl: string;
  thumbnailUrl: string;
  uploaderName?: string;
  guestNote?: string;
  sizeBytes: number;
  width: number;
  height: number;
  isApproved: boolean;
  createdAt: string;
}

export interface GuestbookEntryModel {
  id: string;
  authorName: string;
  relationship?: string;
  message: string;
  attachedPhotoUrl?: string;
  createdAt: string;
}
```

---

## 7. Uygulama Bileşen Ağacı

```
src/
├── app/
│   ├── _layout.tsx                     # Global tema ve yönlendirme
│   ├── index.tsx                       # qr-la.com Landing & Tanıtım sayfası
│   ├── [slug]/
│   │   ├── _layout.tsx                 # Etkinlik layout'u (Header, PIN Kontrolü)
│   │   ├── index.tsx                   # Etkinlik Ana Sayfası (Kapak, Davetiye, Akış)
│   │   ├── yukle.tsx                   # Toplu Fotoğraf Yükleme Ekranı
│   │   ├── galeri.tsx                  # Albümler ve Fotoğraf Grid'i
│   │   ├── ani-defteri.tsx             # Ziyaretçi Defteri & Tebrik Mesajları
│   │   └── canli.tsx                   # Projeksiyon / Canlı Slayt Gösterisi
│   └── panel/
│       ├── _layout.tsx                 # Yönetim paneli layout'u
│       ├── index.tsx                   # Ev Sahibi Kontrol Paneli (Kota, İndirme)
│       ├── qr-kart.tsx                 # Baskıya hazır QR Masa Kartı Şablonu
│       └── tarifeler.tsx               # Ek depolama paketleri
├── components/
│   ├── EventHeader.tsx                 # Geri sayım, kapak ve başlık
│   ├── ScheduleTimeline.tsx            # Etkinlik akış listesi
│   ├── PhotoUploader.tsx               # Sıkıştırmalı çoklu yükleme
│   ├── PhotoGrid.tsx                   # Albüm filtreli görsel ızgarası
│   ├── LightboxModal.tsx               # Tam ekran görsel önizleyici
│   ├── GuestbookList.tsx               # Dilek kartları listesi
│   ├── LiveProjector.tsx               # Canlı projeksiyon slayt ekranı
│   ├── StorageMeter.tsx                # 500 MB kota göstergesi
│   └── QRCardTemplate.tsx              # Yazdırılabilir masa kartı şablonu
├── services/
│   ├── firebase.ts                     # Firestore, Storage & Auth
│   ├── compression.ts                  # Çapraz platform görsel sıkıştırma
│   ├── eventService.ts                 # Etkinlik CRUD işlemleri
│   └── mockData.ts                     # Anında test için demo etkinlik verisi
└── types/
    └── index.ts                        # TypeScript tip tanımları
```
