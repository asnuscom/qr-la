import { appStorage } from './storage';
import { db, auth } from './firebase';
import { authService } from './authService';
import { collection, getDocs, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';

export const ADMIN_EMAILS = ['casska@asnus.com', 'casska@msn.com'];


export type PlatformModuleKey = 'wedding' | 'vehicle' | 'pet' | 'vcard' | 'menu';

export interface ModuleControlConfig {
  key: PlatformModuleKey;
  label: string;
  icon: string;
  color: string;
  isEnabled: boolean; // Platform genelinde açık/kapalı
  isHiddenOnHome: boolean; // Anasayfada gizlensin mi
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'moderator' | 'user';
  status: 'active' | 'suspended' | 'pending';
  assetCount: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
}

export interface AdminAssetItem {
  id: string;
  title: string;
  moduleType: 'event' | 'vehicle' | 'pet' | 'vcard' | 'menu';
  slug: string;
  ownerEmail: string;
  ownerName: string;
  scans: number;
  status: 'active' | 'suspended' | 'draft';
  tier: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userEmail: string;
  userName: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'completed' | 'processing' | 'refunded';
  paymentMethod: string;
}

export interface AdminCoupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_tier';
  value: number; // percentage or TL
  tier?: string;
  usedCount: number;
  maxUsage: number;
  expiresAt: string;
  isActive: boolean;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success';
  title: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  globalAnnouncement: string;
  isAnnouncementActive: boolean;
  allowRegistrations: boolean;
  defaultFreeStorageMB: number;
  maxUploadSizeMB: number;
  autoApproveNewEvents: boolean;
}

const STORAGE_KEY_ADMIN_AUTH = 'qrla_admin_authenticated';
const STORAGE_KEY_ADMIN_USERS = 'qrla_admin_users';
const STORAGE_KEY_ADMIN_ASSETS = 'qrla_admin_assets';
const STORAGE_KEY_ADMIN_COUPONS = 'qrla_admin_coupons';
const STORAGE_KEY_ADMIN_SETTINGS = 'qrla_admin_settings';
const STORAGE_KEY_ADMIN_ORDERS = 'qrla_admin_orders';
const STORAGE_KEY_ADMIN_MODULE_CONTROLS = 'qrla_admin_module_controls';

