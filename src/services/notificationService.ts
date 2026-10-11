import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { appStorage } from './storage';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  category: 'scan' | 'photo' | 'vehicle' | 'pet' | 'order' | 'system';
  url?: string;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY_NOTIFICATIONS = 'qr_la_in_app_notifications';
const ANDROID_CHANNEL_ID = 'qrla_notifications';

// 1. SDK 57 Foreground Notification Handler
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn('Notifications handler init error:', err);
  }
}

type NotificationSubscriber = (notifications: InAppNotification[]) => void;

class NotificationService {
  private subscribers: NotificationSubscriber[] = [];
  private isChannelConfigured = false;
  private pushToken: string | null = null;

  constructor() {
    this.setupChannelsAsync();
  }

  /**
   * Android için bildirim kanalını kurar
   */
  async setupChannelsAsync(): Promise<void> {
    if (Platform.OS === 'android' && !this.isChannelConfigured) {
      try {
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: 'QR-la Canlı Bildirimler',
          description: 'Karekod okutma, yeni fotoğraf ve acil durum uyarıları',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#C5A059',
          sound: 'default',
        });
        this.isChannelConfigured = true;
      } catch (e) {
        console.warn('Android notification channel setup error:', e);
      }
    }
  }

  /**
   * Push bildirim izinlerini ister ve token alır
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Web Notification API desteği
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
      return null;
    }

    try {
      await this.setupChannelsAsync();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // Expo Push Token alma denemesi
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        this.pushToken = tokenData.data;
        return this.pushToken;
      } catch {
        // Standart cihaz push tokeni
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        this.pushToken = deviceToken.data;
        return this.pushToken;
      }
    } catch (err) {
      console.warn('Push notification registration error:', err);
      return null;
    }
  }

  /**
   * Kayıtlı tüm bildirimleri getirir
   */
  getNotifications(): InAppNotification[] {
    try {
      const raw = appStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (raw) return JSON.parse(raw);
    } catch {}

    // Varsayılan zengin bildirim geçmişi
    const defaults: InAppNotification[] = [
      {
        id: 'notif-1',
        title: '🚗 Aracınızın QR Kodu Tarandı',
        body: '34 ABC 123 plakalı Honda CBR için "Aracınızı çeker misiniz?" hazır mesajı görüntülendi.',
        category: 'vehicle',
        url: '/panel/arac',
        read: false,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: 'notif-2',
        title: '📸 Düğününüze Yeni Fotoğraf Eklendi',
        body: 'Misafir "Murat & Merve" anı defterine 3 adet fotoğraf ve tebrik mesajı bıraktı.',
        category: 'photo',
        url: '/samet-ve-sule',
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'notif-3',
        title: '🐾 Petguru Künye Taraması',
        body: 'Duman adlı dostunuzun künyesi taranarak canlı harita GPS konumu kaydedildi.',
        category: 'pet',
        url: '/panel/pati',
        read: true,
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ];

    appStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(defaults));
    return defaults;
  }

  /**
   * Okunmamış bildirim sayısı
   */
  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  }

  /**
   * Bildirim dinleyicisi ekler
   */
  subscribe(callback: NotificationSubscriber): () => void {
    this.subscribers.push(callback);
    callback(this.getNotifications());
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  private notifySubscribers() {
    const list = this.getNotifications();
    this.subscribers.forEach((cb) => cb(list));
  }

  /**
   * Yeni bir bildirim tetikler (Hem Cihaz / Web Banner hem In-App)
   */
  async triggerNotification(params: {
    title: string;
    body: string;
    category?: InAppNotification['category'];
    url?: string;
  }): Promise<InAppNotification> {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: params.title,
      body: params.body,
      category: params.category || 'system',
      url: params.url,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // 1. Dahili listeye ekle
    const current = this.getNotifications();
    const updated = [newNotif, ...current];
    appStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    this.notifySubscribers();

    // 2. Native cihaz bildirimi (Android & iOS)
    if (Platform.OS !== 'web') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: params.title,
            body: params.body,
            data: { url: params.url },
            sound: true,
          },
          trigger: null, // Anında göster
        });
      } catch (e) {
        console.warn('Native notification schedule error:', e);
      }
    } else {
      // Web Tarayıcısı Bildirimi
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(params.title, {
            body: params.body,
            icon: '/favicon.png',
          });
        } catch {}
      }
    }

    return newNotif;
  }

  /**
   * Bildirimi okundu olarak işaretler
   */
  markAsRead(id: string): void {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    appStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    this.notifySubscribers();
  }

  /**
   * Tüm bildirimleri okundu olarak işaretler
   */
  markAllAsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    appStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    this.notifySubscribers();
  }

  /**
   * Tüm bildirimleri siler
   */
  clearAll(): void {
    appStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify([]));
    this.notifySubscribers();
  }

  // --- Hazır Tetikleyiciler ---

  async notifyQrScanned(assetTitle: string, slug: string): Promise<void> {
    await this.triggerNotification({
      title: `⚡ Karekod Tarandı: ${assetTitle}`,
      body: `qr-la.com/${slug} bağlantınız yeni bir ziyaretçi tarafından görüntülendi.`,
      category: 'scan',
      url: `/${slug}`,
    });
  }

  async notifyPhotoUploaded(eventTitle: string, guestName: string, count = 1): Promise<void> {
    await this.triggerNotification({
      title: `📸 Yeni Fotoğraf Yüklendi!`,
      body: `${guestName}, "${eventTitle}" anı galerisine ${count} adet yeni fotoğraf ekledi.`,
      category: 'photo',
      url: '/panel/etkinlik',
    });
  }

  async notifyVehicleMessage(plateNumber: string, message: string): Promise<void> {
    await this.triggerNotification({
      title: `🚗 Araç Uyarısı: ${plateNumber}`,
      body: `Bir sürücü mesaj iletti: "${message}"`,
      category: 'vehicle',
      url: '/panel/arac',
    });
  }

  async notifyPetFound(petName: string): Promise<void> {
    await this.triggerNotification({
      title: `🐾 ${petName}'in Künyesi Okutuldu!`,
      body: `Dostunuzun tasmasındaki akıllı karekod tarandı. GPS harita konumu bildirildi!`,
      category: 'pet',
      url: '/panel/pati',
    });
  }

  async notifyOrderSuccess(itemTitle: string, amount: number): Promise<void> {
    await this.triggerNotification({
      title: `🧾 Sipariş Bildirimi Kaydedildi`,
      body: `${itemTitle} (${amount} ₺) Havale/FAST talebiniz alındı. WhatsApp aktivasyonu bekleniyor.`,
      category: 'order',
      url: '/panel/tarifeler?tab=history',
    });
  }
}

export const notificationService = new NotificationService();
