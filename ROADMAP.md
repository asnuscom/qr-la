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
| 🐾 **Evcil Hayvan Künyesi** *(Gelecek)* | `pati.qr-la.com`<br>`qr-la.com/pati` | Kaybolan hayvanın tasmasındaki numaranın silinmesi | Metal lazer baskılı QR künye (199 ₺) | **Sadık & Duygusal Kitle** |

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

---

## 4. Teknik Altyapı Şeması

### 4.1. Veri Modeli (`src/types/modules.ts`)

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

// Araç Modülü Verisi
export interface VehicleData {
  plateNumber: string;         // "34 ABC 123"
  ownerPhone: string;          // "+90 541 577 91 66"
  privacyMode: boolean;        // true: numara gizli, WhatsApp proxy üzerinden iletilir
  presetMessages: string[];    // ["Aracınızı çeker misiniz?", "Farlar açık kaldı", "Alarm çalıyor"]
  brandModel?: string;         // "BMW 320i"
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

### Faz 1: Düğün & Etkinlik Modülü *(Tamamlandı - Canlıda)*
- [x] Misafir fotoğraf yükleme, akıllı sıkıştırma (10x compression).
- [x] Canlı projeksiyon modu ve gerçek zamanlı fotoğraf akışı.
- [x] Dijital anı defteri ve tebrik mesajları.
- [x] Masa kartı şablonu ve ZIP arşivi indirme.
- [x] Mobil kayma sorunlarının giderilmesi ve sayfa sekme başlıkları (SEO).
- [x] Vercel dinamik rewrite (`/[slug]/index.html`) düzeltmesi.

### Faz 2: Araç Camı / Park İletişim QR Modülü *(Sıradaki Faz)*
- [ ] `src/types/modules.ts` modül tiplerinin tanımlanması.
- [ ] `src/app/[slug]/index.tsx` sayfasına **Dispatcher** mimarisinin kurulması.
- [ ] Araç QR kamuya açık iletişim sayfasının yapılması:
  - Plaka rozeti ve araç bilgisi.
  - Numara gizleme koruması (WhatsApp şablonlu mesaj yönlendirmesi).
  - Hazır butonlar: *"Aracınızı Çeker misiniz?"*, *"Farlar Açık Kaldı"*, *"Alarm Çalıyor"*.
- [ ] Panelde *"Yeni Araç QR'ı Ekle / Düzenle"* ekranının hazırlanması.
- [ ] Araç ön camı için basılabilir şık QR sticker şablonu (PDF/PNG çıktısı).
- [ ] `otomobil.qr-la.com` tanıtım ve satış sayfası.

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
3. **Domain & SEO Yönetimi:**
   * Vercel üzerinde `*.qr-la.com` wildcard domain ayarı ile tüm alt alan adları tek bir merkezi projeye bağlanır, sunucu maliyeti artmaz.
