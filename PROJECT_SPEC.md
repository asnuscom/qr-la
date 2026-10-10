# 🌐 QR-la (qr-la.com) — Çok Modüllü Mikro-SaaS Proje Spesifikasyonu, İş Modeli & Teknik Mimari Dokümanı

> **Proje Adı:** QR-la  
> **Resmi Alan Adı:** `qr-la.com`  
> **Slogan:** *"Uygulama İndirtmeden, Tek Bir Dinamik QR Kodla Hayatı Kolaylaştır, İletişime Geç & Kutla"*  
> **Platformlar:** Web (Mobil/Masaüstü Responsive Web App), PWA & Mobil Uygulama (React Native / Expo Router)  
> **Temel Altyapı:** React Native + Expo Router v4 + TypeScript + Google Cloud & Firebase (Firestore / Storage / Auth) + Vercel Edge Hosting  
> **Mimari Durumu:** 5 Modüllü Ekosistem + Smart Dispatcher + QR Studio + Online Ödeme + 5 Niş SEO Landing Sayfası Canlıda  

---

## 1. Proje Vizyonu ve Değer Önermesi

QR-la, geleneksel tek amaçlı QR üreticilerinin ve karmaşık mobil uygulamaların ötesine geçen; **fiziksel nesneleri (masa kartı, araç camı, tasma künyesi, kartvizit, restoran masası) sıfır sürtünmeyle dijital mikro deneyimlere bağlayan "Phygital" (Fiziksel + Dijital) bir Mikro-SaaS platformudur.**

### 1.1. Temel Felsefe: Sıfır İndirme Bariyeri (No-App Friction)
* Mobil uygulama mağazalarından uygulama indirme zorunluluğu, kullanıcıların %85'inin işlemi terk etmesine yol açar.
* QR-la'da son kullanıcı (düğün misafiri, park halindeki aracın sürücüsü, kayıp hayvanı bulan kişi, iş ortağı veya restoran müşterisi) telefon kamerasını QR koda tuttuğu anda **hiçbir şey yüklemeden, 1 saniyede doğrudan tarayıcı üzerinden** zengin arayüze erişir.

---

## 2. Platform Modülleri ve Çözülen Problemler

QR-la platformu 5 dikey niş modül etrafında organize edilmiştir:

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                 QR-la MERKEZİ PLATFORMU                 │
                     │                       (qr-la.com)                       │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
       ┌──────────────────┬───────────────────────┼───────────────────────┬──────────────────┐
       ▼                  ▼                       ▼                       ▼                  ▼
