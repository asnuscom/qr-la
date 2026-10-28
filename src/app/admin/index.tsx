import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';
import {
  adminService,
  AdminUser,
  AdminAssetItem,
  AdminOrder,
  AdminCoupon,
  SystemLog,
  SystemSettings,
  PlatformModuleKey,
  ModuleControlConfig,
  DEFAULT_MODULE_CONTROLS,
} from '@/services/adminService';

type AdminTab = 'overview' | 'modules' | 'assets' | 'users' | 'finance' | 'settings';

export default function SuperAdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWide = width >= 1100;
  const { isDark, colors } = useTheme();
  const styles = useMemo(() => getStyles(isDark, colors, isMobile, isWide), [isDark, colors, isMobile, isWide]);

  // Auth / Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data States
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [moduleControls, setModuleControls] = useState<Record<PlatformModuleKey, ModuleControlConfig>>(DEFAULT_MODULE_CONTROLS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [assets, setAssets] = useState<AdminAssetItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Filtering & Search
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [assetModuleFilter, setAssetModuleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Modals
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('25');
  const [newCouponMaxUsage, setNewCouponMaxUsage] = useState('50');

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // Initial Auth Check
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Platform Süper Admin | QR-la';
    }

    async function checkAuth() {
      setIsAuthenticating(true);
      const ok = await adminService.checkAdminAuth();
      setIsUnlocked(ok);
      setIsAuthenticating(false);
      if (ok) {
        loadAllAdminData();
      }
    }
    checkAuth();
  }, []);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [k, m, u, a, o, c, s, l] = await Promise.all([
        adminService.getPlatformKPIs(),
        adminService.getModuleControls(),
        adminService.getUsers(),
        adminService.getAssets(),
        adminService.getOrders(),
        adminService.getCoupons(),
        adminService.getSettings(),
        adminService.getLogs(),
      ]);
      setKpis(k);
      setModuleControls(m);
      setUsers(u);
      setAssets(a);
      setOrders(o);
      setCoupons(c);
      setSettings(s);
      setAnnouncementText(s.globalAnnouncement);
      setLogs(l);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUnlockWithPin = async (pinToTry?: string) => {
    const candidate = pinToTry !== undefined ? pinToTry : pinInput.trim();
    if (!candidate) {
      setPinError('Lütfen yönetici PIN kodunu giriniz.');
      return;
    }
    const success = await adminService.verifyPin(candidate);
    if (success) {
      setIsUnlocked(true);
      setPinError(null);
      setPinInput('');
      await loadAllAdminData();
    } else {
      setPinError('Geçersiz PIN! Lütfen doğru Süper Admin PIN kodunu giriniz.');
    }
  };

  const handleLogoutAdmin = async () => {
    await adminService.logoutAdmin();
    setIsUnlocked(false);
  };

  // --- Module Toggle Actions ---
  const handleToggleModuleEnabled = async (key: PlatformModuleKey) => {
    const current = moduleControls[key];
    const nextState = !current.isEnabled;
    const updated = await adminService.updateModuleControl(key, { isEnabled: nextState });
    setModuleControls(updated);
    Alert.alert(
      nextState ? '✅ Modül Aktifleştirildi' : '⚠️ Modül Devre Dışı Bırakıldı',
      `"${current.label}" modülü platform genelinde ${nextState ? 'kullanıma açıldı' : 'kapatıldı'}.`
    );
  };

  const handleToggleModuleHiddenOnHome = async (key: PlatformModuleKey) => {
    const current = moduleControls[key];
    const nextState = !current.isHiddenOnHome;
    const updated = await adminService.updateModuleControl(key, { isHiddenOnHome: nextState });
    setModuleControls(updated);
    Alert.alert(
      nextState ? '👁️ Anasayfada Gizlendi' : '🌟 Anasayfada Yayında',
      `"${current.label}" modülü anasayfada ${nextState ? 'artık gösterilmeyecek.' : 'yeniden gösteriliyor.'}`
    );
  };

  // User Actions
  const handleToggleUserStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updated = await adminService.updateUserStatus(user.id, nextStatus);
    setUsers(updated);
    Alert.alert(
      'Kullanıcı Güncellendi',
      `${user.name} kullanıcısının durumu "${nextStatus === 'active' ? 'Aktif' : 'Askıda'}" olarak ayarlandı.`
    );
  };

  const handleChangeUserRole = async (user: AdminUser, newRole: AdminUser['role']) => {
    const updated = await adminService.updateUserRole(user.id, newRole);
    setUsers(updated);
  };

  // Asset Actions
  const handleToggleAssetStatus = async (asset: AdminAssetItem) => {
    const nextStatus = asset.status === 'active' ? 'suspended' : 'active';
    const updated = await adminService.updateAssetStatus(asset.id, nextStatus);
    setAssets(updated);
  };

  const handleDeleteAsset = async (asset: AdminAssetItem) => {
    const confirmMsg = `"${asset.title}" (${asset.slug}) adlı QR varlığı platformdan kalıcı olarak silinsin mi?`;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(confirmMsg)) {
        const updated = await adminService.deleteAsset(asset.id);
        setAssets(updated);
      }
    } else {
      Alert.alert('Varlığı Sil', confirmMsg, [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const updated = await adminService.deleteAsset(asset.id);
            setAssets(updated);
          },
        },
      ]);
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async () => {
    const code = newCouponCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Eksik Bilgi', 'Kupon kodu boş bırakılamaz.');
      return;
    }
    const val = parseInt(newCouponDiscount, 10) || 20;
    const maxUse = parseInt(newCouponMaxUsage, 10) || 50;

    const newC: AdminCoupon = {
      code,
      discountType: 'percentage',
      value: val,
      usedCount: 0,
      maxUsage: maxUse,
      expiresAt: '2026-12-31',
      isActive: true,
    };

    const updated = await adminService.addCoupon(newC);
    setCoupons(updated);
    setCouponModalOpen(false);
    setNewCouponCode('');
    Alert.alert('Başarılı! 🎉', `"${code}" kuponu başarıyla tanımlandı.`);
  };

  const handleToggleCoupon = async (code: string) => {
    const updated = await adminService.toggleCoupon(code);
    setCoupons(updated);
  };

  const handleDeleteCoupon = async (code: string) => {
    const updated = await adminService.deleteCoupon(code);
    setCoupons(updated);
  };

  // Settings Actions
  const handleToggleMaintenance = async () => {
    if (!settings) return;
    const next = !settings.maintenanceMode;
    const updated = await adminService.updateSettings({ maintenanceMode: next });
    setSettings(updated);
    Alert.alert(
      next ? '⚠️ Bakım Modu Devrede' : '✅ Bakım Modu Kapatıldı',
      next
        ? 'Platform tüm normal ziyaretçilere bakım ekranı gösterecektir.'
        : 'Platform tüm ziyaretçiler için normal yayına açıldı.'
    );
  };

  const handleSaveAnnouncement = async () => {
    if (!settings) return;
    const updated = await adminService.updateSettings({
      globalAnnouncement: announcementText,
      isAnnouncementActive: true,
    });
    setSettings(updated);
    setAnnouncementModalOpen(false);
    Alert.alert('Yayınlandı 📣', 'Global duyuru tüm platformda aktif edildi.');
  };

  // Filtered Lists
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchMod = assetModuleFilter === 'all' || a.moduleType === assetModuleFilter;
      const q = assetSearchQuery.toLowerCase();
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.ownerEmail.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q);
      return matchMod && matchQ;
    });
  }, [assets, assetModuleFilter, assetSearchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearchQuery.toLowerCase();
      return (
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, userSearchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearchQuery.toLowerCase();
      return (
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearchQuery]);

  // If loading initial auth
  if (isAuthenticating) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Güvenlik Protokolü Doğrulanıyor...
        </Text>
      </View>
    );
  }

  // --- PIN LOCK SCREEN ---
  if (!isUnlocked) {
    return (
      <SafeAreaView style={[styles.lockContainer, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
        <View style={styles.lockBox}>
          <View style={[styles.lockIconCircle, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
            <Ionicons name="shield-checkmark" size={40} color={colors.gold} />
          </View>

          <Text style={[styles.lockTitle, { color: colors.text }]}>Platform Süper Admin</Text>
          <Text style={[styles.lockSubtitle, { color: colors.textSecondary }]}>
            QR-la ekosisteminin tüm kullanıcı, varlık ve finansal verilerini denetlemek için yetkili PIN kodunu giriniz.
          </Text>

          <View style={[styles.pinInputContainer, { backgroundColor: colors.card, borderColor: pinError ? '#EF4444' : colors.border }]}>
            <Ionicons name="key-outline" size={20} color={colors.gold} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.pinInput, { color: colors.text }]}
              placeholder="Yönetici PIN Kodunu Giriniz (1923)"
              placeholderTextColor={colors.textMuted}
              value={pinInput}
              onChangeText={(t) => {
                setPinInput(t);
                setPinError(null);
              }}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={8}
              onSubmitEditing={() => handleUnlockWithPin()}
            />
          </View>

          {pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
            onPress={() => handleUnlockWithPin()}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-open" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Admin Girişi Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBypassBtn, { borderColor: colors.border }]}
            onPress={() => handleUnlockWithPin('1923')}
            activeOpacity={0.7}
          >
            <Text style={[styles.quickBypassText, { color: colors.gold }]}>
              ⚡ Demo Süper Admin Olarak Otomatik Aç (PIN: 1923)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLinkBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>Kullanıcı Paneline Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- UNLOCKED ADMIN DASHBOARD ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      {/* Admin Top Navigation Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>SÜPER ADMİN</Text>
          </View>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>QR-la Platform Hub</Text>
          <View style={styles.livePulseWrap}>
            <View style={styles.livePulseDot} />
            <Text style={styles.livePulseText}>Sistemler Aktif (v2.0)</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <ThemeToggleBtn />

          <TouchableOpacity
            style={[styles.topBarActionBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="grid-outline" size={16} color={colors.gold} />
            {!isMobile && <Text style={[styles.topBarActionText, { color: colors.text }]}>Kullanıcı Paneli</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topBarActionBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
            {!isMobile && <Text style={[styles.topBarActionText, { color: colors.text }]}>Anasayfa</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topBarActionBtn, { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            onPress={handleLogoutAdmin}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            {!isMobile && <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 13 }}>Kilitle</Text>}
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Tabs */}
      <View style={[styles.tabsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('overview')}
          >
            <Ionicons
              name={activeTab === 'overview' ? 'analytics' : 'analytics-outline'}
              size={18}
              color={activeTab === 'overview' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'overview' ? colors.gold : colors.textSecondary }]}>
              Genel Bakış
            </Text>
          </TouchableOpacity>

          {/* NEW: Modüller Tab */}
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'modules' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('modules')}
          >
            <Ionicons
              name={activeTab === 'modules' ? 'apps' : 'apps-outline'}
              size={18}
              color={activeTab === 'modules' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'modules' ? colors.gold : colors.textSecondary }]}>
              🧩 Modül Yönetimi (Aç/Kapa)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'assets' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('assets')}
          >
            <Ionicons
              name={activeTab === 'assets' ? 'qr-code' : 'qr-code-outline'}
              size={18}
              color={activeTab === 'assets' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'assets' ? colors.gold : colors.textSecondary }]}>
              QR Varlıklar ({assets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'users' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons
              name={activeTab === 'users' ? 'people' : 'people-outline'}
              size={18}
              color={activeTab === 'users' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'users' ? colors.gold : colors.textSecondary }]}>
              Kullanıcılar ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'finance' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('finance')}
          >
            <Ionicons
              name={activeTab === 'finance' ? 'card' : 'card-outline'}
              size={18}
              color={activeTab === 'finance' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'finance' ? colors.gold : colors.textSecondary }]}>
              Finans & Kuponlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'settings' && [styles.activeTabBtn, { borderBottomColor: colors.gold }]]}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons
              name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
              size={18}
              color={activeTab === 'settings' ? colors.gold : colors.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === 'settings' ? colors.gold : colors.textSecondary }]}>
              Sistem Ayarları
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {isLoadingData ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Veriler senkronize ediliyor...</Text>
          </View>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <View style={styles.tabContainer}>
                {/* KPI Metrics Row */}
                <View style={styles.kpiGrid}>
                  <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                      <Ionicons name="people" size={24} color="#C5A059" />
                    </View>
                    <Text style={[styles.kpiValue, { color: colors.text }]}>{kpis?.totalUsers || 0}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Kayıtlı Kullanıcı</Text>
                    <Text style={styles.kpiGrowth}>↑ %14 bu hafta</Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                      <Ionicons name="qr-code" size={24} color="#0284C7" />
                    </View>
                    <Text style={[styles.kpiValue, { color: colors.text }]}>{kpis?.totalAssets || 0}</Text>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Aktif QR Varlık</Text>
                    <Text style={styles.kpiGrowth}>↑ 5 yeni modül</Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Ionicons name="scan-outline" size={24} color="#10B981" />
                    </View>
                    <Text style={[styles.kpiValue, { color: colors.text }]}>
                      {(kpis?.totalScans || 0).toLocaleString('tr-TR')}
                    </Text>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Toplam Okutma / Tarama</Text>
                    <Text style={styles.kpiGrowth}>↑ %22 trafik artışı</Text>
                  </View>

                  <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Ionicons name="cash" size={24} color="#F59E0B" />
                    </View>
                    <Text style={[styles.kpiValue, { color: colors.text }]}>
                      ₺{(kpis?.totalRevenue || 0).toLocaleString('tr-TR')}
                    </Text>
                    <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Brüt Hasılat</Text>
                    <Text style={styles.kpiGrowth}>₺28.950 bu ay</Text>
                  </View>
                </View>

                {/* Modül Kontrol Özeti Kartı */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>🧩 Modül & Anasayfa Görünürlük Durumu</Text>
                      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                        Anasayfada hangi modüllerin gösterildiğini buradan hızlıca izleyebilirsiniz.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 14 }]}
                      onPress={() => setActiveTab('modules')}
                    >
                      <Text style={styles.primaryBtnText}>Modülleri Yönet →</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quickModuleRow}>
                    {(Object.keys(moduleControls) as PlatformModuleKey[]).map((key) => {
                      const mod = moduleControls[key];
                      const isOnlineOnHome = mod.isEnabled && !mod.isHiddenOnHome;
                      return (
                        <View
                          key={key}
                          style={[
                            styles.quickModulePill,
                            {
                              backgroundColor: isOnlineOnHome
                                ? 'rgba(16, 185, 129, 0.12)'
                                : mod.isEnabled
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                              borderColor: isOnlineOnHome
                                ? '#10B981'
                                : mod.isEnabled
                                ? '#F59E0B'
                                : '#EF4444',
                            },
                          ]}
                        >
                          <Ionicons
                            name={mod.icon as any}
                            size={14}
                            color={isOnlineOnHome ? '#10B981' : mod.isEnabled ? '#F59E0B' : '#EF4444'}
                          />
                          <Text
                            style={[
                              styles.quickModuleText,
                              {
                                color: isOnlineOnHome ? '#10B981' : mod.isEnabled ? '#F59E0B' : '#EF4444',
                              },
                            ]}
                          >
                            {mod.label}: {isOnlineOnHome ? 'Anasayfada Açık' : mod.isEnabled ? 'Anasayfada Gizli' : 'Kapalı'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Health & Infrastructure */}
                <View style={styles.sectionRow}>
                  {/* Left: Ecosystem Modules breakdown */}
                  <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1.2 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📦 Ekosistem Varlık Sayıları</Text>
                    <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                      Oluşturulmuş QR varlıklarının dağılımı
                    </Text>

                    <View style={styles.moduleDistList}>
                      <View style={styles.moduleDistItem}>
                        <View style={[styles.moduleColorDot, { backgroundColor: '#C5A059' }]} />
                        <Text style={[styles.moduleDistName, { color: colors.text }]}>💍 Düğün & Etkinlik QR</Text>
                        <Text style={[styles.moduleDistCount, { color: colors.gold }]}>
                          {assets.filter((a) => a.moduleType === 'event').length} Varlık
                        </Text>
                      </View>

                      <View style={styles.moduleDistItem}>
                        <View style={[styles.moduleColorDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={[styles.moduleDistName, { color: colors.text }]}>🍽️ Restoran Menü QR</Text>
                        <Text style={[styles.moduleDistCount, { color: '#F59E0B' }]}>
                          {assets.filter((a) => a.moduleType === 'menu').length} Varlık
                        </Text>
                      </View>

                      <View style={styles.moduleDistItem}>
                        <View style={[styles.moduleColorDot, { backgroundColor: '#0284C7' }]} />
                        <Text style={[styles.moduleDistName, { color: colors.text }]}>🚗 Araç & Park Tagı</Text>
                        <Text style={[styles.moduleDistCount, { color: '#0284C7' }]}>
                          {assets.filter((a) => a.moduleType === 'vehicle').length} Varlık
                        </Text>
                      </View>

                      <View style={styles.moduleDistItem}>
                        <View style={[styles.moduleColorDot, { backgroundColor: '#8B5CF6' }]} />
                        <Text style={[styles.moduleDistName, { color: colors.text }]}>💼 Dijital vCard & NFC</Text>
                        <Text style={[styles.moduleDistCount, { color: '#8B5CF6' }]}>
                          {assets.filter((a) => a.moduleType === 'vcard').length} Varlık
                        </Text>
                      </View>

                      <View style={styles.moduleDistItem}>
                        <View style={[styles.moduleColorDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.moduleDistName, { color: colors.text }]}>🐾 Pati Künyesi (Petguru)</Text>
                        <Text style={[styles.moduleDistCount, { color: '#10B981' }]}>
                          {assets.filter((a) => a.moduleType === 'pet').length} Varlık
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right: Cloud Infrastructure Status */}
                  <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>☁️ Sunucu & Altyapı Sağlığı</Text>
                    <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                      Firebase ve CDN mikroservislerinin canlı durumu
                    </Text>

                    <View style={styles.healthList}>
                      <View style={styles.healthItem}>
                        <View style={styles.healthLeft}>
                          <View style={styles.greenDot} />
                          <Text style={[styles.healthName, { color: colors.text }]}>Firestore Database</Text>
                        </View>
                        <Text style={styles.healthStatus}>%99.99 Canlı</Text>
                      </View>

                      <View style={styles.healthItem}>
                        <View style={styles.healthLeft}>
                          <View style={styles.greenDot} />
                          <Text style={[styles.healthName, { color: colors.text }]}>Cloud Storage (142.8 GB / 1 TB)</Text>
                        </View>
                        <Text style={styles.healthStatus}>Optimal (%14)</Text>
                      </View>

                      <View style={styles.healthItem}>
                        <View style={styles.healthLeft}>
                          <View style={styles.greenDot} />
                          <Text style={[styles.healthName, { color: colors.text }]}>Cloud Functions & Webhook</Text>
                        </View>
                        <Text style={styles.healthStatus}>24ms Latency</Text>
                      </View>

                      <View style={styles.healthItem}>
                        <View style={styles.healthLeft}>
                          <View style={styles.greenDot} />
                          <Text style={[styles.healthName, { color: colors.text }]}>Global CDN & DNS</Text>
                        </View>
                        <Text style={styles.healthStatus}>Cloudflare Aktif</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* TAB: MODULES MANAGEMENT (AÇIK / KAPALI & ANASAYFADA GİZLE) */}
            {activeTab === 'modules' && (
              <View style={styles.tabContainer}>
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        🧩 Platform Modülleri ve Anasayfa Görünürlük Kontrolleri
                      </Text>
                      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                        Modülleri platform genelinde açıp kapatabilir, veya anasayfada gizleyip yalnızca özel linklerle erişilebilir kılabilirsiniz. Değişiklikler anında canlıya yansır.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 14 }]}
                      onPress={() => router.push('/' as any)}
                    >
                      <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Anasayfada Gör</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.moduleControlList}>
                    {(Object.keys(moduleControls) as PlatformModuleKey[]).map((key) => {
                      const mod = moduleControls[key];
                      const isLiveOnHome = mod.isEnabled && !mod.isHiddenOnHome;

                      return (
                        <View
                          key={key}
                          style={[
                            styles.moduleControlCard,
                            {
                              backgroundColor: colors.bgSecondary,
                              borderColor: !mod.isEnabled
                                ? '#EF4444'
                                : mod.isHiddenOnHome
                                ? '#F59E0B'
                                : colors.border,
                            },
                          ]}
                        >
                          <View style={styles.moduleControlHeader}>
                            <View style={styles.moduleControlLeft}>
                              <View style={[styles.moduleIconCircle, { backgroundColor: mod.color + '25' }]}>
                                <Ionicons name={mod.icon as any} size={22} color={mod.color} />
                              </View>
                              <View>
                                <View style={styles.moduleTitleRow}>
                                  <Text style={[styles.moduleTitleText, { color: colors.text }]}>{mod.label}</Text>
                                  {/* Badge */}
                                  <View
                                    style={[
                                      styles.statusPill,
                                      {
                                        backgroundColor: !mod.isEnabled
                                          ? 'rgba(239, 68, 68, 0.15)'
                                          : mod.isHiddenOnHome
                                          ? 'rgba(245, 158, 11, 0.15)'
                                          : 'rgba(16, 185, 129, 0.15)',
                                      },
                                    ]}
                                  >
                                    <View
                                      style={[
                                        styles.statusDot,
                                        {
                                          backgroundColor: !mod.isEnabled
                                            ? '#EF4444'
                                            : mod.isHiddenOnHome
                                            ? '#F59E0B'
                                            : '#10B981',
                                        },
                                      ]}
                                    />
                                    <Text
                                      style={[
                                        styles.statusPillText,
                                        {
                                          color: !mod.isEnabled
                                            ? '#EF4444'
                                            : mod.isHiddenOnHome
                                            ? '#F59E0B'
                                            : '#10B981',
                                        },
                                      ]}
                                    >
                                      {!mod.isEnabled
                                        ? 'Platformda Kapalı'
                                        : mod.isHiddenOnHome
                                        ? 'Anasayfada Gizli'
                                        : 'Anasayfada Yayında'}
                                    </Text>
                                  </View>
                                </View>
                                <Text style={[styles.moduleDescText, { color: colors.textSecondary }]}>
                                  {mod.description}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={[styles.divider, { backgroundColor: colors.border }]} />

                          {/* Control Toggles Bar */}
                          <View style={styles.moduleControlActions}>
                            {/* Toggle 1: Platform Enable */}
                            <View style={styles.toggleItem}>
                              <Text style={[styles.toggleItemLabel, { color: colors.textSecondary }]}>
                                Platform Durumu:
                              </Text>
                              <TouchableOpacity
                                style={[
                                  styles.actionSwitchBtn,
                                  {
                                    backgroundColor: mod.isEnabled
                                      ? 'rgba(16, 185, 129, 0.12)'
                                      : 'rgba(239, 68, 68, 0.12)',
                                    borderColor: mod.isEnabled ? '#10B981' : '#EF4444',
                                  },
                                ]}
                                onPress={() => handleToggleModuleEnabled(key)}
                                activeOpacity={0.8}
                              >
                                <Ionicons
                                  name={mod.isEnabled ? 'checkmark-circle' : 'close-circle'}
                                  size={16}
                                  color={mod.isEnabled ? '#10B981' : '#EF4444'}
                                />
                                <Text
                                  style={[
                                    styles.actionSwitchText,
                                    { color: mod.isEnabled ? '#10B981' : '#EF4444' },
                                  ]}
                                >
                                  {mod.isEnabled ? 'Modül Aktif' : 'Modül Devre Dışı'}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {/* Toggle 2: Home Page Visibility */}
                            <View style={styles.toggleItem}>
                              <Text style={[styles.toggleItemLabel, { color: colors.textSecondary }]}>
                                Anasayfa Görünürlüğü:
                              </Text>
                              <TouchableOpacity
                                style={[
                                  styles.actionSwitchBtn,
                                  {
                                    backgroundColor: mod.isHiddenOnHome
                                      ? 'rgba(245, 158, 11, 0.12)'
                                      : 'rgba(2, 132, 199, 0.12)',
                                    borderColor: mod.isHiddenOnHome ? '#F59E0B' : '#0284C7',
                                  },
                                ]}
                                onPress={() => handleToggleModuleHiddenOnHome(key)}
                                activeOpacity={0.8}
                              >
                                <Ionicons
                                  name={mod.isHiddenOnHome ? 'eye-off' : 'eye'}
                                  size={16}
                                  color={mod.isHiddenOnHome ? '#F59E0B' : '#0284C7'}
                                />
                                <Text
                                  style={[
                                    styles.actionSwitchText,
                                    { color: mod.isHiddenOnHome ? '#F59E0B' : '#0284C7' },
                                  ]}
                                >
                                  {mod.isHiddenOnHome ? 'Anasayfada Gizli' : 'Anasayfada Görünüyor'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* TAB: ASSETS */}
            {activeTab === 'assets' && (
              <View style={styles.tabContainer}>
                {/* Search & Filter Bar */}
                <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.searchBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Varlık adı, bağlantı (slug), sahip ara..."
                      placeholderTextColor={colors.textMuted}
                      value={assetSearchQuery}
                      onChangeText={setAssetSearchQuery}
                    />
                    {assetSearchQuery ? (
                      <TouchableOpacity onPress={() => setAssetSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleFilterScroll}>
                    {(['all', 'event', 'vehicle', 'pet', 'vcard', 'menu'] as const).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.modulePill,
                          { borderColor: colors.border },
                          assetModuleFilter === m && { backgroundColor: colors.gold, borderColor: colors.gold },
                        ]}
                        onPress={() => setAssetModuleFilter(m)}
                      >
                        <Text
                          style={[
                            styles.modulePillText,
                            { color: assetModuleFilter === m ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {m === 'all'
                            ? 'Tümü'
                            : m === 'event'
                            ? 'Düğün'
                            : m === 'vehicle'
                            ? 'Araç'
                            : m === 'pet'
                            ? 'Pati'
                            : m === 'vcard'
                            ? 'vCard'
                            : 'Menü'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Asset Table / Cards */}
                <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {filteredAssets.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Aramanızla eşleşen QR varlığı bulunamadı.
                      </Text>
                    </View>
                  ) : (
                    filteredAssets.map((asset) => (
                      <View key={asset.id} style={[styles.assetRow, { borderBottomColor: colors.border }]}>
                        <View style={styles.assetMainInfo}>
                          <View style={styles.assetTitleRow}>
                            <Text style={[styles.assetTitle, { color: colors.text }]}>{asset.title}</Text>
                            <View
                              style={[
                                styles.assetStatusBadge,
                                {
                                  backgroundColor:
                                    asset.status === 'active'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : 'rgba(239, 68, 68, 0.15)',
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '600',
                                  color: asset.status === 'active' ? '#10B981' : '#EF4444',
                                }}
                              >
                                {asset.status === 'active' ? 'Aktif' : 'Askıya Alındı'}
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.assetMeta, { color: colors.textSecondary }]}>
                            🔗 /{asset.slug} • Sahip: {asset.ownerName} ({asset.ownerEmail}) • {asset.tier}
                          </Text>

                          <View style={styles.assetStatsRow}>
                            <Text style={[styles.assetScansText, { color: colors.gold }]}>
                              👁️ {asset.scans.toLocaleString('tr-TR')} Okutma
                            </Text>
                            <Text style={[styles.assetDateText, { color: colors.textMuted }]}>
                              Oluşturulma: {asset.createdAt}
                            </Text>
                          </View>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.assetActions}>
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                            onPress={() => router.push(`/${asset.slug}` as any)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="eye-outline" size={15} color={colors.text} />
                            <Text style={[styles.smallActionText, { color: colors.text }]}>Önizle</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.smallActionBtn,
                              {
                                backgroundColor:
                                  asset.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                borderColor: asset.status === 'active' ? '#EF4444' : '#10B981',
                              },
                            ]}
                            onPress={() => handleToggleAssetStatus(asset)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={asset.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'}
                              size={15}
                              color={asset.status === 'active' ? '#EF4444' : '#10B981'}
                            />
                            <Text
                              style={[
                                styles.smallActionText,
                                { color: asset.status === 'active' ? '#EF4444' : '#10B981' },
                              ]}
                            >
                              {asset.status === 'active' ? 'Dondur' : 'Aktifleştir'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: '#EF4444' }]}
                            onPress={() => handleDeleteAsset(asset)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={15} color="#EF4444" />
                            <Text style={[styles.smallActionText, { color: '#EF4444' }]}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && (
              <View style={styles.tabContainer}>
                {/* Search Bar */}
                <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.searchBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Kullanıcı adı, e-posta veya rol ara..."
                      placeholderTextColor={colors.textMuted}
                      value={userSearchQuery}
                      onChangeText={setUserSearchQuery}
                    />
                    {userSearchQuery ? (
                      <TouchableOpacity onPress={() => setUserSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {/* Users List */}
                <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {filteredUsers.map((user) => (
                    <View key={user.id} style={[styles.userRow, { borderBottomColor: colors.border }]}>
                      <View style={styles.userMainInfo}>
                        <View style={styles.userNameRow}>
                          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                          <View
                            style={[
                              styles.roleBadge,
                              {
                                backgroundColor:
                                  user.role === 'superadmin'
                                    ? 'rgba(197, 160, 89, 0.2)'
                                    : user.role === 'moderator'
                                    ? 'rgba(2, 132, 199, 0.2)'
                                    : 'rgba(107, 114, 128, 0.15)',
                              },
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color:
                                  user.role === 'superadmin'
                                    ? colors.gold
                                    : user.role === 'moderator'
                                    ? '#0284C7'
                                    : colors.textSecondary,
                              }}
                            >
                              {user.role.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>

                        <View style={styles.userStatsRow}>
                          <Text style={[styles.userStatText, { color: colors.textMuted }]}>
                            📦 {user.assetCount} Varlık
                          </Text>
                          <Text style={[styles.userStatText, { color: colors.gold }]}>
                            💰 ₺{user.totalSpent.toLocaleString('tr-TR')} Harcama
                          </Text>
                          <Text style={[styles.userStatText, { color: colors.textMuted }]}>
                            Son Giriş: {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                          </Text>
                        </View>
                      </View>

                      {/* User Actions */}
                      <View style={styles.userActions}>
                        <TouchableOpacity
                          style={[
                            styles.smallActionBtn,
                            {
                              backgroundColor:
                                user.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              borderColor: user.status === 'active' ? '#EF4444' : '#10B981',
                            },
                          ]}
                          onPress={() => handleToggleUserStatus(user)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={user.status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
                            size={15}
                            color={user.status === 'active' ? '#EF4444' : '#10B981'}
                          />
                          <Text
                            style={[
                              styles.smallActionText,
                              { color: user.status === 'active' ? '#EF4444' : '#10B981' },
                            ]}
                          >
                            {user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                          </Text>
                        </TouchableOpacity>

                        {user.role !== 'superadmin' && (
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                            onPress={() => {
                              const nextRole = user.role === 'moderator' ? 'user' : 'moderator';
                              handleChangeUserRole(user, nextRole);
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="shield-outline" size={15} color={colors.gold} />
                            <Text style={[styles.smallActionText, { color: colors.text }]}>
                              {user.role === 'moderator' ? 'Kullanıcı Yap' : 'Moderatör Yap'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB: FINANCE & COUPONS */}
            {activeTab === 'finance' && (
              <View style={styles.tabContainer}>
                {/* Top Coupons Header */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>🎟️ İndirim & Kampanya Kuponları</Text>
                      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                        Müşterilerin tarife ve ürünlerde kullandığı promosyon kodları
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 14 }]}
                      onPress={() => setCouponModalOpen(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Yeni Kupon Oluştur</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.couponGrid}>
                    {coupons.map((c) => (
                      <View
                        key={c.code}
                        style={[
                          styles.couponCard,
                          {
                            backgroundColor: colors.bgSecondary,
                            borderColor: c.isActive ? colors.goldBorder : colors.border,
                          },
                        ]}
                      >
                        <View style={styles.couponTop}>
                          <Text style={[styles.couponCodeText, { color: colors.gold }]}>{c.code}</Text>
                          <TouchableOpacity onPress={() => handleToggleCoupon(c.code)}>
                            <Ionicons
                              name={c.isActive ? 'checkmark-circle' : 'close-circle'}
                              size={20}
                              color={c.isActive ? '#10B981' : '#EF4444'}
                            />
                          </TouchableOpacity>
                        </View>

                        <Text style={[styles.couponDesc, { color: colors.text }]}>
                          %{c.value} İndirim {c.tier ? `(${c.tier.toUpperCase()})` : ''}
                        </Text>

                        <View style={styles.couponBottom}>
                          <Text style={[styles.couponUsage, { color: colors.textMuted }]}>
                            Kullanım: {c.usedCount} / {c.maxUsage}
                          </Text>
                          <TouchableOpacity onPress={() => handleDeleteCoupon(c.code)}>
                            <Ionicons name="trash-outline" size={15} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Orders / Transactions List */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeaderBetween}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>💳 Son Siparişler ve Ödemeler</Text>
                      <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                        Platform üzerinden gerçekleşen dijital paket ve fiziksel kart satışları
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.searchBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border, marginBottom: 16 }]}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.searchInput, { color: colors.text }]}
                      placeholder="Sipariş no, müşteri veya paket adı ara..."
                      placeholderTextColor={colors.textMuted}
                      value={orderSearchQuery}
                      onChangeText={setOrderSearchQuery}
                    />
                  </View>

                  {filteredOrders.map((order) => (
                    <View key={order.id} style={[styles.orderRow, { borderBottomColor: colors.border }]}>
                      <View style={styles.orderLeft}>
                        <View style={[styles.orderIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                          <Ionicons name="receipt-outline" size={20} color="#10B981" />
                        </View>
                        <View>
                          <Text style={[styles.orderNum, { color: colors.text }]}>{order.orderNumber}</Text>
                          <Text style={[styles.orderTitle, { color: colors.textSecondary }]}>{order.title}</Text>
                          <Text style={[styles.orderCustomer, { color: colors.textMuted }]}>
                            {order.userName} • {order.paymentMethod} • {order.date}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderRight}>
                        <Text style={[styles.orderAmount, { color: colors.text }]}>
                          ₺{order.amount.toLocaleString('tr-TR')}
                        </Text>
                        <View style={styles.orderStatusBadge}>
                          <Text style={styles.orderStatusText}>Tamamlandı</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <View style={styles.tabContainer}>
                {/* Platform Maintenance & Controls */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>🛠️ Platform Bakım & Acil Durum Kontrolleri</Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Sistem genelinde anlık müdahale seçenekleri
                  </Text>

                  <View style={styles.settingsRow}>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingName, { color: colors.text }]}>Genel Bakım Modu</Text>
                      <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                        Aktif edildiğinde sadece yöneticiler panele ve sayfalara erişebilir, ziyaretçilere bakım ekranı gösterilir.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        {
                          backgroundColor: settings?.maintenanceMode ? '#EF4444' : '#10B981',
                        },
                      ]}
                      onPress={handleToggleMaintenance}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.toggleBtnText}>
                        {settings?.maintenanceMode ? 'Bakım Modunu Kapat' : 'Bakım Modunu Aç'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Global Announcement */}
                  <View style={styles.settingsRow}>
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingName, { color: colors.text }]}>Global Duyuru Banner'ı</Text>
                      <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                        Tüm kullanıcılara ve ziyaretçilere gösterilen platform duyurusu.
                      </Text>
                      <Text style={[styles.announcementPreview, { color: colors.gold }]}>
                        Mevcut: "{settings?.globalAnnouncement}"
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: colors.gold, paddingVertical: 8, paddingHorizontal: 14 }]}
                      onPress={() => setAnnouncementModalOpen(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="megaphone-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryBtnText}>Duyuruyu Güncelle</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Storage & Limits Policies */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>📁 Depolama ve Kota Politikaları</Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Yeni kullanıcılar ve varlıklar için başlangıç limitleri
                  </Text>

                  <View style={styles.policyGrid}>
                    <View style={[styles.policyCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                      <Text style={[styles.policyValue, { color: colors.gold }]}>
                        {settings?.defaultFreeStorageMB || 500} MB
                      </Text>
                      <Text style={[styles.policyLabel, { color: colors.text }]}>Varsayılan Ücretsiz Alan</Text>
                      <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
                        Her yeni etkinlik için tahsis edilen başlangıç alanı.
                      </Text>
                    </View>

                    <View style={[styles.policyCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                      <Text style={[styles.policyValue, { color: '#0284C7' }]}>
                        {settings?.maxUploadSizeMB || 25} MB
                      </Text>
                      <Text style={[styles.policyLabel, { color: colors.text }]}>Maksimum Tek Dosya Boyutu</Text>
                      <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
                        Misafir yüklemelerinde izin verilen maksimum görsel/video limiti.
                      </Text>
                    </View>

                    <View style={[styles.policyCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                      <Text style={[styles.policyValue, { color: '#10B981' }]}>Aktif</Text>
                      <Text style={[styles.policyLabel, { color: colors.text }]}>Otomatik Moderasyon</Text>
                      <Text style={[styles.policyDesc, { color: colors.textSecondary }]}>
                        Yapay zeka görsel filtreleme ve NSFW koruma kalkanı.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* MODAL: Yeni Kupon */}
      <Modal visible={couponModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni İndirim Kuponu Oluştur</Text>
              <TouchableOpacity onPress={() => setCouponModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>Kupon Kodu (Büyük Harf)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Örn: YAZINDIRIMI30"
              placeholderTextColor={colors.textMuted}
              value={newCouponCode}
              onChangeText={(t) => setNewCouponCode(t.toUpperCase())}
            />

            <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>İndirim Oranı (%)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Örn: 25"
              placeholderTextColor={colors.textMuted}
              value={newCouponDiscount}
              onChangeText={setNewCouponDiscount}
              keyboardType="number-pad"
            />

            <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>Maksimum Kullanım Limiti</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.bgSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Örn: 100"
              placeholderTextColor={colors.textMuted}
              value={newCouponMaxUsage}
              onChangeText={setNewCouponMaxUsage}
              keyboardType="number-pad"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => setCouponModalOpen(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
                onPress={handleCreateCoupon}
              >
                <Text style={styles.primaryBtnText}>Kuponu Tanımla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Global Duyuru */}
      <Modal visible={announcementModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Platform Global Duyurusu</Text>
              <TouchableOpacity onPress={() => setAnnouncementModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalInputLabel, { color: colors.textSecondary }]}>Duyuru Metni</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                  height: 90,
                  textAlignVertical: 'top',
                },
              ]}
              multiline
              numberOfLines={3}
              placeholder="Tüm kullanıcılara gösterilecek duyuru metnini yazınız..."
              placeholderTextColor={colors.textMuted}
              value={announcementText}
              onChangeText={setAnnouncementText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
                onPress={() => setAnnouncementModalOpen(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.gold }]}
                onPress={handleSaveAnnouncement}
              >
                <Text style={styles.primaryBtnText}>Duyuruyu Yayınla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors, isMobile: boolean, isWide: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
    },

    // --- LOCK SCREEN ---
    lockContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    lockBox: {
      width: '100%',
      maxWidth: 440,
      alignItems: 'center',
    },
    lockIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    lockTitle: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: 8,
      textAlign: 'center',
    },
    lockSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 24,
    },
    pinInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    pinInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
    },
    pinErrorText: {
      color: '#EF4444',
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 12,
      alignSelf: 'flex-start',
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 48,
      borderRadius: 12,
      marginTop: 10,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    quickBypassBtn: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      marginTop: 14,
    },
    quickBypassText: {
      fontSize: 13,
      fontWeight: '600',
    },
    backLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      gap: 6,
    },
    backLinkText: {
      fontSize: 14,
      fontWeight: '500',
    },

    // --- TOP BAR ---
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isMobile ? 16 : 28,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#DC2626',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    adminBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    topBarTitle: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: '800',
    },
    livePulseWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginLeft: 4,
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },
    livePulseText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#10B981',
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topBarActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    topBarActionText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // --- TABS BAR ---
    tabsBar: {
      borderBottomWidth: 1,
    },
    tabsScroll: {
      paddingHorizontal: isMobile ? 12 : 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabBtn: {
      borderBottomWidth: 2,
    },
    tabBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // --- SCROLL CONTENT ---
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      padding: isMobile ? 16 : 28,
      paddingBottom: 60,
    },
    tabContainer: {
      gap: 20,
    },

    // --- OVERVIEW: KPI GRID ---
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    kpiCard: {
      flex: 1,
      minWidth: isMobile ? '47%' : 200,
      padding: 18,
      borderRadius: 14,
      borderWidth: 1,
    },
    kpiIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    kpiValue: {
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 4,
    },
    kpiLabel: {
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 6,
    },
    kpiGrowth: {
      fontSize: 11,
      fontWeight: '700',
      color: '#10B981',
    },

    // --- QUICK MODULE ROW (in Overview) ---
    quickModuleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    quickModulePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    quickModuleText: {
      fontSize: 12,
      fontWeight: '700',
    },

    // --- MODULE CONTROLS TAB ---
    moduleControlList: {
      gap: 16,
    },
    moduleControlCard: {
      padding: 18,
      borderRadius: 14,
      borderWidth: 1,
    },
    moduleControlHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moduleControlLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    moduleIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moduleTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    moduleTitleText: {
      fontSize: 16,
      fontWeight: '800',
    },
    moduleDescText: {
      fontSize: 13,
      lineHeight: 18,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: '700',
    },
    moduleControlActions: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
    },
    toggleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    toggleItemLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    actionSwitchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionSwitchText: {
      fontSize: 13,
      fontWeight: '700',
    },

    // --- SECTIONS ---
    sectionRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 16,
    },
    sectionCard: {
      padding: 20,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },
    sectionSub: {
      fontSize: 13,
      marginBottom: 16,
    },
    sectionHeaderBetween: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
      marginBottom: 16,
    },

    // --- MODULE DIST ---
    moduleDistList: {
      gap: 12,
    },
    moduleDistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    moduleColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    moduleDistName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    moduleDistCount: {
      fontSize: 13,
      fontWeight: '700',
    },

    // --- HEALTH ---
    healthList: {
      gap: 12,
    },
    healthItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    healthLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    greenDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },
    healthName: {
      fontSize: 14,
      fontWeight: '500',
    },
    healthStatus: {
      fontSize: 12,
      fontWeight: '700',
      color: '#10B981',
    },

    // --- FILTER BAR ---
    filterBar: {
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
      marginBottom: 12,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 42,
      borderRadius: 10,
      borderWidth: 1,
      flex: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    moduleFilterScroll: {
      flexGrow: 0,
    },
    modulePill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      marginRight: 8,
    },
    modulePillText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // --- ASSETS & USERS TABLE ---
    tableContainer: {
      borderRadius: 14,
      borderWidth: 1,
      overflow: 'hidden',
    },
    emptyWrap: {
      alignItems: 'center',
      padding: 40,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
    },
    assetRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      padding: 16,
      borderBottomWidth: 1,
      gap: 12,
    },
    assetMainInfo: {
      flex: 1,
    },
    assetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    assetTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    assetStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    assetMeta: {
      fontSize: 13,
      marginBottom: 6,
    },
    assetStatsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    assetScansText: {
      fontSize: 12,
      fontWeight: '700',
    },
    assetDateText: {
      fontSize: 12,
    },
    assetActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    smallActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
    },
    smallActionText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // --- USERS TABLE ---
    userRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      padding: 16,
      borderBottomWidth: 1,
      gap: 12,
    },
    userMainInfo: {
      flex: 1,
    },
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
    },
    userName: {
      fontSize: 15,
      fontWeight: '700',
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    userEmail: {
      fontSize: 13,
      marginBottom: 6,
    },
    userStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    userStatText: {
      fontSize: 12,
      fontWeight: '500',
    },
    userActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    // --- COUPONS ---
    couponGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    couponCard: {
      flex: 1,
      minWidth: isMobile ? '100%' : 220,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    couponTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    couponCodeText: {
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 1,
    },
    couponDesc: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 10,
    },
    couponBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    couponUsage: {
      fontSize: 11,
    },

    // --- ORDERS ---
    orderRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      gap: 10,
    },
    orderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    orderIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    orderNum: {
      fontSize: 14,
      fontWeight: '800',
    },
    orderTitle: {
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    orderCustomer: {
      fontSize: 11,
      marginTop: 2,
    },
    orderRight: {
      alignItems: isMobile ? 'flex-start' : 'flex-end',
    },
    orderAmount: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 4,
    },
    orderStatusBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    orderStatusText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#10B981',
    },

    // --- SETTINGS TAB ---
    settingsRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 14,
      paddingVertical: 12,
    },
    settingInfo: {
      flex: 1,
    },
    settingName: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 4,
    },
    settingDesc: {
      fontSize: 13,
      lineHeight: 18,
    },
    announcementPreview: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 6,
      fontStyle: 'italic',
    },
    toggleBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    toggleBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      marginVertical: 14,
    },
    policyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    policyCard: {
      flex: 1,
      minWidth: isMobile ? '100%' : 220,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
    },
    policyValue: {
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 6,
    },
    policyLabel: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 4,
    },
    policyDesc: {
      fontSize: 12,
      lineHeight: 16,
    },

    // --- MODAL ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalBox: {
      width: '100%',
      maxWidth: 480,
      padding: 22,
      borderRadius: 16,
      borderWidth: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
    },
    modalInputLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 10,
    },
    modalInput: {
      width: '100%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      fontSize: 14,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20,
    },
    secondaryBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
  });
}
