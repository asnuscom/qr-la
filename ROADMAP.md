# 🗺️ QR-la: Çok Modüllü Genişleme ve Gelecek Yol Haritası (ROADMAP)

> **Mevcut Durum:** 5 Dikey Modül + Smart Dispatcher + QR Tasarım Stüdyosu + Online Ödeme + 5 Niş SEO Pazarlama Landing Sayfası Tamamlandı ve Canlıda.  
> **Yeni Hedef:** Üretim Seviyesinde Canlı Ödeme Altyapısı (Iyzico / PayTR), Gerçek Zamanlı Kargo Takibi, Restoran Kasa Terminali, B2B Kurumsal Takım Portalı ve PWA.

---

## 1. Tamamlanan Kilometre Taşları (Completed Milestones)

Aşağıdaki fazlar eksiksiz olarak tamamlanmış, test edilmiş ve canlı ekosisteme entegre edilmiştir:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          TAMAMLANAN FAZLARIN ÖZETİ (1 - 9)                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ✅ FAZ 1: Düğün & Etkinlik Fotoğraf Galerisi (Canlı Projeksiyon, ZIP İndirme, PIN)     │
│ ✅ FAZ 2: Akıllı Araç & Motosiklet Park Tagı (Numara Maskeleme, 20+ Marka, Acil Kan)  │
│ ✅ FAZ 3: Petguru x QR-la Akıllı Pati Künyesi (GPS Konum İletimi, 🚨 Kayıp Alarmı)     │
│ ✅ FAZ 4: Dijital Kartvizit & NFC Akıllı Kart (vCard 3.0, IBAN Panosu, Portfolyo)      │
│ ✅ FAZ 5: Restoran Menü QR (Masadan Garson & Hesap Çağırma, Otomatik Wi-Fi, Alerjenler)│
│ ✅ FAZ 6: Merkezi Suite Hub, Varlık Yönetimi & QR Tarama Analitiği                    │
│ ✅ FAZ 7: QR Kod Tasarım Stüdyosu (Vektörel SVG, 2048px PNG, Gradyan, Logo, Gözler)   │
│ ✅ FAZ 8: Online Ödeme Gateway'i & Çok Modüllü Paket Sistemi (3D Secure, Fatura)       │
│ ✅ FAZ 9: 5 Niş SEO Pazarlama Landing Sayfası (`/dugun`, `/otomobil`, `/pati`...)      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Detaylı Tamamlanan Özellikler:
* **💍 Düğün & Etkinlik:** Toplu fotoğraf yükleme, istemcide akıllı sıkıştırma (10x hız), salonda F11 tam ekran canlı projeksiyon slaytı, dijital anı defteri, 4 haneli PIN kodu ve tek tıkla tam çözünürlüklü ZIP arşiv indirme.
* **🚗 Araç & Motosiklet Tagı:** Ön camda numara maskeleme, 20+ otomobil/motosiklet marka teması, acil kan grubu rozeti, acil durum yakını arama butonu, hazır WhatsApp mesaj şablonları, UV cam stickerı.
* **🐾 Petguru Pati Künyesi:** Lazer kazımalı 30mm paslanmaz çelik künye, pilsiz/şarjsız ömür boyu çalışma, bulan kişinin tek tıkla GPS harita konumunu sahibe iletmesi, panelden açılan 🚨 Acil Kayıp Alarmı & Siren modu, dijital aşı karnesi.
* **💼 Dijital Kartvizit:** Mat siyah temassız NFC akıllı kart, vCard 3.0 tek tıkla tüm iPhone/Android rehberine kaydolma, IBAN kopyalama panosu, sosyal linkler, 12+ lüks kurumsal tema.
* **🍽️ Restoran Menü QR:** Panelden anında fiyat güncelleme ve "Tükendi" etiketi koyma, masadan tek tıkla Garson ve Hesap çağırma, tek dokunuşla otomatik Wi-Fi'a bağlanma, alerjen/kalori rozetleri, ahşap masa standı yazdırma şablonu.
* **✨ QR Tasarım Stüdyosu:** Vektörel SVG ve 2048px Ultra HD PNG dışa aktarma, 4 nokta deseni (kare, daire, squircle, elmas), köşe çerçeve ve pupil geometrileri, çift tonlu gradyanlar, merkez logo rozeti, "BENİ TARA" CTA çerçeveleri.
* **💳 Online Ödeme & Fatura:** Kredi kartı görsel simülasyonu, 3D Secure SMS doğrulama adımı, kupon indirim motoru, anında kota/paket aktivasyonu, VUK uyumlu yazdırılabilir e-Arşiv faturası.
* **🌐 Niş SEO Landing Sayfaları:**
  - `src/components/MarketingNav.tsx`: 5 modül hapı ve responsif gezinme.
  - `src/components/MarketingFooter.tsx`: Güven rozetleri ve ekosistem haritası.
  - `src/app/dugun.tsx`: Düğün fotoğraf toplama tanıtım sayfası.
  - `src/app/otomobil.tsx`: Akıllı araç park tagı ve numara gizleme sayfası.
  - `src/app/pati.tsx`: Petguru akıllı tasma künyesi sayfası.
  - `src/app/kartvizit.tsx`: vCard 3.0 ve NFC kartvizit sayfası.
  - `src/app/menu.tsx`: Restoran menü ve garson çağırma sayfası.
  - `src/app/index.tsx`: Ana vitrin modüllerine doğrudan "Detay & Fiyatlar" landing bağlantıları.