┌──────────────┐   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│  1. DÜĞÜN &  │   │  2. ARAÇ &   │        │ 3. PETGURU   │        │ 4. DİJİTAL   │   │  5. MENÜ &   │
│   ETKİNLİK   │   │  PARK TAGI   │        │ PATİ KÜNYESİ │        │  KARTVİZİT   │   │   RESTORAN   │
│ (`/dugun`)   │   │ (`/otomobil`)│        │  (`/pati`)   │        │ (`/kartvizit`)│  │  (`/menu`)   │
└──────────────┘   └──────────────┘        └──────────────┘        └──────────────┘   └──────────────┘
```

### 2.1. 💍 Düğün & Etkinlik Fotoğraf Galerisi (`/dugun` & `/[slug]`)
* **Problem:** Düğün, nişan ve kına gecelerinde misafirlerin çektiği en samimi fotoğraflar WhatsApp gruplarında kaybolur; kalitesi düşer; salonda interaktif bir eğlence yoktur.
* **Çözüm:** Masalardaki şık pleksi/karton QR kod ile misafirler anında fotoğraf yükler. Salondaki projeksiyon veya LED ekranda canlı slayt gösterisi döner. Gece sonunda ev sahibi tüm albümü tek tıkla tam kalitede ZIP olarak indirir. İsteğe bağlı 4 haneli PIN kodu ve dijital anı defteri sunulur.

### 2.2. 🚗 Akıllı Araç & Motosiklet Park Tagı (`/otomobil` & `/34abc123`)
* **Problem:** Ön cama telefon numarası yazmak; kadın sürücüler için taciz riski, dolandırıcıların spam listelerine düşme ve numara ifşası yaratır. Kağıtlar güneşte solar.
* **Çözüm:** Elektrostatik UV ön cam sticker'ı ile telefon numarası maskelenir. Karşı taraf tek tıkla *"Aracınızı çeker misiniz?"*, *"Farlar açık"*, *"Cam aralık"* gibi hazır şablonlarla WhatsApp'tan güvenle ulaşır. Kaza anı için hayati **Acil Kan Grubu** ve **Aile Yakını** rozeti içerir. BMW, Mercedes, Porsche, Honda gibi 20+ marka teması sunar.

### 2.3. 🐾 Petguru x QR-la Akıllı Pati Künyesi (`/pati` & `/p/[id]`)
* **Problem:** Geleneksel metal künyelerdeki numaralar zamanla sürtünmeyle silinir. Taşınma veya telefon değişiminde tasma çöp olur. Bulan kişinin veteriner mikroçipini okutması saatler sürer. GPS tasmalarının şarjı 2 günde biter.
* **Çözüm:** 30mm 316L cerrahi paslanmaz çelik lazer kazımalı su geçirmez künye. Şarjsız ve pilsiz ömür boyu çalışır. Bulan kişi kamerayı tuttuğu an tek tıkla **canlı GPS harita konumunu** sahibe iletir. Kaybolma anında panelden tek dokunuşla devreye giren **🚨 Kırmızı Kayıp Alarmı & Siren Modu** ve dijital aşı karnesi barındırır.

### 2.4. 💼 Dijital Kartvizit & NFC Akıllı Kart (`/kartvizit` & `/k/[slug]`)
* **Problem:** Kağıt kartvizitlerin %88'i ilk hafta çöpe gider. Telefon veya unvan değiştiğinde tüm kutular atılır. Karşı taraf bilgileri rehbere elle yazmakla uğraşmaz.
* **Çözüm:** Mat siyah lazer baskılı NTAG216 çipli temassız NFC akıllı kart. Telefonun arkasına dokundurulduğunda veya QR okutulduğunda **vCard 3.0** formatında tek dokunuşla tüm telefon rehberine kaydolur. IBAN kopyalama panosu, sosyal medya linkleri, portfolyo/PDF broşür bağlantıları ve 12+ lüks kurumsal tema sunar.

### 2.5. 🍽️ Restoran Menü QR & Masadan Garson Çağırma (`/menu` & `/m/[slug]`)
* **Problem:** Enflasyon nedeniyle sürekli artan menü baskı maliyeti, yıpranan/kirlenen sayfalar, garson çağırma karmaşası, sürekli Wi-Fi şifresi sorma ihtiyacı.
* **Çözüm:** Panelden saniyeler içinde canlı fiyat güncelleme ve "Tükendi" etiketi yönetimi. Masadan tek tıkla **"Garson Çağır"** ve **"Hesap İste (Nakit / Kredi Kartı)"** bildirimi. Misafiri şifresiz bağlayan **"Wi-Fi'a Bağlan"** butonu, alerjen & kalori etiketleri, çift dil (Türkçe/İngilizce) desteği ve ahşap/pleksi masa standı şablonu.

---

## 3. Akıllı Yönlendirme & Rota Mimarisi (Route Architecture)

Platform, Expo Router dosya tabanlı yönlendirme sistemi üzerinde çalışır ve aşağıdaki hiyerarşiyi uygular:

### 3.1. Rota Haritası

| Rota Yolu | Modül & Amaç | Açıklama |
| :--- | :--- | :--- |
| `/` | **Genel Vitrin (Hub)** | Tüm modüllerin tanıtımı, değer önerisi, modül sekmeleri ve canlı demolar. |
| `/dugun` | **Düğün SEO Landing** | Düğün modülüne özel zengin SEO pazarlama sayfası, paketler, SSS. |
| `/otomobil` | **Araç SEO Landing** | Akıllı araç tagı pazarlama sayfası, numara maskeleme karşılaştırması, UV sticker. |
| `/pati` | **Pati SEO Landing** | Petguru iş birliği akıllı künye sayfası, kayıp alarmı, GPS harita demosu. |
| `/kartvizit` | **Kartvizit SEO Landing** | vCard 3.0 ve NFC kart pazarlama sayfası, prestij temaları, IBAN panosu. |
| `/menu` | **Menü SEO Landing** | Restoran menü QR sayfası, garson çağırma, baskı maliyeti karşılaştırması. |
| `/[slug]` | **Smart Dispatcher** | Tek slug üzerinden varlık tipini (araç, pet, vcard, menü, düğün) otomatik tespit eden akıllı ekran. |
| `/[slug]/yukle` | Düğün Yükleme | Çoklu misafir fotoğrafı yükleyici (Web Worker / Canvas sıkıştırma). |
| `/[slug]/galeri` | Düğün Galeri | Grid görünüm, albüm filtreleme, Lightbox modalı. |
| `/[slug]/canli` | Düğün Projeksiyon | Salondaki ekrana yansıtılan tam ekran slayt ve tebrik pop-up'ı. |
| `/[slug]/ani-defteri` | Ziyaretçi Defteri | Misafirlerin tebrik ve iyi dilek mesajları. |
| `/p/[id]` | Petguru Ultra Kısa | Küçük metal tasma künyeleri için optimize edilmiş kısa link (`/p/duman`). |
| `/k/[slug]` | Kartvizit Kısa Rota | NFC kartlar için hızlı aktarım rotası (`/k/samet-sunman`). |
| `/m/[slug]` | Menü Masa Rotası | Masaya özel parametre destekli menü ekranı (`/m/lucca-bistrot?masa=7`). |
| `/panel` | Yönetim Merkezi | Tüm modüllerin durum kartları, kota göstergesi, hızlı aksiyonlar. |
| `/panel/varliklar` | Varlık Hub'ı | Kullanıcının tüm düğün, araç, pet, vcard ve menülerini listeleyen merkezi ekran. |
| `/panel/qr-studio` | **QR Tasarım Stüdyosu** | Vektörel SVG/PNG QR üretici, göz/nokta stilleri, gradyanlar, logolar, CTA etiketleri. |
| `/panel/tarifeler` | **Paketler & Ödeme** | Çok modüllü paket satın alma, 3D Secure kredi kartı modalı, faturalar. |
| `/panel/magaza` | **Phygital Mağaza** | Fiziksel UV sticker, çelik künye, ahşap stand ve NFC kart sipariş akışı. |
| `/panel/analitik` | **QR Analitik** | Tarama KPI'ları, 7 günlük trend grafiği, cihaz/OS oranları, canlı tarama akışı. |

---

## 4. Çekirdek Sistem Bileşenleri & Son Geliştirmeler

### 4.1. ✨ QR Kod Tasarım Stüdyosu (`src/modules/qr-studio/`)
* **Vektörel Render Motoru (`qrEngine.ts`):** `qrcode` matrisini Error Correction Level `H` (%30 hata payı) ile işleyen özel geometri motoru.
* **4 Nokta / Gövde Stili:** Klasik Kare, Yuvarlak Noktalar (Dots), Yumuşak Kare (Squircle), Elmas Kristal (Diamond).
* **Köşe Gözleri (Corner Eyes):** Dış çerçeve ve iç pupil için ayrı şekil konfigürasyonu.
* **Gradyan Renkler:** Çift tonlu yumuşak geçişler (Kehribar, Kraliyet Altını, Siber Mor, Zümrüt) ve açı kontrolleri.
* **Merkez Logo / İkon:** 6 dahili modül ikonu (👑, 💍, 🚗, 🐾, 💼, 🍽️) veya özel logo URL'si; güvenli beyaz arka plan rozeti.
* **CTA Çerçeveleri:** "BENİ TARA", "MENÜYÜ GÖRÜN", "REHBERE EKLE" alt rozet ve banner tasarımları.
* **HD Dışa Aktarma:** Kayıpsız SVG (`.svg`) indirme ve 2048x2048px Ultra HD PNG (`.png`) dönüştürücü.

### 4.2. 💳 Online Ödeme & e-Arşiv Fatura Sistemi (`src/services/paymentService.ts`)
* **3D Secure Kredi Kartı Modalı (`PaymentModal.tsx`):** Canlı kart önizlemesi, otomatik kart tipi tespiti (Visa, Mastercard, Troy), taksit seçici (Tek Çekim, 3, 6 Taksit).
* **SMS Doğrulama Simülasyonu:** 180 saniye geri sayımlı 6 haneli güvenlik onay ekranı.
* **Kupon İndirim Motoru:** `ASNUSVIP`, `ASNUSPREMIUM`, `YUZDE20`, `HOSGELDIN` vb. dinamik indirim hesaplaması.
* **Otomatik Kota & Paket Aktivasyonu:** Ödeme onaylandığında ilgili modülün kotası ve geçerlilik tarihi otomatik uzatılır.
* **e-Arşiv Fatura & Makbuz:** VUK standartlarında KDV matrah hesaplamalı yazdırılabilir fatura çıktısı (`window.print()`).

### 4.3. 📊 Dinamik Analitik & Ziyaretçi Motoru (`src/services/ecosystemService.ts`)
* **KPI Metrikleri:** Toplam Tarama, Benzersiz Ziyaretçi, Bugünün Taramaları, En Çok Taranan Varlık.
* **Görsel Grafikler:** 7 günlük tarama çubuk grafiği ve modül bazlı pasta dağılımı.
* **Teknoloji Dağılımı:** Kamera & Cihaz dağılım oranları (iOS %68, Android %28, Diğer %4).
* **Canlı Aktivite Akışı:** Konum, saat ve cihaz bilgisi içeren anlık okutma kayıtları.

### 4.4. 🌐 Niş Pazarlama Altyapısı (`MarketingNav` & `MarketingFooter`)
* **Dinamik Modül Seçici Barı:** Sayfanın en üstünde 5 modül hapı (`/dugun`, `/otomobil`, `/pati`, `/kartvizit`, `/menu`), aktif sayfa çerçeve vurgusu ve panel kısayolu.
* **Kapsamlı SEO Meta Etiketleri:** `expo-router/head` ile SSR/Statik derlemede Google botlarına hazır başlık, açıklama, anahtar kelime, OpenGraph ve Canonical URL sunumu.

---

## 5. Veri Modelleri & TypeScript Şemaları

```typescript
// 1. Düğün / Etkinlik Modeli
export interface EventModel {
  id: string;
  slug: string;
  title: string;
  eventType: 'dugun' | 'nisan' | 'kina' | 'dogumgunu' | 'diger';
  eventDate: string;
  hostUid: string;
  coverPhotoUrl: string;
  storage: {
    quotaBytes: number;
    usedBytes: number;
    photoCount: number;
    tier: 'free' | 'standart' | 'premium' | 'vip';
    expiresAt: string;
  };
}