export const DEFAULT_MODULE_CONTROLS: Record<PlatformModuleKey, ModuleControlConfig> = {
  wedding: {
    key: 'wedding',
    label: 'Düğün & Etkinlik',
    icon: 'heart',
    color: '#C5A059',
    isEnabled: true,
    isHiddenOnHome: false,
    description: 'Misafir anı defteri ve canlı projeksiyon fotoğraf yükleme modülü.',
  },
  vehicle: {
    key: 'vehicle',
    label: 'Araç & Park Tagı',
    icon: 'car-sport',
    color: '#0284C7',
    isEnabled: true,
    isHiddenOnHome: false,
    description: 'Numara maskeleme, acil kan grubu ve tek tıkla WhatsApp durum mesajları.',
  },
  pet: {
    key: 'pet',
    label: 'Pati Künyesi (Petguru)',
    icon: 'paw',
    color: '#10B981',
    isEnabled: true,
    isHiddenOnHome: false,
    description: 'Kaybolan evcil dostlar için harita konumu ileten akıllı künye.',
  },
  vcard: {
    key: 'vcard',
    label: 'Dijital Kartvizit & NFC',
    icon: 'briefcase',
    color: '#8B5CF6',
    isEnabled: true,
    isHiddenOnHome: false,
    description: 'Tek dokunuşla rehbere kayıt (.vcf) ve sosyal medya kartvizit profili.',
  },
  menu: {
    key: 'menu',
    label: 'Restoran & Kafe Menü QR',
    icon: 'restaurant',
    color: '#F59E0B',
    isEnabled: true,
    isHiddenOnHome: false,
    description: 'Kafe ve restoranlar için fotoğraflı, çok dilli dijital masa menüsü.',
  },
};

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-admin-asnus',
    name: 'Samet Sunman',
    email: 'casska@asnus.com',
    role: 'superadmin',
    status: 'active',
    assetCount: 12,
    totalSpent: 4950,
    createdAt: '2026-09-01T10:00:00.000Z',
    lastLogin: '2026-10-30T09:30:00.000Z',
  },
  {
    id: 'usr-1',
    name: 'Samet Sunman',
    email: 'casska@msn.com',
    role: 'superadmin',
    status: 'active',
    assetCount: 6,
    totalSpent: 2850,
    createdAt: '2026-09-01T10:00:00.000Z',
    lastLogin: '2026-10-28T14:30:00.000Z',
  },
  {
    id: 'usr-2',
    name: 'Yavuz Demir (Demo Host)',
    email: 'demo@qr-la.com',
    role: 'moderator',
    status: 'active',
    assetCount: 3,
    totalSpent: 450,
    createdAt: '2026-09-15T12:00:00.000Z',
    lastLogin: '2026-10-28T12:15:00.000Z',
  },
  {
    id: 'usr-3',
    name: 'Şule & Samet Yılmaz',
    email: 'sule.samet@dugun.com',
    role: 'user',
    status: 'active',
    assetCount: 2,
    totalSpent: 1290,
    createdAt: '2026-10-01T09:30:00.000Z',
    lastLogin: '2026-10-27T19:40:00.000Z',
  },
  {
    id: 'usr-4',
    name: 'Lucca Bistrot & Cocktail',
    email: 'management@luccabebek.com',
    role: 'user',
    status: 'active',
    assetCount: 1,
    totalSpent: 1800,
    createdAt: '2026-10-05T14:20:00.000Z',
    lastLogin: '2026-10-28T11:00:00.000Z',
  },
  {
    id: 'usr-5',
    name: 'Cemre Aksoy (Pati Duman)',
    email: 'cemre.aksoy@gmail.com',
    role: 'user',
    status: 'active',
    assetCount: 2,
    totalSpent: 250,
    createdAt: '2026-10-12T16:00:00.000Z',
    lastLogin: '2026-10-25T15:20:00.000Z',
  },
  {
    id: 'usr-6',
    name: 'Kaan Demirkan (Honda CBR)',
    email: 'kaan.d@motoclub.com',
    role: 'user',
    status: 'active',
    assetCount: 1,
    totalSpent: 300,
    createdAt: '2026-10-18T18:10:00.000Z',
    lastLogin: '2026-10-28T09:12:00.000Z',
  },
  {
    id: 'usr-7',
    name: 'Test Spam Hesabı',
    email: 'bot992@spammer.org',
    role: 'user',
    status: 'suspended',
    assetCount: 0,
    totalSpent: 0,
    createdAt: '2026-10-22T04:10:00.000Z',
    lastLogin: '2026-10-22T04:12:00.000Z',
  },
];