---

## 2. Gelecek Yol Haritası (Next Milestones & Action Plan)

Platformun bundan sonraki büyüme, ölçeklenme ve gelir artırma aşamaları için planlanan 7 ana faz:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        YENİ FAZLAR VE SIRADAKİ EYLEM PLANI                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 FAZ 10: Canlı Ödeme Altyapısı (Iyzico / PayTR Production API Entegrasyonu)          │
│ 📦 FAZ 11: Gerçek Zamanlı Kargo & Sipariş Takip Sistemi (Lojistik API)                 │
│ 🛎️ FAZ 12: Canlı Restoran Garson Terminali & Sesli Masa Çağrı Ekranı (POS Modu)        │
│ 🏢 FAZ 13: B2B Kurumsal Şirket Yönetim Portalı (Enterprise Team Hub & Toplu vCard)     │
│ 📡 FAZ 14: Petguru Mobil Push Bildirim & Kayıp Hayvan Harita Radarı                    │
│ ⚡ FAZ 15: Progressive Web App (PWA) & Offline / Kötü İnternet Modu                   │
│ 🌍 FAZ 16: Uluslararası Pazara Açılma (Global Multi-Currency, Stripe & i18n)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🚀 FAZ 10: Canlı Ödeme Altyapısı (Iyzico / PayTR Production API Entegrasyonu)

Mevcut test ve simülasyon ödeme akışının gerçek banka ve ödeme lisansörleri ile canlıya alınması:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Ödeme Ağ Geçidi Sağlayıcı Seçimi:**
   - Türkiye pazarı için **Iyzico Checkout API** veya **PayTR iFrame API** entegrasyonu.
2. **Backend API Rotaları:**
   - `POST /api/payment/initialize`: Sepet tutarı, kullanıcı bilgileri ve ürün detaylarıyla 3D Secure oturumu başlatma.
   - `POST /api/payment/callback`: Bankadan dönen SHA256 imzalı doğrulama yanıtını işleyen webhook rotası.
3. **Otomatik Durum Güncellemesi & Firestore Transaction:**
   - Başarılı işlemde Firestore'da işlem durumu `paid` yapılır, kullanıcının depolama kotası/paket süresi atomik işlemle artırılır.
   - Başarısız işlemde kullanıcıya anlaşılır hata mesajı (yetersiz bakiye, limit aşımı) gösterilir.
4. **Müşteri E-Posta / SMS Fatura Bildirimi:**
   - Ödeme tamamlandığında SendGrid / Resend API ile PDF e-Arşiv fatura makbuzu müşterinin e-postasına iletilir.

---

### 📦 FAZ 11: Gerçek Zamanlı Kargo & Sipariş Takip Sistemi (Lojistik Entegrasyonu)

Kullanıcıların fiziksel ürün siparişlerini (UV ön cam stickerı, 30mm lazer künye, NFC kartvizit, ahşap pleksi stand) canlı takip edebilmeleri:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Lojistik Entegrasyonu (Yurtiçi / MNG / Aras Kargo API):**
   - Panelden sipariş onaylandığında tek tıkla kargo konsinye numarası ve barkod üretimi.