// 2. Araç & Park Tagı Modeli
export interface VehicleData {
  id: string;
  slug: string; // "34abc123"
  userId: string;
  plateNumber: string; // "34 ABC 123"
  ownerName: string;
  ownerPhone: string;
  bloodType: string; // "A Rh+"
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  brand: string;
  model: string;
  theme: string;
  privacyMode: boolean; // Numara maskeleme
  presetMessages: string[];
}

// 3. Petguru Pati Künyesi Modeli
export interface PetData {
  id: string;
  slug: string; // "duman"
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  microchipNumber?: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  vetClinicName: string;
  vetPhone: string;
  allergies: string[];
  lostInfo: {
    isLost: boolean;
    lostDate?: string;
    lostLocation?: string;
    rewardNote?: string;
  };
  vaccines: Array<{
    name: string;
    validUntil: string;
    isUpToDate: boolean;
  }>;
}

// 4. Dijital Kartvizit Modeli
export interface VCardData {
  id: string;
  slug: string; // "samet-sunman"
  userId: string;
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  theme: string;
  socials: Record<string, string>;
  bankAccounts: Array<{
    bankName: string;
    iban: string;
    accountHolder: string;
  }>;
  portfolioLinks: Array<{
    title: string;
    url: string;
  }>;
}

// 5. Restoran Menü Modeli
export interface RestaurantData {
  id: string;
  slug: string; // "lucca-bistrot"
  userId: string;
  name: string;
  cuisine: string;
  tableCount: number;
  wifiSsid?: string;
  wifiPassword?: string;
  enableWaiterCall: boolean;
  enableBillRequest: boolean;
  categories: Array<{ id: string; name: string; order: number }>;
  items: Array<{
    id: string;
    categoryId: string;
    name: string;
    price: number;
    allergens: string[];
    isAvailable: boolean;
  }>;
}
```

---

## 6. Güvenlik, Gizlilik ve KVKK Politikası

1. **Numara Maskeleme:** Araç sahiplerinin telefon numaraları kaynak kodda düz metin sunulmaz. WhatsApp API köprüsü ve güvenli arama protokolü kullanılır.
2. **Fotoğraf Gizliliği & PIN:** Düğün albümlerinde yabancıların fotoğrafları görmesini önleyen 4 haneli PIN şifreleme ve panelden anlık fotoğraf moderasyonu.
3. **Konum Gizliliği (Pati Künyesi):** Künye tarandığında konum yalnızca tarayan kişinin tarayıcı izin onayı vermesi halinde Google Haritalar linki olarak doğrudan sahibin WhatsApp hattına iletilir; halka açık paylaşılmaz.
4. **Ödeme Güvenliği:** Kredi kartı bilgileri asla sunucuda saklanmaz; 3D Secure 2.0 standardıyla banka SMS onayı üzerinden işlenir.
