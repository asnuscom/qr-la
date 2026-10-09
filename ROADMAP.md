# QR-la: Çok Modüllü Genişleme Analizi ve Yol Haritası (ROADMAP)

Bu doküman, **QR-la** platformunun tek bir etkinlik fotoğraf toplama aracından çıkarak çok modüllü bir **"QR İletişim & Mikro-SaaS Ekosistemi"** haline getirilmesi için hazırlanan ürün analizi, teknik mimari ve uygulama yol haritasıdır.

---

## 1. Vizyon & Değer Önermesi

> **"Uygulama indirtmeden, tek bir dinamik QR kodla; düğünde anıları topla, araç camında numaranı gizleyerek iletişime geç, kartvizitini tek tıkla rehbere kaydettir, restoranda masadan menüyü aç."**

Platform, fiziksel dünyadaki etiket ve kartları (düğün masa kartı, araç cam sticker'ı, NFC kartvizit, masa menüsü) dijital mikro web uygulamalarına bağlar.

---

## 2. Modül & Pazar Analizi

```
                     ┌───────────────────────────────┐
                     │       QR-la PLATFORMU         │
                     │         (qr-la.com)           │
                     └──────────────┬────────────────┘
                                    │
       ┌──────────────┬─────────────┴─────────────┬──────────────┐
       ▼              ▼                           ▼              ▼
┌──────────────┐┌──────────────┐           ┌──────────────┐┌──────────────┐
│    DÜĞÜN     ││   OTOMOBİL   │           │  KARTVİZİT   ││     MENÜ     │
│   ETKİNLİK   ││  PARK CAMI   │           │  vCard & NFC ││ RESTORAN/KAFE│
│(dugun.qr-la) ││(otomobil.qr) │           │(kartvizit.qr)││ (menu.qr-la) │
└──────────────┘└──────────────┘           └──────────────┘└──────────────┘
```

| Modül | Subdomain / Tanıtım | Çözülen Problem | Gelir Modeli | Viral Potansiyeli |
| :--- | :--- | :--- | :--- | :--- |
| 💍 **Düğün & Etkinlik** *(Canlıda)* | `dugun.qr-la.com`<br>`qr-la.com/dugun` | Düğünde misafir fotoğraflarının kaybolması, salon slayt ekranı | Etkinlik paketi satışı (990 ₺ - 2.490 ₺) | **Çok Yüksek** (1 düğünde 300+ kişi kodu tarar) |
| 🚗 **Araç Camı / Park QR** *(Sıradaki)* | `otomobil.qr-la.com`<br>`qr-la.com/otomobil` | Park halinde numara ifşası, taciz/güvenlik riski, kağıt bırakma karmaşası | Fiziksel sticker baskı paketi (149 ₺ - 299 ₺) + yıllık koruma | **Aşırı Yüksek** (Camdaki QR'ı gören diğer sürücüler tarar) |
| 💼 **Dijital Kartvizit (vCard)** | `kartvizit.qr-la.com`<br>`qr-la.com/kartvizit` | Kağıt kartvizitlerin atılması, anlık güncellenememesi | Fiziksel NFC kart (349 ₺ - 599 ₺) + kurumsal toplu abonelik | **Yüksek** (Her toplantıda müşteriye taratılır) |
| 🍽️ **Restoran Menü QR** | `menu.qr-la.com`<br>`qr-la.com/menu` | Kağıt menü baskı maliyeti, anlık fiyat güncelleyememe | Restoranlara aylık/yıllık SaaS aboneliği (299 ₺ - 799 ₺/ay) | **Orta-Yüksek** (Müdavimler ve turistler) |
| 🐾 **Evcil Hayvan Künyesi** *(Petguru)* | `petguru.com.tr`<br>`qr-la.com/p` | Kaybolan hayvanın tasmasındaki numaranın silinmesi, anlık GPS konumu bildirme | Metal lazer baskılı QR künye (199 ₺) | **Sadık & Duygusal Kitle** |

---

## 2.1. "Phygital" Gelir Modeli (Dijital Freemium + Fiziksel Baskı & Premium Paket)

Kullanıcılar yalnızca ekrandaki bir QR görseli için ödeme yaparken tereddüt edebilir; ancak ellerine dokunabildikleri kaliteli bir **fiziksel ürün** (UV cam sticker'ı, lazer paslanmaz çelik künye, altın pleksi masa standı, NFC kart) aldıklarında algılanan değer 10 katına çıkar.

Bu nedenle ana gelir stratejimiz: **"Sadece QR Üretimi Ücretsiz / Giriş Seviyesi — Fiziksel Baskı Alanlara Premium Dijital Özellikler Hediye / Kilitsiz!"**

```
┌─────────────────────────────────┐          ┌───────────────────────────────────┐
│     1. SADECE QR ÜRETENLER      │          │     2. FİZİKSEL BASKI ALANLAR     │
│       (Ücretsiz / Kanca)        │          │    (Yüksek Marjlı Ciro Motoru)    │
├─────────────────────────────────┤          ├───────────────────────────────────┤
│ • Kendi yazıcısından basit PDF  │          │ • Profesyonel Matbaa / Lazer Ürün │
│ • Temel kotalar & standart tema │   ──►    │ • 🎁 TÜM PREMİUM DİJİTAL GÜÇLER   │
│ • Sıfır CAC ile viral kullanıcı │          │ • %70 - %85 Net Kâr Marjı         │
└─────────────────────────────────┘          └───────────────────────────────────┘
```

### Modül Bazlı Phygital Değer Teklifi:

| Modül | Sadece QR (Ücretsiz / Temel) | Fiziksel Baskı Alanlara Açılan Premium Özellikler | Birim Maliyet & Kâr Marjı |
| :--- | :--- | :--- | :--- |
| **💍 Düğün & Etkinlik** | • 500 MB kota<br>• Basit PDF masa kartı<br>• Projeksiyon kapalı | • **Özel Altın Yaldızlı / Pleksi Masa Standları** (Adrese kargo)<br>• 🎁 **Canlı Projeksiyon & Slayt Modu Açılır**<br>• 🎁 **5 GB - 15 GB Bulut Depolama Kotası**<br>• 🎁 Ziyaretçi Defteri & PIN Kodu koruması<br>• 🎁 Tek tıkla orijinal kalitede ZIP arşivi indirme | Satış: **1.490 ₺ - 3.990 ₺**<br>Baskı+Kargo: ~180 ₺<br>**Net Kâr: %85+** |
| **🚗 Araç & Motosiklet** | • Standart QR görseli<br>• Doğrudan numara gösterme<br>• Temel tema | • **Güneşte Solmayan UV Korumalı Ön Cam Sticker'ı** (veya kask/gidon metal plaketi)<br>• 🎁 **Gizli Numara Maskeleme** (Numara gizlenir, WhatsApp proxy üzerinden)<br>• 🎁 **20+ Marka Renk Teması** (Honda, Yamaha, BMW vb.)<br>• 🎁 **SMS & WhatsApp Anlık Park Bildirimi**<br>• 🎁 Kan Grubu & Acil Durum tek tıkla arama rozeti | Satış: **199 ₺ - 299 ₺**<br>Baskı+Kargo: ~60 ₺<br>**Net Kâr: %75 - %80** |
| **🐾 Petguru (Pati)** | • Temel profil linki<br>• Standart arama butonu | • **Lazer Kazımalı Paslanmaz Çelik QR Tasma Künyesi**<br>• 🎁 **Anlık GPS Konumu Bildirimi** (Taranınca sahibe harita bildirimi)<br>• 🎁 **🚨 Tek Tıkla Acil Kayıp Hayvan Alarmı**<br>• 🎁 Dijital Aşı & Sağlık Karnesi kilidi | Satış: **299 ₺ - 449 ₺**<br>Lazer+Kargo: ~70 ₺<br>**Net Kâr: %80+** |
| **💼 Dijital Kartvizit** | • Temel vCard linki<br>• Standart rehbere kayıt | • **Kişiye Özel Lüks Baskılı NFC Akıllı Kartvizit**<br>• 🎁 Sınırsız profil güncelleme & analitik<br>• 🎁 Portfolyo, IBAN ve sosyal medya zengin kartları | Satış: **399 ₺ - 699 ₺**<br>NFC+Kargo: ~80 ₺<br>**Net Kâr: %80+** |

> **Not:** Kargo istemeyen veya yurtdışından kullanan müşteriler için *"Yalnızca Dijital Premium"* paket satın alma seçeneği her zaman aktif kalır.

---

## 3. Mimari ve Yönlendirme Stratejisi

### 3.1. Subdomain vs Kısa Link (Hibrit Yaklaşım)

1. **Pazarlama / Satış (Subdomain):**
   * Reklamlarda ve sosyal medyada ilgili kitleye özel izole alan adları kullanılır:
     * `otomobil.qr-la.com` -> Araç sahipleri için reklam ve sticker satın alma sayfası.
     * `dugun.qr-la.com` -> Evlenecek çiftler için paket satın alma sayfası.
     * `kartvizit.qr-la.com` -> Profesyoneller için NFC kart sipariş sayfası.

2. **Fiziksel QR Kod Taraması (Kısa Link):**
   * Basılan tüm fiziksel QR kodlar **ana domain üzerinden kısa link** olarak çalışır:
     * `qr-la.com/sule-samet` (Düğün)
     * `qr-la.com/34abc123` (Araç)
     * `qr-la.com/samet-sunman` (Kartvizit)
   * **Neden?** URL ne kadar kısa olursa, QR kod o kadar az pikselli basılır ve her telefon kamerasından (özellikle araç camında veya loş ışıkta) 1 saniyede hatasız okunur.

### 3.2. Akıllı Slug Stratejisi & Çakışma Önleme (1.000+ ve 100.000+ Kullanıcı Ölçeği)

Kullanıcı sayısı arttıkça aynı isimlerin çakışmasını önleyen modül bazlı kimlik kuralları:

1. **🚗 Araç & Motosiklet (Doğal Tekillik: PLAKA):**
   * **Kişiye Özel:** `qr-la.com/34abc123` (Plaka devlette tekildir, çakışma riski %0).
   * **Seri Matbaa Sticker'ı:** 5 haneli Base62 Nano-ID: `qr-la.com/t/x7k9p`. Kullanıcı satın alıp plakasıyla eşleştirdiğinde hem nano-id hem plaka aynı araca çıkar.

2. **💼 Dijital Kartvizit (Handle / Meslek Modeli):**
   * İlk gelen alır: `qr-la.com/ali-yilmaz`.
   * İsim doluysa sistem meslek, şirket veya şehir önerir:
     * `qr-la.com/avukat-ali-yilmaz`
     * `qr-la.com/asnus-ali`
     * `qr-la.com/aliyilmaz34`

3. **💍 Düğün & Etkinlik (Misafir Elle Yazmaz, QR Okutur):**
   * İlk çift: `qr-la.com/ahmet-ve-ayse`.
   * İkinci çift: Yıl (`ahmet-ve-ayse-2026`), şehir (`ahmet-ve-ayse-izmir`) veya otomatik 3 haneli kısa ek (`ahmet-ve-ayse-k7x`). Misafir QR kamerayla okuttuğu için ek harfler kullanıcı deneyimini bozmaz.

4. **🐾 Evcil Hayvan / Pati Künyesi (Petguru Nano-ID Modeli):**
   * İsimler ("Pamuk", "Duman") tekrarlayacağı için tasmaya isim değil **4 haneli Base62 Nano-ID** basılır: `qr-la.com/p/8x4b`.
   * **Matematiksel Kapasite:** 62⁴ = **14.776.336 (14.7 Milyon)** çakışmasız metal künye basılabilir.

```typescript
// Otomatik Akıllı Slug Üretim Algoritması
export async function generateSmartSlug(type: QRModuleType, input: string): Promise<string> {
  if (type === 'vehicle') return cleanPlate(input); // "34 ABC 123" -> "34abc123"
  if (type === 'pet') return generateNanoId(4);     // "k9x2"
  
  let slug = slugify(input);
  if (await isSlugTaken(slug)) slug = `${slug}-${new Date().getFullYear()}`;
  if (await isSlugTaken(slug)) slug = `${slug}-${generateNanoId(3)}`;
  return slug;
}
```

---

## 4. Teknik Altyapı Şeması

### 4.1. Veritabanı Mimarisi (Cloud Firestore)

Merkezi **`slugs/{slug}` (Slug Registry)** tablosu ile tek sorguda ışık hızında yönlendirme sağlanır:

```
                        ┌──────────────────────────────┐
                        │    Firestore: `slugs/{slug}` │ (Tek Noktadan 10ms Yönlendirme)
                        └──────────────┬───────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ `events/{id}`    │          │ `vehicles/{id}`  │          │ `pets/{id}`      │
│ (Düğün/Etkinlik) │          │ (Araç & Tagler)  │          │ (Petguru Ortak)  │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

```typescript
// Merkezi Registry Belgesi (slugs/{slug})
export interface SlugRegistryItem {
  slug: string;                 // "samet-ve-sule" veya "34abc123" veya "p/8x4b"
  moduleType: QRModuleType;     // 'event' | 'vehicle' | 'pet' | 'vcard'
  targetId: string;             // İlgili modül tablosundaki asıl belge ID'si
  ownerUid: string;             // Sahip kullanıcı
  isClaimed: boolean;           // Fiziksel sticker sahiplenildi mi?
  createdAt: string;
  stats: {
    totalScans: number;
    lastScannedAt: string;
  };
}
```

### 4.2. Klasör Mimarisi (`src/` Modüler Organizasyon)

```text
src/
├── app/                          # 🌐 EXPO ROUTER (Sadece Sayfa ve Rotalar)
│   ├── index.tsx                 # Ana Vitrin / Landing Page
│   ├── [slug]/                   # 🚦 SMART DISPATCHER (Akıllı Yönlendirici)
│   │   ├── index.tsx             # Gelen kaydın tipine göre ilgili modülü basar
│   │   ├── yukle.tsx             # (Etkinlik) Fotoğraf yükleme
│   │   ├── galeri.tsx            # (Etkinlik) Galeri
│   │   ├── canli.tsx             # (Etkinlik) Canlı projeksiyon
│   │   └── ani-defteri.tsx       # (Etkinlik) Anı defteri
│   ├── panel/                    # 🎛️ MERKEZİ KONTROL PANELİ
│   │   ├── index.tsx             # Dashboard (Etkinliklerim, Araçlarım sekmeleri)
│   │   ├── arac/                 # 🚗 Araç ekleme / düzenleme ekranı
│   │   └── tarifeler.tsx         # Depolama & paket yükseltme
│   └── (auth)/                   # Giriş, kayıt ekranları
│
├── modules/                      # 📦 İZOLE MODÜL ÇEKİRDEKLERİ (İş Mantığı & UI)
│   ├── events/                   # 💍 Düğün & Etkinlik Modülü (Bileşenler & Servisler)
│   ├── vehicle/                  # 🚗 Araç & Tag Modülü (themes.ts, TagDisplay, ClaimModal)
│   ├── pet/                      # 🐾 Petguru Modülü (PetIdCard, GPS Logger)
│   └── vcard/                    # 💼 Dijital Kartvizit Modülü (VCardProfile, vcfGenerator)
│
├── components/                   # 🧱 Ortak UI Bileşenleri (Navbar, Button, Modal, SEO Head)
├── services/                     # ⚙️ Çekirdek Servisler (authService, firebase, dispatcherService)
└── types/                        # 🏷️ TypeScript Tipleri (modules.ts, user.ts, event.ts)
```

### 4.3. Veri Modeli (`src/types/modules.ts`)

```typescript
export type QRModuleType = 'event' | 'vehicle' | 'vcard' | 'menu';

// Ortak Çekirdek Alanlar
export interface BaseQRItem {
  id: string;
  slug: string;             // Benzersiz kısa URL
  userId: string;           // Sahip hesabı
  moduleType: QRModuleType; // Modül tipi
  title: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

// Araç & Motosiklet Tag Modülü Verisi (Kaynak: D:\Projects\Git\tag)
export interface VehicleData {
  plateNumber: string;         // "34 ABC 123"
  ownerName: string;           // Sürücü Adı
  ownerPhone: string;          // "+90 541 577 91 66"
  ownerEmail?: string;
  instagram?: string;          // "@surucu_kullanici"
  bloodType?: string;          // Hayati Acil Durum Bilgisi: "A RH +"
  emergencyContact?: {         // Kaza / Acil Durumda Aranacak Kişi
    name: string;
    phone: string;
  };
  brand: string;               // "honda", "yamaha", "husqvarna", "bmw", "ktm", "ducati", vb.
  model: string;               // "CBR 650R", "320i", vb.
  theme: string;               // 20+ marka özel renk gradyanı
  privacyMode: boolean;        // true: numara gizli, WhatsApp proxy/şablon üzerinden
  presetMessages: string[];    // ["Aracınızı çeker misiniz?", "Farlar açık kaldı", "Alarm çalıyor"]
  note?: string;               // Özel park notu ("Girişi kapattıysam lütfen arayın")
  isClaimed?: boolean;         // Fiziksel sticker sahiplenildi mi?
  uniqueUrl?: string;          // Önceden basılmış etiket kodu
}

// Kartvizit Modülü Verisi
export interface VCardData {
  fullName: string;
  jobTitle: string;
  company: string;
  avatarUrl: string;
  phone: string;
  email: string;
  socials: Record<string, string>; // instagram, linkedin, github
}

// Menü Modülü Verisi
export interface MenuData {
  restaurantName: string;
  currency: string;
  categories: {
    id: string;
    name: string;
    items: { name: string; desc: string; price: number; photoUrl?: string }[];
  }[];
}
```

### 4.2. Akıllı Yönlendirici (Smart Dispatcher - `src/app/[slug]/index.tsx`)

`[slug]` sayfası gelen kaydın `moduleType` bilgisine göre ilgili arayüzü ekrana getirir:

```tsx
export default function DynamicQRDispatcher() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [qrItem, setQrItem] = useState<BaseQRItem | null>(null);

  switch (qrItem?.moduleType) {
    case 'vehicle':
      return <VehicleContactScreen data={qrItem} />;
    case 'vcard':
      return <VCardProfileScreen data={qrItem} />;
    case 'menu':
      return <RestaurantMenuScreen data={qrItem} />;
    case 'event':
    default:
      return <EventHomeScreen event={qrItem} />;
  }
}
```

---

## 5. Uygulama Yol Haritası (5 Fazlı Plan)

```
[Faz 1: Düğün / Etkinlik]  ──►  [Faz 2: Araç Camı / Park QR]  ──►  [Faz 3: Dijital Kartvizit]  ──►  [Faz 4: Restoran Menü]  ──►  [Faz 5: Ekosistem]
     (Tamamlandı & Canlı)                (Sıradaki Adım)                    (2. Ay)                    (3. Ay)                    (4. Ay+)
```

### Faz 1: Düğün & Etkinlik Modülü *(Tamamlandı & Cilalanıyor - Canlıda)*
- [x] Misafir fotoğraf yükleme, akıllı sıkıştırma (10x compression).
- [x] Canlı projeksiyon modu ve gerçek zamanlı fotoğraf akışı.
- [x] Dijital anı defteri ve tebrik mesajları.
- [x] Masa kartı şablonu ve ZIP arşivi indirme.
- [x] Mobil kayma sorunlarının giderilmesi ve sayfa sekme başlıkları (SEO).
- [x] Vercel dinamik rewrite (`/[slug]/index.html`) düzeltmesi.
- [ ] **Statik SEO & Meta Sabitleme (`expo-router/head`):** Build esnasında `<head>` içerisine statik Meta Description, Anahtar Kelimeler ve OpenGraph (OG) sosyal medya paylaşım kartlarının sabitlenmesi.
- [ ] **Arama Motoru Rehberi:** Google için `public/robots.txt` ve `public/sitemap.xml` oluşturulması (Ana sayfa ve tanıtım sayfalarını indeksletip, gizlilik gereği `/[slug]` misafir albümlerini `noindex`/disallow ile arama motorlarından koruma).

### Faz 2: Araç & Motosiklet Tag / Park İletişim Modülü *(Sıradaki Faz)*

> **📦 Mevcut Hazır Proje Kaynağı:** `D:\Projects\Git\tag` (Asnus Dynamic Tag System)  
> **Teknoloji:** Next.js 15, Tailwind CSS, TypeScript, Firebase (Auth + Firestore/RTDB)

Bu faz için sıfırdan geliştirmek yerine `D:\Projects\Git\tag` projesindeki hazır ve olgunlaşmış altyapı **QR-la** ekosistemine taşınabilir / entegre edilebilir:

#### 🎯 Taşınacak / Entegre Edilecek Hazır Modüller:
1. **20+ Marka Renk Teması (`D:\Projects\Git\tag\src\config\themes.ts`):**
   - Honda, Yamaha, Husqvarna, KTM, BMW, Ducati, Triumph, Kawasaki, Harley-Davidson, Aprilia, Suzuki vb. için hazır gradyanlar ve renk paletleri.
2. **Hayati Acil Durum & Kaza Kartı (`D:\Projects\Git\tag\src\components\TagDisplay.tsx`):**
   - **Kan Grubu** rozeti (ilk yardım ekipleri için kritik).
   - **Acil Durum Kişisi ve Telefonu** (kaza anında tek dokunuşla acil kişiyi arama).
3. **Sürücü & Araç Bilgileri:**
   - Plaka, marka, model, sürücü telefonu, e-posta, Instagram bağlantısı ve sürücü özel notu (*"Girişi kapattıysam lütfen arayın"* vb.).
4. **"Unclaimed (Sahipsiz) Etiket Sahiplenme" Akışı (`D:\Projects\Git\tag\src\components\TagClaimForm.tsx`):**
   - Önceden matbaada bastırılan fiziksel QR sticker'lar satıldığında, müşteri kodu taratır taratmaz etiket sahipsizse anında kendi aracına bağlayıp kişiselleştirebilir.
5. **Dahili QR Kart Oluşturucu (`D:\Projects\Git\tag\src\components\QRCardGenerator.tsx`):**
   - HTML5 Canvas tabanlı, gölgeli ve şık fiziksel QR sticker/baskı çıktısı.
6. **Admin & Kota Yönetimi (`D:\Projects\Git\tag\src\app\admin`):**
   - Sahipsiz etiket havuzu yönetimi (`/admin/unclaimed`), kullanıcı kota yönetimi (`maxTags: 1` standart vs sınırsız premium).

#### 🛠️ QR-la Uygulama Adımları:
- [ ] `src/types/modules.ts` içinde `VehicleData` / `Tag` tiplerinin projeye aktarılması.
- [ ] `src/app/[slug]/index.tsx` akıllı yönlendiricisine (Smart Dispatcher) araç modülü `TagDisplay` ekranının bağlanması.
- [ ] QR-la ev sahibi paneline *"Yeni Araç/Motosiklet Tag'i Ekle / Düzenle"* sekmesinin entegre edilmesi.
- [ ] `otomobil.qr-la.com` veya `tag.qr-la.com` tanıtım & sipariş sayfalarının kurgulanması.

---

### 🐾 Özel Entegrasyon: Petguru x QR-la (Evcil Hayvan Akıllı Künyesi & Kayıp Takibi)

> **🌐 Canlı Platform:** [`petguru.com.tr`](https://petguru.com.tr)  
> **📦 Mevcut Proje Kaynağı:** `D:\Projects\petguru-app` (Turborepo Monorepo: `apps/next/app/qr`, `@my/firebase/services/pets.ts`, `@my/types/pet.ts`)  
> **Strateji:** Kodu taşımak yerine **"Ortak Firebase Veritabanı + QR-la Ultra Kısa Link Çözümleyicisi (Resolver)"** hibrit modelini kullanmak.

#### 💡 Neden Ortak Çalışma Çok Güçlü?
1. **Fiziksel Metal Künyede Maksimum Taranabilirlik (Ultra-Short URL):**
   - Metal lazer baskılı küçük tasma künyelerine uzun link basıldığında QR pikselleri aşırı yoğunlaşır ve loş ışıkta veya hareketli hayvanda kamera okuyamaz.
   - `qr-la.com/p/[id]` gibi 15 karakterlik ultra kısa link basıldığında QR kod iri pikselli, yüksek kontrastlı ve 1 saniyede hatasız okunabilir olur.
2. **Kayıp Bildirimi & GPS Konum Bildirimi:**
   - Künye tarandığı anda `petsService.recordQrScan(id, ...)` arka planda çalışarak tarayan kişinin konumunu/cihazını kaydeder ve evcil hayvan sahibine anında push bildirim atar (*"Dostunuzun künyesi Moda/Kadıköy civarında tarandı!"*).
3. **Akıllı Çoklu Yönlendirme (`petguru-app` Rota Eşleşmesi):**
   - `qr-la.com/p/[id]` ──► Künye & Sağlık Kartı (Aşılar, alerjiler, sahip telefonu)
   - `qr-la.com/p/[id]/k` ──► 🚨 Kayıp Hayvan Acil Durum Sayfası & Ödül İlanı (`/kayip-hayvanlar/[id]`)
   - `qr-la.com/p/[id]/s` ──► Sahiplendirme Profili (`/hayvan-sahiplenme/[id]`)
   - `qr-la.com/p/[id]/e` ──► Eşleştirme Profili (`/hayvan-eslestirme/[id]`)
4. **Sahipsiz Künye Sahiplenme (Unclaimed Tag Claiming):**
   - Henüz bir hayvana bağlanmamış hazır metal künyeler satıldığında, ilk taramada `petguru-app`'in `/claim` akışı tetiklenir ve kullanıcı kendi hayvanını seçerek künyeyi anında eşleştirir.
5. **İki Projenin Çapraz Viral Sinerjisi:**
   - QR-la etkinlik kullanıcıları evcil hayvanları için künye siparişi verebilir; Petguru kullanıcıları ise düğün ve araç QR modüllerine kolayca erişebilir.

### Faz 3: Dijital Kartvizit (vCard & NFC) Modülü *(2. Ay)*
- [ ] Profil arayüzü (Fotoğraf, unvan, şirket, sosyal medya linkleri, banka/IBAN).
- [ ] `.vcf` dosyası oluşturup tek dokunuşla telefon rehberine kaydettirme altyapısı.
- [ ] Panelde dijital kartvizit düzenleme editörü ve renk temaları.
- [ ] Fiziksel NFC kartvizit baskı hazırlığı ve paketleme kurgusu.

### Faz 4: Restoran & Kafe Menü QR Modülü *(3. Ay)*
- [ ] Kategori ve ürün yönetimi (Fiyat, görsel, açıklama, alerjen etiketleri).
- [ ] Misafir menü arayüzü (Kategori sekmeleri, hızlı arama, mobil uyumlu).
- [ ] Çoklu dil (Türkçe, İngilizce, Rusça, Arapça) desteği.
- [ ] Restoranlar için aylık/yıllık abonelik modeli.

### Faz 5: QR-la Suite & Merkezi Ekosistem *(4. Ay+)*
- [ ] Ortak kullanıcı paneli: Tek üyelikle hem düğününü, hem aracını, hem kartvizitini yönetebilme.
- [ ] Dinamik QR Analitiği: Hangi QR ne zaman, kaç kere okundu grafikleri.
- [ ] Fiziksel sticker ve NFC kart için e-ticaret & kargo sipariş entegrasyonu.

---

## 6. Güvenlik, Gizlilik ve Risk Önlemleri

1. **Numara Gizliliği (Araç Modülü):**
   * Araç sahibinin telefon numarası açık metin olarak kaynak kodda veya ekranda sunulmaz.
   * Mesajlar doğrudan WhatsApp API (`wa.me/?text=...`) üzerinden şablon mesajlarla tetiklenir veya isteğe bağlı geçici numara maskeleme kullanılır.
2. **Kötüye Kullanım / Spam Engeli:**
   * Araç sahibine aynı IP üzerinden art arda spam mesaj atılmasını engelleyen rate-limit (süre kısıtlaması) mekanizması kurulur.
3. **Domain & Subdomain Yönetimi:**
   * Vercel üzerinde `*.qr-la.com` wildcard domain ayarı ile tüm alt alan adları tek bir merkezi projeye bağlanır, sunucu maliyeti artmaz.
4. **Statik SEO & OpenGraph Mimarisi (`expo-router/head`):**
   * `src/app/index.tsx` içinde `expo-router/head` kullanılarak `npm run build:web` sırasında saf HTML içerisine `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:image">` ve Canonical URL sabitlenir. Google botları ve sosyal medya tarayıcıları JavaScript çalıştırmadan doğrudan okur.
5. **Arama Motoru Gizlilik Kuralları (`robots.txt` & `sitemap.xml`):**
   * `robots.txt`: Ana sayfa (`/`), tanıtım sayfaları ve genel modüller taranmaya açık (`Allow: /`); ancak ev sahiplerinin kişisel misafir fotoğraf albümleri (`Disallow: /*/galeri`, `Disallow: /*/yukle`, `Disallow: /panel`) Google dizinine kapatılır.
   * `sitemap.xml`: Sadece genel vitrin ve pazarlama sayfaları listelenir.