2. **Sipariş Aşamaları Takipçisi:**
   - `Sipariş Alındı` ──► `Grafik Tasarım Onaylandı` ──► `Baskıda / Lazer Kazımada` ──► `Kargoya Verildi` ──► `Teslim Edildi`.
3. **Kullanıcı Canlı Takip Sayfası (`qr-la.com/kargo/[takip-kodu]`):**
   - Müşterinin üye girişi yapmadan, doğrudan SMS/WhatsApp ile gelen linke tıklayarak kargonun anlık nerede olduğunu harita üzerinde görmesi.
4. **Yönetim Paneli Matbaa Çıktı Modülü:**
   - Matbaacı veya operasyon ekibi için tek tıkla sipariş listesini ve kargo teslim fişlerini PDF olarak yazdırma (`window.print()`).

---

### 🛎️ FAZ 12: Canlı Restoran Garson Terminali & Sesli Masa Çağrı Ekranı (POS Modu)

Restoran ve kafelerin masa çağrılarını sıfır gecikmeyle yönetebilmesi için kasa ve servis personeline özel tam ekran arayüz:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Kasa / Bar Arkası Tam Ekran Modu (`/panel/menu/kasa`):**
   - Masaüstü bilgisayar, tablet veya dokunmatik POS ekranında açık kalan karanlık şık canlı terminal.
2. **Sesli Çağrı Uyarısı (Audio Chime):**
   - Masadan "Garson Çağır" veya "Hesap İste" butonuna basıldığında salonda dikkat çekici akustik zil sesi çalması.
3. **Açılır Kart Hiyerarşisi:**
   - 🚨 Kırmızı Kart: *"Masa 14 — Hesap İstiyor (Kredi Kartı) • 18 sn önce"*
   - 🔔 Mavi Kart: *"Masa 6 — Garson Çağırıyor • 45 sn önce"*
4. **Garson Servis Onayı:**
   - Garson masaya gittiğinde ekrandaki *"Masaya Gidildi / Çağrıyı Kapat"* butonuna basar; çağrı yeşile dönerek arşivlenir.
5. **Ortalama Servis Yanıt Süresi Analitiği:**
   - Restoran sahibine masaların ortalama kaç dakikada hesap veya servis aldığına dair verimlilik raporu.

---

### 🏢 FAZ 13: B2B Kurumsal Şirket Yönetim Portalı (Enterprise Team Hub & Toplu vCard)

Büyük kurumsal şirketler, ajanslar ve satış ekipleri için merkezi dijital kartvizit yönetimi:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Şirket İK / Yönetici Portalı (`/panel/kurumsal`):**
   - Tek bir şirket hesabı altında 50 ila 500 çalışanın dijital kartvizitlerinin merkezi yönetimi.
2. **Excel / CSV ile Toplu Personel İçe Aktarma:**
   - `Ad, Soyad, Unvan, Departman, Telefon, E-posta, LinkedIn` kolonlarını içeren Excel tablosunu tek sürüklemeyle yükleme; sistem saniyeler içinde tüm personele özel URL (`qr-la.com/k/sirket-ad-soyad`) üretir.
3. **Merkezi Tasarım ve Şablon Kilitleme:**
   - Şirketin logosu, marka renkleri ve kurumsal e-posta formatı kilitlenir; çalışanlar yalnızca izin verilen alanları (örn. fotoğraf) güncelleyebilir.
4. **Tek Fatura ile Toplu NFC Kart Baskısı:**
   - 100 çalışan için kurumsal tek faturayla lüks mat siyah NFC akıllı kart siparişi ve toplu ofis teslimatı.

---

### 📡 FAZ 14: Petguru Mobil Push Bildirim & Kayıp Hayvan Harita Radarı (Community Radar)

Kayıp evcil hayvanların bulunma oranını %90'ın üzerine çıkaracak topluluk güvenlik ağı:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Kayıp Alarmı Çevre Uyarısı:**
   - Bir hayvan için panelden 🚨 Kayıp Alarmı verildiğinde, kaybolduğu noktanın 3 km çevresindeki izinli kullanıcılara ve veteriner kliniklerine Web Push ve Telegram bildirimi gönderilmesi.
2. **Kayıp Hayvan Isı Haritası (Heat-Map):**
   - Künyenin tarandığı GPS noktalarının zaman damgasıyla harita üzerinde birleştirilmesi; dostun hangi güzergahta ilerlediğinin sahibe gösterilmesi.