const DEFAULT_ASSETS: AdminAssetItem[] = [
  {
    id: 'ast-1',
    title: 'Samet & Şule Düğünü',
    moduleType: 'event',
    slug: 'samet-ve-sule',
    ownerEmail: 'casska@msn.com',
    ownerName: 'Samet Sunman',
    scans: 1420,
    status: 'active',
    tier: 'VIP Sınırsız',
    createdAt: '2026-10-01',
  },
  {
    id: 'ast-2',
    title: 'Honda CBR 650R (34 ABC 123)',
    moduleType: 'vehicle',
    slug: '34abc123',
    ownerEmail: 'kaan.d@motoclub.com',
    ownerName: 'Kaan Demirkan',
    scans: 284,
    status: 'active',
    tier: 'Ömür Boyu Park Tagı',
    createdAt: '2026-10-18',
  },
  {
    id: 'ast-3',
    title: 'Pati Duman (Petguru Künye)',
    moduleType: 'pet',
    slug: 'duman',
    ownerEmail: 'cemre.aksoy@gmail.com',
    ownerName: 'Cemre Aksoy',
    scans: 95,
    status: 'active',
    tier: 'GPS Akıllı Künye',
    createdAt: '2026-10-12',
  },
  {
    id: 'ast-4',
    title: 'Samet Sunman (vCard & NFC)',
    moduleType: 'vcard',
    slug: 'samet-sunman',
    ownerEmail: 'casska@msn.com',
    ownerName: 'Samet Sunman',
    scans: 620,
    status: 'active',
    tier: 'Pro Dijital vCard',
    createdAt: '2026-10-02',
  },
  {
    id: 'ast-5',
    title: 'Lucca Bistrot & Cocktail Bar Menü',
    moduleType: 'menu',
    slug: 'lucca-bistrot',
    ownerEmail: 'management@luccabebek.com',
    ownerName: 'Lucca Bistrot',
    scans: 3840,
    status: 'active',
    tier: 'Kurumsal Restoran QR',
    createdAt: '2026-10-05',
  },
  {
    id: 'ast-6',
    title: 'Demo Panel Etkinliği',
    moduleType: 'event',
    slug: 'demo-panel',
    ownerEmail: 'demo@qr-la.com',
    ownerName: 'Yavuz Demir',
    scans: 8520,
    status: 'active',
    tier: 'Free Demo',
    createdAt: '2026-09-15',
  },
  {
    id: 'ast-7',
    title: 'Şüpheli QR Kampanyası',
    moduleType: 'vcard',
    slug: 'kazan-bedava',
    ownerEmail: 'bot992@spammer.org',
    ownerName: 'Test Spam Hesabı',
    scans: 12,
    status: 'suspended',
    tier: 'Free',
    createdAt: '2026-10-22',
  },
];

const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'QRLA-2026-9812',
    userEmail: 'management@luccabebek.com',
    userName: 'Lucca Bistrot',
    title: 'Restoran Yıllık Menü Lisansı + 50 Adet Pleksi Karekod',
    category: 'menu',
    amount: 1800,
    date: '2026-10-27 16:40',
    status: 'completed',
    paymentMethod: 'Kredi Kartı (3D Secure)',
  },
  {
    id: 'ord-102',
    orderNumber: 'QRLA-2026-9790',
    userEmail: 'sule.samet@dugun.com',
    userName: 'Şule & Samet Yılmaz',
    title: 'VIP Düğün Paketi + 100 Masa QR Kartı',
    category: 'event',
    amount: 1290,
    date: '2026-10-26 14:15',
    status: 'completed',
    paymentMethod: 'Havale / EFT',
  },
  {
    id: 'ord-103',
    orderNumber: 'QRLA-2026-9755',
    userEmail: 'kaan.d@motoclub.com',
    userName: 'Kaan Demirkan',
    title: 'Araç UV Korumalı Ön Cam Stickerı',
    category: 'vehicle',
    amount: 300,
    date: '2026-10-25 11:30',
    status: 'completed',
    paymentMethod: 'Kredi Kartı',
  },
  {
    id: 'ord-104',
    orderNumber: 'QRLA-2026-9721',
    userEmail: 'cemre.aksoy@gmail.com',
    userName: 'Cemre Aksoy',
    title: 'Lazer Kazımalı Paslanmaz Çelik Pati Künyesi',
    category: 'pet',
    amount: 250,
    date: '2026-10-24 18:22',
    status: 'completed',
    paymentMethod: 'Kredi Kartı',
  },
  {
    id: 'ord-105',
    orderNumber: 'QRLA-2026-9680',
    userEmail: 'casska@msn.com',
    userName: 'Samet Sunman',
    title: 'Mat Siyah Lüks NFC Dijital Kartvizit',
    category: 'vcard',
    amount: 450,
    date: '2026-10-22 10:05',
    status: 'completed',
    paymentMethod: 'Kredi Kartı',
  },
];

