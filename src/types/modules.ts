export type QRModuleType = 'event' | 'vehicle' | 'vcard' | 'menu' | 'pet';

export interface BaseQRItem {
  id: string;
  slug: string;             // Benzersiz kısa URL (örn: "34abc123" veya "samet-ve-sule")
  userId: string;           // Sahip kullanıcı kimliği
  moduleType: QRModuleType; // Modül tipi
  title: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

export type BloodType =
  | 'A Rh+'
  | 'A Rh-'
  | 'B Rh+'
  | 'B Rh-'
  | 'AB Rh+'
  | 'AB Rh-'
  | '0 Rh+'
  | '0 Rh-'
  | 'Bilinmiyor';

export type VehicleCategory = 'motorcycle' | 'car' | 'commercial';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string; // 'Eşi', 'Babası', 'Kardeşi', 'Arkadaşı' vb.
}

export interface VehicleData {
  id: string;
  slug: string;                // Temizlenmiş plaka ("34abc123") veya etiket kodu
  userId: string;              // Sahip UID
  plateNumber: string;         // Orijinal plaka ("34 ABC 123")
  ownerName: string;           // Sürücü Adı
  ownerPhone: string;          // Sürücü Telefonu ("05xxxxxxxxx")
  ownerEmail?: string;
  instagram?: string;          // Instagram kullanıcı adı ("@surucu")
  bloodType?: BloodType;       // Hayati acil durum kan grubu
  emergencyContact?: EmergencyContact; // Kaza anında aranacak kişi
  vehicleType: VehicleCategory;// 'motorcycle' | 'car' | 'commercial'
  brand: string;               // 'honda', 'yamaha', 'bmw', 'mercedes', 'audi', 'ktm', 'ducati', vb.
  model: string;               // "CBR 650R", "320i M Sport", "Golf 8"
  theme: string;               // Seçilen marka/renk teması ID'si
  privacyMode: boolean;        // true: numara ziyaretçiye gösterilmez, doğrudan WhatsApp üzerinden yazılır
  presetMessages: string[];    // Hızlı bildirim mesajları
  note?: string;               // Sürücü park notu ("Girişi kapattıysam lütfen arayın")
  isClaimed?: boolean;         // Fiziksel sticker sahiplenildi mi?
  uniqueUrl?: string;          // Önceden basılmış etiket kodu
  viewCount: number;           // Tarama sayısı
  createdAt: string;
  updatedAt: string;
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type PetGender = 'male' | 'female';

export interface PetVaccine {
  id: string;
  name: string;
  date: string;
  validUntil: string;
  isUpToDate: boolean;
}

export interface PetScanLog {
  id: string;
  timestamp: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  address?: string;
  userAgent?: string;
}

export interface PetLostInfo {
  isLost: boolean;
  lostDate?: string;
  lostLocation?: string;
  rewardAmount?: string;
  notes?: string;
  emergencyPhone?: string;
}

export interface PetData {
  id: string;
  slug: string;                  // Kısa URL veya Nano-ID ("duman", "k9x2", "pamuk")
  userId: string;                // Sahip UID
  name: string;                  // Evcil hayvan adı ("Duman")
  species: PetSpecies;           // 'dog' | 'cat' | 'bird' | 'other'
  breed: string;                 // "Golden Retriever", "British Shorthair"
  gender: PetGender;             // 'male' | 'female'
  age: string;                   // "2.5 Yaşında"
  color?: string;                // "Krem / Bal Köpüğü"
  photoUrl: string;              // Profil fotoğrafı URL'si
  microchipNumber?: string;      // Çip Kimlik No ("990000012345678")
  ownerName: string;             // Sahip Adı ("Ayşe Yılmaz")
  ownerPhone: string;            // Sahip Telefonu
  ownerWhatsapp?: string;        // WhatsApp iletişim
  ownerAddress?: string;         // İlçe / Şehir ("Kadıköy, İstanbul")
  vetClinicName?: string;        // Kayıtlı veteriner kliniği
  vetPhone?: string;             // Veteriner telefonu
  vetAddress?: string;           // Veteriner adresi
  allergies?: string[];          // Alerjiler & hassasiyetler
  personality?: string[];        // Karakter özellikleri ("Uysal", "Oyunbaz", "Çocuklarla Dost")
  specialNotes?: string;         // Özel bakım/yaklaşım notu
  lostInfo: PetLostInfo;         // Kayıp durumu & ödül bilgileri
  vaccines: PetVaccine[];        // Aşı karnesi
  isClaimed: boolean;            // Fiziksel tasma künyesi sahiplenildi mi?
  uniqueTagCode?: string;        // Metal künye seri kodu ("PET-8X4B")
  viewCount: number;             // Tarama sayısı
  scanLogs: PetScanLog[];        // GPS ve zaman damgalı tarama geçmişi
  createdAt: string;
  updatedAt: string;
}

export type VCardThemeId =
  | 'executive_dark'
  | 'navy_prestige'
  | 'cyber_violet'
  | 'emerald_tech'
  | 'rose_gold'
  | 'polar_minimal';

export interface VCardSocials {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  youtube?: string;
  tiktok?: string;
  telegram?: string;
  medium?: string;
  behance?: string;
  website?: string;
}

export interface VCardBankInfo {
  bankName: string;
  iban: string;
  accountHolder: string;
}

export interface VCardPortfolioItem {
  title: string;
  url: string;
  type?: 'link' | 'pdf' | 'video';
}

export interface VCardData {
  id: string;
  slug: string;                 // Benzersiz profil linki ("samet-sunman", "avukat-ali")
  userId: string;               // Sahip UID
  fullName: string;             // Ad Soyad
  jobTitle: string;             // Unvan ("Kıdemli Yazılım Mimarı")
  company: string;              // Şirket Adı ("Asnus Bilişim")
  department?: string;          // Departman
  avatarUrl: string;            // Profil fotoğrafı URL
  coverUrl?: string;            // Arka plan kapak görseli
  bio?: string;                 // Kısa biyografi / hakkımda
  phone: string;                // Cep telefonu
  phoneSecondary?: string;      // İş telefonu
  whatsapp?: string;            // WhatsApp numarası
  email: string;                // E-posta
  emailSecondary?: string;      // İkinci e-posta
  website?: string;             // Kişisel / Şirket web sitesi
  location?: string;            // Şehir / Ülke ("Maslak, İstanbul / Türkiye")
  mapUrl?: string;              // Ofis harita linki
  theme: VCardThemeId;          // Kartvizit tasarım teması
  socials: VCardSocials;        // Sosyal medya bağlantıları
  bankAccounts: VCardBankInfo[];// IBAN ve banka hesapları
  portfolioLinks: VCardPortfolioItem[]; // Portfolyo ve dosya linkleri
  isNfcCardClaimed?: boolean;   // Fiziksel NFC kartvizit basıldı/sahiplenildi mi?
  nfcSerial?: string;           // NFC kart çip seri numarası
  viewCount: number;            // Profil görüntülenme sayısı
  vcfDownloads: number;         // Rehbere kaydetme tıklama sayısı
  createdAt: string;
  updatedAt: string;
}

export type MenuItemTag =
  | 'chef_pick'
  | 'popular'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'spicy';

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  tags?: MenuItemTag[];
  allergens?: string[];
  isAvailable: boolean;
  calories?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export type MenuThemeId =
  | 'bistro_dark'
  | 'warm_amber'
  | 'emerald_oasis'
  | 'crimson_grill'
  | 'ocean_blue';

export interface RestaurantData {
  id: string;
  slug: string;                  // "lucca-bistrot", "bogazici-balik"
  userId: string;                // Sahip UID
  name: string;                  // "Lucca Bistrot & Bar"
  cuisine: string;               // "Modern Akdeniz & Dünya Mutfağı"
  logoUrl: string;               // Restoran logo
  coverUrl: string;              // Kapak fotoğrafı
  description: string;           // Tanıtım / karşılama mesajı
  currency: string;              // "₺", "$", "€"
  phone: string;                 // Rezervasyon & İletişim telefonu
  address: string;               // Adres
  mapUrl?: string;               // Google Haritalar linki
  wifiSsid?: string;             // Wi-Fi Ağ Adı
  wifiPassword?: string;         // Wi-Fi Şifresi
  openingHours?: string;         // "Her gün 11:00 - 01:30"
  theme: MenuThemeId;            // Menü tasarım teması
  categories: MenuCategory[];    // Menü kategorileri
  items: MenuItem[];             // Menüdeki yemekler ve içecekler
  tableCount: number;            // Masa sayısı (baskı şablonu için)
  enableWaiterCall: boolean;     // Garson çağırma butonu aktif mi?
  enableBillRequest: boolean;    // Hesap isteme butonu aktif mi?
  viewCount: number;             // Toplam menü görüntülenme sayısı
  createdAt: string;
  updatedAt: string;
}