3. **Ödül Havuzu Güvenli Emanet Sistemi (Escrow):**
   - Sahip dilerse ödül miktarını QR-la güvencesine yatırır; dost bulunduğunda ödül bulan kişinin hesabına transfer edilir.

---

### ⚡ FAZ 15: Progressive Web App (PWA) & Offline / Kötü İnternet Modu

İnternet bağlantısının zayıf olduğu ortamlarda (bodrum kat restoranlar, kalabalık düğün salonları, otoparklar) kesintisiz kullanıcı deneyimi:

#### 🎯 Hedefler & Uygulama Adımları:
1. **PWA Manifestosu & Service Worker:**
   - `manifest.json` ve özel service worker konfigürasyonu ile mobil cihazlara "Ana Ekrana Ekle" komutuyla yerel uygulama gibi kurulabilme.
2. **Offline-First Önbellekleme:**
   - Restoran menüleri ve araç tagleri bir kez tarandıktan sonra IndexedDB üzerinde önbelleğe alınır; internet kesilse bile menü ve iletişim butonları anında açılır.
3. **Arka Planda Fotoğraf Sıraya Alma (Background Sync):**
   - Düğün salonunda internet zayıfsa, misafirin çektiği fotoğraflar yerel hafızaya kaydedilir ve internet sinyali güçlendiğinde otomatik olarak arka planda sunucuya yüklenir.

---

### 🌍 FAZ 16: Uluslararası Pazara Açılma (Global Multi-Currency, Stripe & i18n)

QR-la ekosisteminin yurt dışı pazarlara (Avrupa, Körfez Ülkeleri, ABD) açılması:

#### 🎯 Hedefler & Uygulama Adımları:
1. **Çoklu Dil Mimarisi (`i18next` / `expo-localization`):**
   - Türkçe, İngilizce, Almanca ve Arapça dil seçenekleri; tarayıcı diline göre otomatik algılama.
2. **Global Ödeme Entegrasyonu (Stripe Checkout):**
   - EUR, USD ve GBP cinsinden ödeme alma, Apple Pay ve Google Pay doğrudan tek dokunuşla ödeme.
3. **Uluslararası Kargo Lojistiği:**
   - DHL Express / FedEx entegrasyonu ile Avrupa ve Amerika'ya 3-5 iş gününde NFC kart ve çelik künye teslimatı.

---

## 3. Öncelik Sıralaması & Tavsiye Edilen Sonraki Adım

| Öncelik | Faz | Tahmini Efor | Beklenen İş Çıktısı & Gelir Etkisi |
| :---: | :--- | :---: | :--- |
| **P1 (Acil)** | **Faz 10: Canlı Ödeme Altyapısı (Iyzico / PayTR)** | 2 Gün | Gerçek kredi kartı tahsilatına başlanması ve nakit akışı |
| **P2 (Yüksek)**| **Faz 12: Canlı Restoran Garson Terminali (POS Modu)** | 2 Gün | Restoran ve kafelere aylık SaaS aboneliği satışı |
| **P3 (Yüksek)**| **Faz 11: Gerçek Zamanlı Kargo & Sipariş Takibi** | 2 Gün | Müşteri güveni ve operasyonel teslimat otomasyonu |
| **P4 (Orta)**  | **Faz 13: B2B Kurumsal Şirket Yönetim Portalı** | 3 Gün | Yüksek sepet tutarlı B2B kurumsal NFC kart satışları |
| **P5 (Orta)**  | **Faz 15: PWA & Offline Desteği** | 2 Gün | Düğün salonlarında %100 kesintisiz misafir deneyimi |
| **P6 (Gelecek)**| **Faz 14 & 16: Topluluk Radarı & Global Açılım** | 4 Gün | Uluslararası ölçeklenme |

> **💡 Sonraki Adım Önerisi:**  
> Kullanıcı talepleri ve ciro üretme hızı göz önüne alındığında, sıradaki ilk adım olarak **Faz 10 (Iyzico/PayTR Canlı Ödeme Entegrasyonu)** veya restoranların masadan çağrılarını canlı karşılayacak **Faz 12 (Restoran Garson Terminali & Sesli Masa Çağrı Ekranı)** ile devam edilmesi önerilir.