const DEFAULT_COUPONS: AdminCoupon[] = [
  {
    code: 'QRVIP50',
    discountType: 'percentage',
    value: 50,
    tier: 'premium',
    usedCount: 28,
    maxUsage: 100,
    expiresAt: '2026-12-31',
    isActive: true,
  },
  {
    code: 'DUGUN2026',
    discountType: 'percentage',
    value: 20,
    tier: 'vip',
    usedCount: 64,
    maxUsage: 200,
    expiresAt: '2026-11-30',
    isActive: true,
  },
  {
    code: 'PETGURU100',
    discountType: 'free_tier',
    value: 100,
    tier: 'standart',
    usedCount: 15,
    maxUsage: 50,
    expiresAt: '2026-12-15',
    isActive: true,
  },
  {
    code: 'LAUNCHVIP',
    discountType: 'free_tier',
    value: 100,
    tier: 'vip',
    usedCount: 12,
    maxUsage: 20,
    expiresAt: '2026-11-15',
    isActive: true,
  },
];

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'Platformumuz planlı sistem güncellemesi nedeniyle kısa süre bakım modundadır.',
  globalAnnouncement: '🎉 QR-la v2.0 Restoran Menü, Bildirim Merkezi ve Analitik Altyapısı Devrede!',
  isAnnouncementActive: true,
  allowRegistrations: true,
  defaultFreeStorageMB: 500,
  maxUploadSizeMB: 25,
  autoApproveNewEvents: true,
};

const DEFAULT_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    level: 'info',
    title: 'Yönetici Girişi Yapıldı',
    details: 'Superadmin hesabı (casska@msn.com) başarıyla giriş yaptı.',
    timestamp: '2026-10-28 14:30:12',
    ip: '88.241.12.84',
  },
  {
    id: 'log-2',
    level: 'success',
    title: 'Yeni Sipariş Onaylandı',
    details: 'QRLA-2026-9812 nolu restoran siparişi başarıyla tahsil edildi.',
    timestamp: '2026-10-27 16:40:55',
    ip: '176.234.90.11',
  },
  {
    id: 'log-3',
    level: 'warn',
    title: 'Şüpheli Kayıt Engellendi',
    details: 'bot992@spammer.org hesabı spam kuralı tetiklediği için askıya alındı.',
    timestamp: '2026-10-22 04:12:00',
    ip: '194.32.10.45',
  },
  {
    id: 'log-4',
    level: 'info',
    title: 'Sistem Yedeklemesi Tamamlandı',
    details: 'Firestore ve Cloud Storage veritabanı yedeği alındı (142.8 GB).',
    timestamp: '2026-10-28 03:00:00',
    ip: '10.0.0.1 (cron)',
  },
];

class AdminService {
  private isUnlocked: boolean = false;
  private readonly MASTER_PIN = '1923';
  private moduleListeners: Array<(controls: Record<PlatformModuleKey, ModuleControlConfig>) => void> = [];

  // Auth / Lock State
  async checkAdminAuth(): Promise<boolean> {
    if (this.isUnlocked) return true;

    // Check if user is currently authenticated in authService
    try {
      const currentUser = authService.getState().user;
      if (currentUser && currentUser.email) {
        const email = currentUser.email.trim().toLowerCase();
        if (
          ADMIN_EMAILS.includes(email) ||
          currentUser.role === 'superadmin' ||
          currentUser.isAdmin === true
        ) {
          this.isUnlocked = true;
          await appStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
          return true;
        }
      }
    } catch (_) {}

    const stored = await appStorage.getItem(STORAGE_KEY_ADMIN_AUTH);
    if (stored === 'true') {
      this.isUnlocked = true;
      return true;
    }
    return false;
  }

  async loginWithFirebase(email: string, pass: string): Promise<{ success: boolean; user: any }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const user = await authService.signIn(cleanEmail, cleanPass);
      const isSuper =
        ADMIN_EMAILS.includes(cleanEmail) ||
        user.role === 'superadmin' ||
        user.isAdmin === true;

      if (!isSuper) {
        throw new Error('Bu hesap ("' + cleanEmail + '") Süper Admin yetkisine sahip değildir.');
      }

