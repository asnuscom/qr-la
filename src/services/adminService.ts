import { appStorage } from './storage';
import { db, auth } from './firebase';
import { authService } from './authService';
import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, addDoc, query, where, onSnapshot } from 'firebase/firestore';

export const ROOT_ADMIN_EMAILS = ['casska@asnus.com', 'casska@msn.com'];
export let ADMIN_EMAILS = [...ROOT_ADMIN_EMAILS];


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

const DEFAULT_USERS: AdminUser[] = [];
const DEFAULT_ASSETS: AdminAssetItem[] = [];
const DEFAULT_ORDERS: AdminOrder[] = [];
const DEFAULT_COUPONS: AdminCoupon[] = [];

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

const DEFAULT_LOGS: SystemLog[] = [];

class AdminService {
  private isUnlocked: boolean = false;
  private readonly MASTER_PIN = '1923';
  private moduleListeners: Array<(controls: Record<PlatformModuleKey, ModuleControlConfig>) => void> = [];
  private dynamicAdminEmails: string[] = [...ROOT_ADMIN_EMAILS];

  // Dynamic Admin Email List (Stored in Firestore: admin_settings/admins)
  async getAdminEmails(): Promise<string[]> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'admins'));
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.adminEmails)) {
            this.dynamicAdminEmails = Array.from(new Set([...ROOT_ADMIN_EMAILS, ...data.adminEmails]));
            ADMIN_EMAILS = this.dynamicAdminEmails;
            return this.dynamicAdminEmails;
          }
        }
      } catch (err) {
        console.warn('Dynamic admin emails fetch note:', err);
      }
    }
    ADMIN_EMAILS = this.dynamicAdminEmails;
    return this.dynamicAdminEmails;
  }

  async addAdminEmail(email: string, role: 'superadmin' | 'moderator' = 'superadmin'): Promise<string[]> {
    const clean = email.trim().toLowerCase();
    const current = await this.getAdminEmails();
    const updated = Array.from(new Set([...current, clean]));
    this.dynamicAdminEmails = updated;
    ADMIN_EMAILS = updated;

    if (db) {
      try {
        await setDoc(doc(db, 'admin_settings', 'admins'), {
          adminEmails: updated,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        // Update user record in Firestore if exists
        const q = query(collection(db, 'users'), where('email', '==', clean));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          await updateDoc(doc(db, 'users', docSnap.id), {
            role,
            isAdmin: true,
          });
        }
        await this.addLog('warn', 'Yeni Yönetici Yetkilendirildi (Dinamik)', `${clean} adresine ${role} yetkisi verildi.`);
      } catch (err) {
        console.warn('Firestore add admin email error:', err);
      }
    }
    return updated;
  }

  async removeAdminEmail(email: string): Promise<string[]> {
    const clean = email.trim().toLowerCase();
    if (ROOT_ADMIN_EMAILS.includes(clean)) {
      throw new Error('Kök yönetici hesabı sistemden kaldırılamaz.');
    }
    const current = await this.getAdminEmails();
    const updated = current.filter((e) => e !== clean);
    this.dynamicAdminEmails = updated;
    ADMIN_EMAILS = updated;

    if (db) {
      try {
        await setDoc(doc(db, 'admin_settings', 'admins'), {
          adminEmails: updated,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        const q = query(collection(db, 'users'), where('email', '==', clean));
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
          await updateDoc(doc(db, 'users', docSnap.id), {
            role: 'user',
            isAdmin: false,
          });
        }
        await this.addLog('warn', 'Yönetici Yetkisi Geri Alındı', `${clean} adresinin yönetici yetkisi kaldırıldı.`);
      } catch (err) {
        console.warn('Firestore remove admin email error:', err);
      }
    }
    return updated;
  }

  // Auth / Lock State
  async checkAdminAuth(): Promise<boolean> {
    if (this.isUnlocked) return true;

    // Check if user is currently authenticated in authService
    try {
      const currentUser = authService.getState().user;
      if (currentUser && currentUser.email) {
        const email = currentUser.email.trim().toLowerCase();
        const adminEmails = await this.getAdminEmails();
        if (
          adminEmails.includes(email) ||
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
      const adminEmails = await this.getAdminEmails();
      const isSuper =
        adminEmails.includes(cleanEmail) ||
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

  // --- Module Controls (Toggle Enable & Hide on Home) with Live Firestore Sync ---
  subscribeModuleControls(listener: (controls: Record<PlatformModuleKey, ModuleControlConfig>) => void): () => void {
    this.moduleListeners.push(listener);
    this.getModuleControls().then((c) => listener(c));

    let fsUnsub: (() => void) | null = null;
    if (db) {
      try {
        fsUnsub = onSnapshot(doc(db, 'admin_settings', 'modules'), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Record<PlatformModuleKey, ModuleControlConfig>;
            const merged = { ...DEFAULT_MODULE_CONTROLS, ...data };
            appStorage.setItem(STORAGE_KEY_ADMIN_MODULE_CONTROLS, JSON.stringify(merged));
            this.notifyModuleControls(merged);
          }
        });
      } catch (err) {
        console.warn('Firestore module subscription error:', err);
      }
    }

    return () => {
      this.moduleListeners = this.moduleListeners.filter((l) => l !== listener);
      if (fsUnsub) {
        try { fsUnsub(); } catch (_) {}
      }
    };
  }

  private notifyModuleControls(controls: Record<PlatformModuleKey, ModuleControlConfig>) {
    this.moduleListeners.forEach((l) => {
      try { l(controls); } catch (_) {}
    });
  }

  async getModuleControls(): Promise<Record<PlatformModuleKey, ModuleControlConfig>> {
    // 1. Try Firestore
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'modules'));
        if (snap.exists()) {
          const data = snap.data() as Record<PlatformModuleKey, ModuleControlConfig>;
          const merged = { ...DEFAULT_MODULE_CONTROLS, ...data };
          await appStorage.setItem(STORAGE_KEY_ADMIN_MODULE_CONTROLS, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.warn('Error reading module controls from Firestore:', e);
      }
    }

    // 2. Fallback to local storage
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

    if (db) {
      try {
        await setDoc(doc(db, 'admin_settings', 'modules'), updated, { merge: true });
        await this.addLog(
          'info',
          'Modül Ayarı Değiştirildi',
          `${updated[key].label} modülü: ${updates.isEnabled !== undefined ? (updates.isEnabled ? 'Aktif' : 'Kapalı') : ''} ${updates.isHiddenOnHome !== undefined ? (updates.isHiddenOnHome ? 'Anasayfada Gizli' : 'Anasayfada Görünür') : ''}`
        );
      } catch (e) {
        console.warn('Error saving module controls to Firestore:', e);
      }
    }

    this.notifyModuleControls(updated);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('qrla_module_controls_updated', { detail: updated }));
      } catch (_) {}
    }
    return updated;
  }

  // Users with Firebase Integration
  async getUsers(): Promise<AdminUser[]> {
    const userMap = new Map<string, AdminUser>();

    // Query Firestore collection 'users'
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const adminEmails = await this.getAdminEmails();

        snap.docs.forEach((d) => {
          const data = d.data();
          const email = (data.email || '').toLowerCase().trim();
          if (!email) return;

          // Exclude legacy demo accounts if present
          if (email.endsWith('@spammer.org') || email === 'demo@qr-la.com') return;

          const isSuper =
            adminEmails.includes(email) ||
            data.role === 'superadmin' ||
            data.isAdmin === true;

          const isMod = !isSuper && (data.role === 'moderator' || data.isModerator === true);

          const existing = userMap.get(email);
          const userItem: AdminUser = {
            id: d.id,
            name: data.displayName || existing?.name || email.split('@')[0] || 'Kullanıcı',
            email: data.email || email,
            role: isSuper ? 'superadmin' : isMod ? 'moderator' : (data.role || existing?.role || 'user'),
            status: data.status || existing?.status || 'active',
            assetCount: Array.isArray(data.events) ? data.events.length : (existing?.assetCount || 0),
            totalSpent: Number(data.totalSpent || existing?.totalSpent || 0),
            createdAt: data.createdAt || existing?.createdAt || new Date().toISOString(),
            lastLogin: data.lastLogin || existing?.lastLogin || data.createdAt || new Date().toISOString(),
          };
          userMap.set(email, userItem);
        });
      } catch (err) {
        console.warn('Firestore users fetch warning:', err);
      }
    }

    // Always guarantee root superadmin casska@asnus.com
    const asnusEmail = 'casska@asnus.com';
    if (!userMap.has(asnusEmail)) {
      userMap.set(asnusEmail, {
        id: 'usr-admin-asnus',
        name: 'Samet Sunman',
        email: asnusEmail,
        role: 'superadmin',
        status: 'active',
        assetCount: 0,
        totalSpent: 0,
        createdAt: '2026-09-01T10:00:00.000Z',
        lastLogin: new Date().toISOString(),
      });
    } else {
      const u = userMap.get(asnusEmail)!;
      u.role = 'superadmin';
      u.status = 'active';
      userMap.set(asnusEmail, u);
    }

    const usersList = Array.from(userMap.values());
    // Move casska@asnus.com to top
    usersList.sort((a, b) => {
      if (a.email.toLowerCase() === asnusEmail) return -1;
      if (b.email.toLowerCase() === asnusEmail) return 1;
      return 0;
    });

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
    const target = users.find((u) => u.id === userId);
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    await appStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updated));

    if (target && target.email) {
      if (newRole === 'superadmin') {
        await this.addAdminEmail(target.email, 'superadmin');
      } else if (newRole === 'moderator') {
        await this.addAdminEmail(target.email, 'moderator');
      } else {
        try {
          await this.removeAdminEmail(target.email);
        } catch (_) {}
      }
    }

    if (db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          role: newRole,
          isAdmin: newRole === 'superadmin',
        });
        await this.addLog('warn', 'Kullanıcı Yetkisi Değiştirildi (Dinamik Firestore)', `Kullanıcı (${target?.email || userId}) yetkisi "${newRole}" olarak güncellendi.`);
      } catch (err) {
        console.warn('Firestore user role update warning:', err);
      }
    }
    return updated;
  }

  // Assets with Real Firestore Integration
  async getAssets(): Promise<AdminAssetItem[]> {
    const assetList: AdminAssetItem[] = [];

    if (db) {
      try {
        // 1. Events collection
        const eventsSnap = await getDocs(collection(db, 'events'));
        eventsSnap.docs.forEach((d) => {
          const data = d.data();
          const slug = data.slug || d.id;
          assetList.push({
            id: d.id,
            title: data.title || (data.eventType === 'dugun' ? 'Düğün Etkinliği' : 'Özel Etkinlik'),
            moduleType: 'event',
            slug: slug,
            ownerEmail: data.ownerEmail || data.hostEmail || 'casska@asnus.com',
            ownerName: data.ownerName || data.hostName || 'Samet Sunman',
            scans: Number(data.viewCount || data.views || 0),
            status: data.isArchived ? 'suspended' : 'active',
            tier: data.tier || 'VIP Sınırsız',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-10-01',
          });
        });

        // 2. Vehicles collection
        const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
        vehiclesSnap.docs.forEach((d) => {
          const data = d.data();
          assetList.push({
            id: d.id,
            title: data.plateNumber ? `${data.plateNumber} (${data.brand || 'Araç'})` : 'Araç Tagı',
            moduleType: 'vehicle',
            slug: data.slug || d.id,
            ownerEmail: data.ownerEmail || '',
            ownerName: data.ownerName || 'Araç Sahibi',
            scans: Number(data.viewCount || 0),
            status: 'active',
            tier: 'Standart',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-10-01',
          });
        });

        // 3. VCards collection
        const vcardsSnap = await getDocs(collection(db, 'vcards'));
        vcardsSnap.docs.forEach((d) => {
          const data = d.data();
          assetList.push({
            id: d.id,
            title: data.fullName || data.title || 'Dijital vCard',
            moduleType: 'vcard',
            slug: data.slug || d.id,
            ownerEmail: data.ownerEmail || '',
            ownerName: data.fullName || 'Kartvizit Sahibi',
            scans: Number(data.viewCount || 0),
            status: 'active',
            tier: 'Standart',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-10-01',
          });
        });

        // 4. Menus (restaurants) collection
        const menusSnap = await getDocs(collection(db, 'restaurants'));
        menusSnap.docs.forEach((d) => {
          const data = d.data();
          assetList.push({
            id: d.id,
            title: data.name || 'Restoran Menüsü',
            moduleType: 'menu',
            slug: data.slug || d.id,
            ownerEmail: data.ownerEmail || '',
            ownerName: data.ownerName || 'İşletme',
            scans: Number(data.viewCount || 0),
            status: 'active',
            tier: 'Standart',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-10-01',
          });
        });

        // 5. Pets collection
        const petsSnap = await getDocs(collection(db, 'pets'));
        petsSnap.docs.forEach((d) => {
          const data = d.data();
          assetList.push({
            id: d.id,
            title: data.petName ? `🐾 ${data.petName}` : 'Pati Künyesi',
            moduleType: 'pet',
            slug: data.slug || d.id,
            ownerEmail: data.ownerEmail || '',
            ownerName: data.ownerName || 'Pati Sahibi',
            scans: Number(data.viewCount || 0),
            status: 'active',
            tier: 'Standart',
            createdAt: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : '2026-10-01',
          });
        });

        await appStorage.setItem(STORAGE_KEY_ADMIN_ASSETS, JSON.stringify(assetList));
        return assetList;
      } catch (err) {
        console.warn('Error fetching Firestore assets:', err);
      }
    }

    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_ASSETS);
    if (raw) {
      try {
        const cached: AdminAssetItem[] = JSON.parse(raw);
        return cached.filter((a) => !a.id.startsWith('ast-'));
      } catch {}
    }
    return [];
  }

  async updateAssetStatus(assetId: string, newStatus: AdminAssetItem['status']): Promise<AdminAssetItem[]> {
    const assets = await this.getAssets();
    const target = assets.find((a) => a.id === assetId);
    const updated = assets.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a));
    await appStorage.setItem(STORAGE_KEY_ADMIN_ASSETS, JSON.stringify(updated));

    if (db && target) {
      try {
        const colName =
          target.moduleType === 'event'
            ? 'events'
            : target.moduleType === 'vehicle'
            ? 'vehicles'
            : target.moduleType === 'vcard'
            ? 'vcards'
            : target.moduleType === 'menu'
            ? 'restaurants'
            : 'pets';
        await updateDoc(doc(db, colName, assetId), {
          status: newStatus,
          isArchived: newStatus === 'suspended',
        });
        await this.addLog('warn', 'Varlık Durumu Değiştirildi', `${target.title} durumu "${newStatus}" yapıldı.`);
      } catch (err) {
        console.warn('Firestore asset status update error:', err);
      }
    }
    return updated;
  }

  async deleteAsset(assetId: string): Promise<AdminAssetItem[]> {
    const assets = await this.getAssets();
    const target = assets.find((a) => a.id === assetId);
    const updated = assets.filter((a) => a.id !== assetId);
    await appStorage.setItem(STORAGE_KEY_ADMIN_ASSETS, JSON.stringify(updated));

    if (db && target) {
      try {
        const colName =
          target.moduleType === 'event'
            ? 'events'
            : target.moduleType === 'vehicle'
            ? 'vehicles'
            : target.moduleType === 'vcard'
            ? 'vcards'
            : target.moduleType === 'menu'
            ? 'restaurants'
            : 'pets';
        await deleteDoc(doc(db, colName, assetId));
        await this.addLog('warn', 'Varlık Silindi', `${target.title} (${target.slug}) veritabanından kalıcı olarak silindi.`);
      } catch (err) {
        console.warn('Firestore asset delete error:', err);
      }
    }
    return updated;
  }

  // Orders with Firestore Integration
  async getOrders(): Promise<AdminOrder[]> {
    const ordersList: AdminOrder[] = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        if (!snap.empty) {
          snap.docs.forEach((d) => {
            const data = d.data();
            ordersList.push({
              id: d.id,
              orderNumber: data.orderNumber || d.id,
              userEmail: data.userEmail || '',
              userName: data.userName || 'Müşteri',
              title: data.title || 'Sipariş',
              category: data.category || 'event',
              amount: Number(data.amount || 0),
              date: data.date || data.createdAt || new Date().toISOString(),
              status: data.status || 'completed',
              paymentMethod: data.paymentMethod || 'Kredi Kartı',
            });
          });
        }
        await appStorage.setItem(STORAGE_KEY_ADMIN_ORDERS, JSON.stringify(ordersList));
        return ordersList;
      } catch (err) {
        console.warn('Firestore orders fetch error:', err);
      }
    }

    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_ORDERS);
    if (raw) {
      try {
        const cached: AdminOrder[] = JSON.parse(raw);
        return cached.filter((o) => !o.id.startsWith('ord-'));
      } catch {}
    }
    return [];
  }

  // Coupons with Firestore Integration
  async getCoupons(): Promise<AdminCoupon[]> {
    const list: AdminCoupon[] = [];
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        if (!snap.empty) {
          snap.docs.forEach((d) => {
            list.push(d.data() as AdminCoupon);
          });
          await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Firestore coupons fetch error:', err);
      }
    }

    const raw = await appStorage.getItem(STORAGE_KEY_ADMIN_COUPONS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  async addCoupon(coupon: AdminCoupon): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    const updated = [coupon, ...list.filter((c) => c.code !== coupon.code)];
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));

    if (db) {
      try {
        await setDoc(doc(db, 'coupons', coupon.code), coupon);
        await this.addLog('info', 'Yeni Kupon Eklendi', `"${coupon.code}" kodlu %${coupon.value} kupon tanımlandı.`);
      } catch (err) {
        console.warn('Firestore coupon add error:', err);
      }
    }
    return updated;
  }

  async toggleCoupon(code: string): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    let targetCoupon: AdminCoupon | undefined;
    const updated = list.map((c) => {
      if (c.code === code) {
        targetCoupon = { ...c, isActive: !c.isActive };
        return targetCoupon;
      }
      return c;
    });
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));

    if (db && targetCoupon) {
      try {
        await updateDoc(doc(db, 'coupons', code), { isActive: targetCoupon.isActive });
      } catch (err) {
        console.warn('Firestore coupon toggle error:', err);
      }
    }
    return updated;
  }

  async deleteCoupon(code: string): Promise<AdminCoupon[]> {
    const list = await this.getCoupons();
    const updated = list.filter((c) => c.code !== code);
    await appStorage.setItem(STORAGE_KEY_ADMIN_COUPONS, JSON.stringify(updated));

    if (db) {
      try {
        await deleteDoc(doc(db, 'coupons', code));
        await this.addLog('warn', 'Kupon Silindi', `"${code}" kuponu silindi.`);
      } catch (err) {
        console.warn('Firestore coupon delete error:', err);
      }
    }
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
          list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
          return list.slice(0, 50);
        }
      } catch (err) {
        console.warn('Firestore logs fetch warning:', err);
      }
    }
    return [];
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

    const totalScans = assets.reduce((acc, a) => acc + (a.scans || 0), 0);
    const totalRevenue = orders.reduce((acc, o) => (o.status === 'completed' ? acc + (o.amount || 0) : acc), 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      totalAssets: assets.length,
      activeAssets: assets.filter((a) => a.status === 'active').length,
      totalScans,
      totalRevenue,
      recentOrdersCount: orders.length,
      storageUsedGB: 0,
      storageMaxGB: 1000,
      uptimePercentage: '99.99%',
    };
  }
}

export const adminService = new AdminService();