      this.isUnlocked = true;
      await appStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      await this.addLog('info', 'Yönetici Girişi (Firebase)', `Süper Admin hesabı (${cleanEmail}) Firebase ile oturum açtı.`);
      return { success: true, user };
    } catch (err: any) {
      throw err;
    }
  }

  async verifyPin(pin: string): Promise<boolean> {
    if (pin === this.MASTER_PIN) {
      this.isUnlocked = true;
      await appStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
      await this.addLog('info', 'Yönetici Girişi (Master PIN)', 'Süper Admin paneli Master PIN (1923) ile açıldı.');
      return true;
    }
    return false;
  }

  async logoutAdmin(): Promise<void> {
    this.isUnlocked = false;
    await appStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
  }

  // --- Module Controls (Toggle Enable & Hide on Home) ---
  subscribeModuleControls(listener: (controls: Record<PlatformModuleKey, ModuleControlConfig>) => void): () => void {
    this.moduleListeners.push(listener);
    this.getModuleControls().then((c) => listener(c));
    return () => {
      this.moduleListeners = this.moduleListeners.filter((l) => l !== listener);
    };
  }

  private notifyModuleControls(controls: Record<PlatformModuleKey, ModuleControlConfig>) {
    this.moduleListeners.forEach((l) => l(controls));
  }

  async getModuleControls(): Promise<Record<PlatformModuleKey, ModuleControlConfig>> {
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_MODULE_CONTROLS);
    if (!raw) return DEFAULT_MODULE_CONTROLS;
    try {
      return { ...DEFAULT_MODULE_CONTROLS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_MODULE_CONTROLS;
    }
  }

  async updateModuleControl(
    key: PlatformModuleKey,
    updates: Partial<ModuleControlConfig>
  ): Promise<Record<PlatformModuleKey, ModuleControlConfig>> {
    const current = await this.getModuleControls();
    const updated = {
      ...current,
      [key]: { ...current[key], ...updates },
    };
    await appStorage.setItem(STORAGE_KEY_ADMIN_MODULE_CONTROLS, JSON.stringify(updated));
    this.notifyModuleControls(updated);
    return updated;
  }

  // Users with Firebase Integration
  async getUsers(): Promise<AdminUser[]> {
    let usersList: AdminUser[] = [...DEFAULT_USERS];

    // Load from local cache first if available
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_USERS);
    if (raw) {
      try {
        const cached: AdminUser[] = JSON.parse(raw);
        cached.forEach((cu) => {
          const idx = usersList.findIndex((u) => u.email.toLowerCase() === cu.email.toLowerCase());
          if (idx >= 0) usersList[idx] = { ...usersList[idx], ...cu };
          else usersList.push(cu);
        });
      } catch (_) {}
    }

    // Connect to Firestore collection 'users'
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          snap.docs.forEach((d) => {
            const data = d.data();
            const email = (data.email || '').toLowerCase().trim();
            if (!email) return;

            const isSuper =
              ADMIN_EMAILS.includes(email) ||
              data.role === 'superadmin' ||
              data.isAdmin === true;

            const adminItem: AdminUser = {
              id: d.id,
              name: data.displayName || email.split('@')[0] || 'Kullanıcı',
              email: data.email || email,
              role: isSuper ? 'superadmin' : (data.role || 'user'),
              status: data.status || 'active',
              assetCount: (data.events?.length || 0),
              totalSpent: data.totalSpent || (isSuper ? 4950 : 0),
              createdAt: data.createdAt || new Date().toISOString(),
              lastLogin: data.lastLogin || data.createdAt || new Date().toISOString(),
            };

            const idx = usersList.findIndex((u) => u.email.toLowerCase() === email);
            if (idx >= 0) {
              usersList[idx] = { ...usersList[idx], ...adminItem };
            } else {
              usersList.push(adminItem);
            }
          });
        }
      } catch (err) {
        console.warn('Firestore users fetch warning:', err);
      }
    }

    // Guarantee casska@asnus.com is at the top with superadmin permissions
    const asnusIdx = usersList.findIndex((u) => u.email.toLowerCase() === 'casska@asnus.com');
    if (asnusIdx >= 0) {
      const [asnusUser] = usersList.splice(asnusIdx, 1);
      asnusUser.role = 'superadmin';
      asnusUser.status = 'active';
      usersList.unshift(asnusUser);
    } else {
      usersList.unshift(DEFAULT_USERS[0]);
    }

    await appStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(usersList));
    return usersList;
  }

  async updateUserStatus(userId: string, newStatus: AdminUser['status']): Promise<AdminUser[]> {
    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    await appStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updated));

    if (db) {
      try {
        await updateDoc(doc(db, 'users', userId), { status: newStatus });
        await this.addLog('warn', 'Kullanıcı Durumu Değiştirildi', `Kullanıcı (${userId}) durumu "${newStatus}" yapıldı.`);
      } catch (err) {
        console.warn('Firestore user status update warning:', err);
      }
    }
    return updated;
  }

  async updateUserRole(userId: string, newRole: AdminUser['role']): Promise<AdminUser[]> {
    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    await appStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updated));

    if (db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          role: newRole,
          isAdmin: newRole === 'superadmin',
        });
        await this.addLog('warn', 'Kullanıcı Yetkisi Değiştirildi', `Kullanıcı (${userId}) yetkisi "${newRole}" olarak güncellendi.`);
      } catch (err) {
        console.warn('Firestore user role update warning:', err);
      }
    }
    return updated;
  }

  // Assets
  async getAssets(): Promise<AdminAssetItem[]> {
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_ASSETS);
    if (!raw) return DEFAULT_ASSETS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ASSETS;
    }
  }

  async updateAssetStatus(assetId: string, newStatus: AdminAssetItem['status']): Promise<AdminAssetItem[]> {
    const assets = await this.getAssets();
    const updated = assets.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a));
    await appStorage.setItem(STORAGE_KEY_ADMIN_ASSETS, JSON.stringify(updated));
    return updated;
  }

  async deleteAsset(assetId: string): Promise<AdminAssetItem[]> {
    const assets = await this.getAssets();
    const updated = assets.filter((a) => a.id !== assetId);
    await appStorage.setItem(STORAGE_KEY_ADMIN_ASSETS, JSON.stringify(updated));
    return updated;
  }

  // Orders
  async getOrders(): Promise<AdminOrder[]> {
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_ORDERS);
    if (!raw) return DEFAULT_ORDERS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  // Coupons
  async getCoupons(): Promise<AdminCoupon[]> {
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_COUPONS);
    if (!raw) return DEFAULT_COUPONS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_COUPONS;
    }
  }

  async addCoupon(coupon: AdminCoupon): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    const updated = [coupon, ...list.filter((c) => c.code !== coupon.code)];
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));
    return updated;
  }

  async toggleCoupon(code: string): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    const updated = list.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));
    return updated;
  }

  async deleteCoupon(code: string): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    const updated = list.filter((c) => c.code !== code);
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));
    return updated;
  }

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await appStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Logs with Firestore
  async getLogs(): Promise<SystemLog[]> {
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'admin_logs'));
        if (!snap.empty) {
          const list: SystemLog[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          return [...list, ...DEFAULT_LOGS].slice(0, 30);
        }
      } catch (err) {
        console.warn('Firestore logs fetch warning:', err);
      }
    }
    return DEFAULT_LOGS;
  }

  async addLog(level: SystemLog['level'], title: string, details: string): Promise<void> {
    const newLog: SystemLog = {
      id: 'log-' + Date.now(),
      level,
      title,
      details,
      timestamp: new Date().toLocaleString('tr-TR'),
    };
    if (db) {
      try {
        await addDoc(collection(db, 'admin_logs'), newLog);
      } catch (_) {}
    }
  }

  // Platform Metrics summary
  async getPlatformKPIs() {
    const users = await this.getUsers();
    const assets = await this.getAssets();
    const orders = await this.getOrders();

    const totalScans = assets.reduce((acc, a) => acc + a.scans, 0);
    const totalRevenue = orders.reduce((acc, o) => (o.status === 'completed' ? acc + o.amount : acc), 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      totalAssets: assets.length,
      activeAssets: assets.filter((a) => a.status === 'active').length,
      totalScans,
      totalRevenue,
      recentOrdersCount: orders.length,
      storageUsedGB: 142.8,
      storageMaxGB: 1000,
      uptimePercentage: '99.98%',
    };
  }
}

export const adminService = new AdminService();
