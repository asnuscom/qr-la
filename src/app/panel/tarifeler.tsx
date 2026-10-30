import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { ecosystemService, EcosystemAsset } from '@/services/ecosystemService';
import { COUPON_CODES, PLAN_TIERS, ECOSYSTEM_PACKAGES, DEMO_HOST_UID } from '@/services/mockData';
import { EventModel, PlanTierConfig, StorageTier } from '@/types';
import { paymentService, PaymentItem, TransactionRecord } from '@/services/paymentService';
import PaymentModal from '@/components/PaymentModal';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

type PricingModuleTab = 'wedding' | 'vehicle' | 'pet' | 'vcard' | 'menu' | 'suite' | 'history';

const TIER_RANKS: Record<StorageTier, number> = {
  free: 0,
  standart: 1,
  premium: 2,
  vip: 3,
};

export default function PricingUpgradeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { slug: paramSlug, tab: paramTab } = useLocalSearchParams<{ slug?: string; tab?: string }>();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  const currentUser = authService.getState().user;
  const [userAssets, setUserAssets] = useState<EcosystemAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<EcosystemAsset | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  // Aktif Sekme (Modül bazlı)
  const [activeTab, setActiveTab] = useState<PricingModuleTab>(
    (paramTab as PricingModuleTab) || 'wedding'
  );

  // Etkinlik detayları (eğer seçili varlık etkinlikse)
  const [event, setEvent] = useState<EventModel | null>(null);

  // Kupon Kodu State'i
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  // Ödeme Modalı
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PaymentItem | null>(null);

  // İşlem Geçmişi
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Modül Bazlı Paketler & Havale ile Ödeme | QR-la';
    }
  }, []);

  // 1. Kullanıcının Tüm QR Varlıklarını Yükle
  useEffect(() => {
    async function loadAssets() {
      setIsLoadingAssets(true);
      try {
        const assets = await ecosystemService.getAllUserAssets(
          currentUser?.uid || DEMO_HOST_UID
        );
        setUserAssets(assets);

        // Hedef varlığı belirle
        let target: EcosystemAsset | null = null;
        if (paramSlug) {
          target = assets.find((a) => a.slug === paramSlug) || null;
        }
        if (!target && assets.length > 0) {
          target = assets[0];
        }
        setSelectedAsset(target);

        // Eğer hedef varlık bir modüle aitse ve URL'de tab belirtilmemişse sekmeyi otomatik ayarla
        if (target && !paramTab) {
          switch (target.moduleType) {
            case 'event':
              setActiveTab('wedding');
              break;
            case 'vehicle':
              setActiveTab('vehicle');
              break;
            case 'pet':
              setActiveTab('pet');
              break;
            case 'vcard':
              setActiveTab('vcard');
              break;
            case 'menu':
              setActiveTab('menu');
              break;
          }
        }
      } catch (err) {
        console.warn('Error loading user assets for pricing:', err);
      } finally {
        setIsLoadingAssets(false);
      }
    }

    loadAssets();
  }, [currentUser?.uid, paramSlug]);

  // 2. Seçili Varlık Etkinlik ise Etkinlik Detayını Yükle
  const loadEvent = async (slugToLoad: string) => {
    try {
      const ev = await eventService.getEvent(slugToLoad, currentUser?.displayName);
      if (ev) setEvent(ev);
    } catch (err) {
      console.warn('Tarifeler getEvent error:', err);
    }
  };

  const loadTransactions = () => {
    const list = paymentService.getTransactions();
    setTransactions(list);
  };

  useEffect(() => {
    if (selectedAsset && selectedAsset.moduleType === 'event') {
      loadEvent(selectedAsset.slug);
    } else if (paramSlug) {
      loadEvent(paramSlug);
    }
    loadTransactions();
  }, [selectedAsset?.slug, paramSlug]);

  // Varlık Değiştirildiğinde
  const handleSelectAsset = (asset: EcosystemAsset) => {
    setSelectedAsset(asset);
    if (asset.moduleType === 'event') {
      setActiveTab('wedding');
      loadEvent(asset.slug);
    } else if (asset.moduleType === 'vehicle') {
      setActiveTab('vehicle');
    } else if (asset.moduleType === 'pet') {
      setActiveTab('pet');
    } else if (asset.moduleType === 'vcard') {
      setActiveTab('vcard');
    } else if (asset.moduleType === 'menu') {
      setActiveTab('menu');
    }
  };

  const activeSlug = selectedAsset?.slug || paramSlug || 'samet-sule';

  // Kupon Kodu Uygulama
  const applyCouponCode = async (codeToApply: string) => {
    const cleanCode = (codeToApply || '').trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Kupon Kodu Gerekli', 'Lütfen yükseltme yapmak için bir kupon kodu giriniz.');
      return;
    }

    const coupon = COUPON_CODES[cleanCode];
    if (!coupon) {
      const disc = paymentService.checkCoupon(cleanCode, 3990);
      if (disc.valid) {
        handleSelectEventPlan(PLAN_TIERS[2], cleanCode);
        return;
      }
      Alert.alert('Geçersiz Kupon', 'Girdiğiniz kupon kodu bulunamadı veya süresi dolmuş.');
      return;
    }

    setIsApplyingCoupon(true);
    setTimeout(async () => {
      try {
        if (event) {
          const updated = await eventService.applyVipCoupon(activeSlug, cleanCode);
          if (updated) {
            setEvent(updated);
            setCouponSuccessMessage(
              `🎉 Tebrikler! "${coupon.tierName}" paketi ${activeSlug} sayfasına başarıyla tanımlandı.`
            );
            Alert.alert('Başarılı', `${coupon.tierName} paketi başarıyla etkinleştirildi!`);
            setCouponInput('');
          }
        } else {
          Alert.alert('Başarılı', `Kupon kodu onaylandı: ${coupon.tierName}`);
        }
      } catch (err: any) {
        Alert.alert('Hata', err.message || 'Kupon uygulanırken bir hata oluştu.');
      } finally {
        setIsApplyingCoupon(false);
      }
    }, 400);
  };

  const currentTier: StorageTier = event?.storage?.tier || 'vip';

  const getTierDisplay = (tier: StorageTier) => {
    switch (tier) {
      case 'vip':
        return { name: 'VIP Masalsı Düğün', color: '#6366F1', quota: '15 GB (Sınırsız)' };
      case 'premium':
        return { name: 'Premium Düğün', color: '#10B981', quota: '5 GB' };
      case 'standart':
        return { name: 'Standart Kutlama', color: '#3B82F6', quota: '2 GB' };
      default:
        return { name: 'Ücretsiz Başlangıç', color: '#94A3B8', quota: '500 MB' };
    }
  };

  const currentTierInfo = getTierDisplay(currentTier);

  // Düğün Planı Seçildiğinde
  const handleSelectEventPlan = (tier: PlanTierConfig, appliedCoupon?: string) => {
    if (tier.priceTL === 0) {
      Alert.alert('Başlangıç Paketi', 'Ücretsiz başlangıç paketi varsayılan olarak etkindir.');
      return;
    }

    if (appliedCoupon) {
      setCouponInput(appliedCoupon);
    }

    setSelectedPaymentItem({
      id: `plan-${tier.tier}`,
      title: `${tier.name} (${tier.quotaMB >= 1024 ? tier.quotaMB / 1024 + ' GB' : tier.quotaMB + ' MB'})`,
      category: 'event_tier',
      price: tier.priceTL,
      period: 'tek_seferlik',
      targetSlug: activeSlug,
      tier: tier.tier,
      retentionDays: tier.retentionDays,
      quotaMB: tier.quotaMB,
      badge: tier.isPopular ? 'En Çok Tercih Edilen' : undefined,
      description: `${tier.quotaMB >= 1024 ? tier.quotaMB / 1024 + ' GB' : tier.quotaMB + ' MB'} depolama ve ${
        tier.retentionDays
      } gün güvenli bulut arşivi. [Hedef: qr-la.com/${activeSlug}]`,
      features: tier.features,
    });
    setPaymentModalVisible(true);
  };

  // Diğer Modül Paketleri Seçildiğinde
  const handleSelectEcosystemPackage = (pkg: (typeof ECOSYSTEM_PACKAGES)[0]) => {
    setSelectedPaymentItem({
      id: pkg.id,
      title: pkg.title,
      category: pkg.category,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      period: pkg.period,
      targetSlug: activeSlug,
      badge: pkg.badge,
      description: `${pkg.description} [Hedef: qr-la.com/${activeSlug}]`,
      features: pkg.features,
    });
    setPaymentModalVisible(true);
  };

  // Ödeme Başarıyla Tamamlandığında
  const handlePaymentSuccess = (transaction: TransactionRecord) => {
    if (transaction.category === 'event_tier' && selectedAsset?.slug) {
      loadEvent(selectedAsset.slug);
    }
    loadTransactions();
  };

  // Modül Paketlerini Filtreleme
  const vehiclePackages = ECOSYSTEM_PACKAGES.filter((p) => p.id === 'pkg-vehicle-pro');
  const petPackages = ECOSYSTEM_PACKAGES.filter((p) => p.id === 'pkg-petguru-pro');
  const vcardPackages = ECOSYSTEM_PACKAGES.filter((p) => p.id === 'pkg-vcard-nfc');
  const menuPackages = ECOSYSTEM_PACKAGES.filter((p) => p.id === 'pkg-menu-pro');
  const suitePackages = ECOSYSTEM_PACKAGES.filter((p) => p.category === 'suite_license');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Üst Navigasyon Barı */}
        <View style={[styles.navBar, { backgroundColor: colors.navBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={[styles.backBtnText, { color: colors.text }]}>Panele Dön</Text>
          </TouchableOpacity>

          <View style={styles.navTitleBox}>
            <Text style={[styles.navTitle, { color: colors.text }]}>Paketler & Modüler Tarifeler</Text>
            <Text style={[styles.navSub, { color: colors.gold }]}>
              {selectedAsset ? `Seçili: qr-la.com/${selectedAsset.slug}` : `Hedef: qr-la.com/${activeSlug}`}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeToggleBtn size="sm" />
            <TouchableOpacity
              style={styles.panelLinkBtn}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="apps-outline" size={16} color={colors.gold} />
              {!isMobile && <Text style={styles.panelLinkText}>Ortak Panel</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* 1. HEDEF VARLIK SEÇİCİ (Çoklu Sayfa & Modül Desteği) */}
          <View style={[styles.assetSelectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.assetSelectorHeader}>
              <View style={styles.assetSelectorTitleRow}>
                <View style={styles.selectorIconWrap}>
                  <Ionicons name="qr-code" size={18} color="#6366F1" />
                </View>
                <View>
                  <Text style={[styles.assetSelectorTitle, { color: colors.text }]}>
                    Paket Tanımlanacak QR Varlık
                  </Text>
                  <Text style={[styles.assetSelectorSubtitle, { color: colors.textSecondary }]}>
                    Birden fazla sayfanız veya QR kodunuz olabilir; yükseltmek istediğiniz varlığı seçin.
                  </Text>
                </View>
              </View>

              {selectedAsset && (
                <View style={[styles.activeTargetBadge, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                  <Text style={styles.activeTargetBadgeText}>
                    Aktif: qr-la.com/{selectedAsset.slug}
                  </Text>
                </View>
              )}
            </View>

            {isLoadingAssets ? (
              <ActivityIndicator size="small" color="#6366F1" style={{ marginVertical: 12 }} />
            ) : userAssets.length === 0 ? (
              <View style={styles.noAssetBox}>
                <Text style={[styles.noAssetText, { color: colors.textSecondary }]}>
                  Kayıtlı varlığınız bulunamadı. Genel demo şablonu üzerinden tarife görüntülüyorsunuz.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.assetPillsRow}
              >
                {userAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const iconName =
                    asset.moduleType === 'event'
                      ? 'heart'
                      : asset.moduleType === 'vehicle'
                      ? 'car-sport'
                      : asset.moduleType === 'pet'
                      ? 'paw'
                      : asset.moduleType === 'vcard'
                      ? 'card'
                      : 'restaurant';

                  return (
                    <TouchableOpacity
                      key={asset.id}
                      style={[
                        styles.assetPill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#6366F1'
                              : '#1A1817'
                            : colors.surface,
                          borderColor: isSelected
                            ? isDark
                              ? '#6366F1'
                              : '#1A1817'
                            : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectAsset(asset)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={15}
                        color={
                          isSelected
                            ? isDark
                              ? '#1A1817'
                              : '#FFFFFF'
                            : asset.color || colors.gold
                        }
                      />
                      <View>
                        <Text
                          style={[
                            styles.assetPillTitle,
                            {
                              color: isSelected
                                ? isDark
                                ? '#1A1817'
                                : '#FFFFFF'
                                : colors.text,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {asset.title}
                        </Text>
                        <Text
                          style={[
                            styles.assetPillSlug,
                            {
                              color: isSelected
                                ? isDark
                                  ? 'rgba(26, 24, 23, 0.7)'
                                  : 'rgba(255, 255, 255, 0.7)'
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          qr-la.com/{asset.slug}
                        </Text>
                      </View>

                      {asset.badge && (
                        <View
                          style={[
                            styles.assetPillBadge,
                            {
                              backgroundColor: isSelected
                                ? isDark
                                  ? 'rgba(26, 24, 23, 0.2)'
                                  : 'rgba(255, 255, 255, 0.2)'
                                : colors.card,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.assetPillBadgeText,
                              {
                                color: isSelected
                                  ? isDark
                                    ? '#1A1817'
                                    : '#FFFFFF'
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {asset.badge}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* 2. AKTİF PAKET ÖZETİ (Seçili Varlığa Göre Dinamik) */}
          {selectedAsset && selectedAsset.moduleType === 'event' && event ? (
            <View style={[styles.currentPlanBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.currentPlanHeader}>
                <View style={styles.currentPlanTitleRow}>
                  <Ionicons name="shield-checkmark" size={18} color={currentTierInfo.color} />
                  <Text style={[styles.currentPlanLabel, { color: colors.textSecondary }]}>
                    SEÇİLİ ETKİNLİK MEVCUT PAKETİ
                  </Text>
                </View>
                <View style={[styles.currentTierBadge, { backgroundColor: currentTierInfo.color + '25' }]}>
                  <Text style={[styles.currentTierBadgeText, { color: currentTierInfo.color }]}>
                    {currentTier.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.currentPlanName, { color: colors.text }]}>
                {event.title} • {currentTierInfo.name}
              </Text>

              <View style={styles.currentPlanDetailsRow}>
                <Text style={[styles.currentPlanDetail, { color: colors.textSecondary }]}>
                  📦 Depolama Kotası:{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>{currentTierInfo.quota}</Text>
                </Text>
                {event.storage?.expiresAt && (
                  <Text style={[styles.currentPlanDetail, { color: colors.textSecondary }]}>
                    ⏳ Bitiş:{' '}
                    <Text style={{ fontWeight: '700', color: colors.text }}>
                      {new Date(event.storage.expiresAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          ) : selectedAsset ? (
            <View style={[styles.currentPlanBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.currentPlanHeader}>
                <View style={styles.currentPlanTitleRow}>
                  <Ionicons name="sparkles" size={18} color="#6366F1" />
                  <Text style={[styles.currentPlanLabel, { color: colors.textSecondary }]}>
                    SEÇİLİ QR LİSANS DURUMU
                  </Text>
                </View>
                <View style={[styles.currentTierBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.currentTierBadgeText, { color: '#10B981' }]}>
                    {selectedAsset.statusLabel || 'AKTİF'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.currentPlanName, { color: colors.text }]}>
                {selectedAsset.title} ({selectedAsset.subtitle})
              </Text>

              <View style={styles.currentPlanDetailsRow}>
                <Text style={[styles.currentPlanDetail, { color: colors.textSecondary }]}>
                  🌐 Canlı Link:{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    qr-la.com{selectedAsset.liveUrl}
                  </Text>
                </Text>
                <Text style={[styles.currentPlanDetail, { color: colors.textSecondary }]}>
                  🛡️ Lisans:{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {selectedAsset.badge || 'Modüler Plan'}
                  </Text>
                </Text>
              </View>
            </View>
          ) : null}

          {/* 3. KUPON KODU ALANI */}
          <View style={[styles.couponCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.couponHeader}>
              <View style={styles.couponIconBox}>
                <Ionicons name="gift" size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.couponTitle, { color: colors.text }]}>Kupon & Promosyon Kodu</Text>
                <Text style={[styles.couponSubtitle, { color: colors.textSecondary }]}>
                  Özel promosyon kodunuz varsa girerek seçili QR varlığınıza anında indirim uygulayın.
                </Text>
              </View>
            </View>

            <View style={styles.couponInputRow}>
              <TextInput
                style={[
                  styles.couponInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={couponInput}
                onChangeText={(val) => setCouponInput(val.toUpperCase())}
                placeholder="Örn: ASNUSVIP, YUZDE20, HOSGELDIN"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[
                  styles.applyCouponBtn,
                  (!couponInput.trim() || isApplyingCoupon) && { opacity: 0.6 },
                ]}
                onPress={() => applyCouponCode(couponInput)}
                disabled={!couponInput.trim() || isApplyingCoupon}
                activeOpacity={0.8}
              >
                {isApplyingCoupon ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                    <Text style={styles.applyCouponBtnText}>Uygula</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {couponSuccessMessage && (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successAlertText}>{couponSuccessMessage}</Text>
              </View>
            )}
          </View>

          {/* 4. MODÜL BAZLI TARİFE SEKME ÇUBUĞU */}
          <View style={styles.tabScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabBar}
            >
              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'wedding' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('wedding')}
              >
                <Ionicons
                  name="heart"
                  size={15}
                  color={activeTab === 'wedding' ? '#6366F1' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'wedding' && styles.categoryTabTextActive,
                  ]}
                >
                  💍 Düğün & Etkinlik
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'vehicle' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('vehicle')}
              >
                <Ionicons
                  name="car-sport"
                  size={15}
                  color={activeTab === 'vehicle' ? '#0284C7' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'vehicle' && styles.categoryTabTextActive,
                  ]}
                >
                  🚗 Araç & Park Tagı
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'pet' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('pet')}
              >
                <Ionicons
                  name="paw"
                  size={15}
                  color={activeTab === 'pet' ? '#10B981' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'pet' && styles.categoryTabTextActive,
                  ]}
                >
                  🐾 Pati Künyesi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'vcard' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('vcard')}
              >
                <Ionicons
                  name="card"
                  size={15}
                  color={activeTab === 'vcard' ? '#F59E0B' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'vcard' && styles.categoryTabTextActive,
                  ]}
                >
                  💼 Dijital Kartvizit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'menu' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('menu')}
              >
                <Ionicons
                  name="restaurant"
                  size={15}
                  color={activeTab === 'menu' ? '#8B5CF6' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'menu' && styles.categoryTabTextActive,
                  ]}
                >
                  🍽️ Restoran Menüsü
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'suite' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('suite')}
              >
                <Ionicons
                  name="diamond"
                  size={15}
                  color={activeTab === 'suite' ? '#6366F1' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'suite' && styles.categoryTabTextActive,
                  ]}
                >
                  👑 Kurumsal Suite
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryTabBtn,
                  activeTab === 'history' && styles.categoryTabBtnActive,
                ]}
                onPress={() => setActiveTab('history')}
              >
                <Ionicons
                  name="receipt-outline"
                  size={15}
                  color={activeTab === 'history' ? '#6366F1' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeTab === 'history' && styles.categoryTabTextActive,
                  ]}
                >
                  🧾 Faturalarım ({transactions.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* 5. TARİFE KARTLARI */}

          {/* MODÜL 1: DÜĞÜN & ETKİNLİK PAKETLERİ */}
          {activeTab === 'wedding' && (
            <View style={styles.plansContainer}>
              {PLAN_TIERS.map((tier) => {
                const isCurrent = currentTier === tier.tier;
                const isPopular = tier.isPopular;
                const currentRank = TIER_RANKS[currentTier] ?? 0;
                const tierRank = TIER_RANKS[tier.tier] ?? 0;
                const isDowngrade = tierRank < currentRank;

                let btnText = 'Bu Paketi Seç';
                if (isCurrent) btnText = '✓ Mevcut Paketiniz';
                else if (isDowngrade) btnText = 'Daha Düşük Seviye';
                else if (tier.priceTL === 0) btnText = 'Varsayılan Plan';
                else btnText = `${tier.priceTL.toLocaleString('tr-TR')} ₺ ile Yükselt`;

                return (
                  <View
                    key={tier.tier}
                    style={[
                      styles.planCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isPopular && styles.planCardPopular,
                      isCurrent && styles.planCardCurrent,
                    ]}
                  >
                    {isPopular && (
                      <View style={styles.popularBadge}>
                        <Ionicons name="star" size={12} color="#0F172A" />
                        <Text style={styles.popularBadgeText}>EN POPÜLER</Text>
                      </View>
                    )}

                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={styles.currentBadgeText}>AKTİF PLAN</Text>
                      </View>
                    )}

                    <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>

                    <View style={styles.priceRow}>
                      <Text style={[styles.priceText, { color: colors.text }]}>
                        {tier.priceTL === 0 ? 'Ücretsiz' : `${tier.priceTL.toLocaleString('tr-TR')} ₺`}
                      </Text>
                      {tier.priceTL > 0 && <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ tek seferlik</Text>}
                    </View>

                    <View style={[styles.quotaBadge, { backgroundColor: colors.surface }]}>
                      <Ionicons name="cloud-upload-outline" size={15} color="#6366F1" />
                      <Text style={[styles.quotaBadgeText, { color: colors.text }]}>
                        {tier.quotaMB >= 1024 ? tier.quotaMB / 1024 + ' GB' : tier.quotaMB + ' MB'} Bulut Kotası
                      </Text>
                    </View>

                    <View style={styles.features}>
                      {tier.features.map((feat, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                          <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.chooseBtn,
                        isPopular && styles.chooseBtnPopular,
                        (isCurrent || isDowngrade) && styles.chooseBtnDisabled,
                      ]}
                      onPress={() => handleSelectEventPlan(tier)}
                      disabled={isCurrent || isDowngrade}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.chooseBtnText,
                          isPopular && styles.chooseBtnTextPopular,
                          (isCurrent || isDowngrade) && styles.chooseBtnTextDisabled,
                        ]}
                      >
                        {btnText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* MODÜL 2: ARAÇ & PARK TAGI */}
          {activeTab === 'vehicle' && (
            <View style={styles.plansContainer}>
              {vehiclePackages.map((pkg) => (
                <View
                  key={pkg.id}
                  style={[styles.planCard, styles.planCardPopular, { backgroundColor: colors.card, borderColor: '#0284C7' }]}
                >
                  <View style={[styles.popularBadge, { backgroundColor: '#0284C7' }]}>
                    <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                    <Text style={[styles.popularBadgeText, { color: '#FFFFFF' }]}>HAYAT KURTARAN</Text>
                  </View>

                  <Text style={[styles.tierName, { color: colors.text }]}>{pkg.title}</Text>
                  <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>{pkg.price} ₺</Text>
                    {pkg.originalPrice ? (
                      <Text style={styles.originalPriceText}>{pkg.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ {pkg.period}</Text>
                  </View>

                  <View style={styles.features}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#0284C7" />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, { backgroundColor: '#0284C7' }]}
                    onPress={() => handleSelectEcosystemPackage(pkg)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={[styles.chooseBtnText, { color: '#FFFFFF' }]}>
                      Araç Tagını Yükselt ({pkg.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* MODÜL 3: PATİ KÜNYESİ */}
          {activeTab === 'pet' && (
            <View style={styles.plansContainer}>
              {petPackages.map((pkg) => (
                <View
                  key={pkg.id}
                  style={[styles.planCard, styles.planCardPopular, { backgroundColor: colors.card, borderColor: '#10B981' }]}
                >
                  <View style={[styles.popularBadge, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="paw" size={12} color="#FFFFFF" />
                    <Text style={[styles.popularBadgeText, { color: '#FFFFFF' }]}>PATİ DOSTU</Text>
                  </View>

                  <Text style={[styles.tierName, { color: colors.text }]}>{pkg.title}</Text>
                  <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>{pkg.price} ₺</Text>
                    {pkg.originalPrice ? (
                      <Text style={styles.originalPriceText}>{pkg.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ {pkg.period}</Text>
                  </View>

                  <View style={styles.features}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleSelectEcosystemPackage(pkg)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                    <Text style={[styles.chooseBtnText, { color: '#FFFFFF' }]}>
                      Pati Koruma Paketini Başlat ({pkg.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* MODÜL 4: DİJİTAL KARTVİZİT */}
          {activeTab === 'vcard' && (
            <View style={styles.plansContainer}>
              {vcardPackages.map((pkg) => (
                <View
                  key={pkg.id}
                  style={[styles.planCard, styles.planCardPopular, { backgroundColor: colors.card, borderColor: '#F59E0B' }]}
                >
                  <View style={[styles.popularBadge, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="card" size={12} color="#FFFFFF" />
                    <Text style={[styles.popularBadgeText, { color: '#FFFFFF' }]}>ÖMÜR BOYU LİSANS</Text>
                  </View>

                  <Text style={[styles.tierName, { color: colors.text }]}>{pkg.title}</Text>
                  <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>{pkg.price} ₺</Text>
                    {pkg.originalPrice ? (
                      <Text style={styles.originalPriceText}>{pkg.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ {pkg.period}</Text>
                  </View>

                  <View style={styles.features}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#F59E0B" />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, { backgroundColor: '#F59E0B' }]}
                    onPress={() => handleSelectEcosystemPackage(pkg)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={[styles.chooseBtnText, { color: '#FFFFFF' }]}>
                      Ömür Boyu vCard Pro Satın Al ({pkg.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* MODÜL 5: RESTORAN MENÜSÜ */}
          {activeTab === 'menu' && (
            <View style={styles.plansContainer}>
              {menuPackages.map((pkg) => (
                <View
                  key={pkg.id}
                  style={[styles.planCard, styles.planCardPopular, { backgroundColor: colors.card, borderColor: '#8B5CF6' }]}
                >
                  <View style={[styles.popularBadge, { backgroundColor: '#8B5CF6' }]}>
                    <Ionicons name="restaurant" size={12} color="#FFFFFF" />
                    <Text style={[styles.popularBadgeText, { color: '#FFFFFF' }]}>İŞLETME LİSANSI</Text>
                  </View>

                  <Text style={[styles.tierName, { color: colors.text }]}>{pkg.title}</Text>
                  <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>{pkg.price} ₺</Text>
                    {pkg.originalPrice ? (
                      <Text style={styles.originalPriceText}>{pkg.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ {pkg.period}</Text>
                  </View>

                  <View style={styles.features}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#8B5CF6" />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, { backgroundColor: '#8B5CF6' }]}
                    onPress={() => handleSelectEcosystemPackage(pkg)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="restaurant" size={16} color="#FFFFFF" />
                    <Text style={[styles.chooseBtnText, { color: '#FFFFFF' }]}>
                      Menü Lisansını Etkinleştir ({pkg.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* MODÜL 6: KURUMSAL SUITE */}
          {activeTab === 'suite' && (
            <View style={styles.suiteContainer}>
              {suitePackages.map((suite) => (
                <View
                  key={suite.id}
                  style={[
                    styles.planCard,
                    styles.planCardPopular,
                    styles.suiteCard,
                    { backgroundColor: colors.card, borderColor: '#6366F1' },
                  ]}
                >
                  <View style={styles.suiteHeaderBadge}>
                    <Ionicons name="diamond" size={16} color="#6366F1" />
                    <Text style={styles.suiteHeaderBadgeText}>HER ŞEY DAHİL VIP LİSANS</Text>
                  </View>

                  <Text style={[styles.tierName, { fontSize: 22, color: colors.text }]}>{suite.title}</Text>
                  <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{suite.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { fontSize: 32, color: colors.text }]}>
                      {suite.price.toLocaleString('tr-TR')} ₺
                    </Text>
                    {suite.originalPrice ? (
                      <Text style={styles.originalPriceText}>
                        {suite.originalPrice.toLocaleString('tr-TR')} ₺
                      </Text>
                    ) : null}
                    <Text style={[styles.periodText, { color: colors.textSecondary }]}>/ yıllık</Text>
                  </View>

                  <View style={styles.features}>
                    {suite.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                        <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, styles.chooseBtnPopular, { paddingVertical: 16 }]}
                    onPress={() => handleSelectEcosystemPackage(suite)}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                    <Text style={[styles.chooseBtnText, styles.chooseBtnTextPopular, { fontSize: 16 }]}>
                      Kurumsal Suite & Havale ile Başlat ({suite.price.toLocaleString('tr-TR')} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* MODÜL 7: FATURA GEÇMİŞİ */}
          {activeTab === 'history' && (
            <View style={styles.historyContainer}>
              <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyHeaderIcon}>
                    <Ionicons name="receipt" size={20} color="#6366F1" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>
                      e-Arşiv Fatura & Makbuz Geçmişi
                    </Text>
                    <Text style={[styles.historySubtitle, { color: colors.textSecondary }]}>
                      Platform üzerinde gerçekleştirdiğiniz tüm ödemelerin yasal muhasebe kayıtları.
                    </Text>
                  </View>
                </View>

                {transactions.length === 0 ? (
                  <View style={styles.emptyTransactions}>
                    <Ionicons name="document-text-outline" size={40} color={colors.textSecondary} />
                    <Text style={[styles.emptyTransactionsText, { color: colors.textSecondary }]}>
                      Henüz kayıtlı bir ödeme geçmişiniz bulunmuyor.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.transactionsList}>
                    {transactions.map((tx) => (
                      <View
                        key={tx.id}
                        style={[
                          styles.transactionRow,
                          { borderBottomColor: colors.border },
                        ]}
                      >
                        <View style={styles.txLeft}>
                          <View style={styles.txIconBox}>
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                          </View>
                          <View>
                            <Text style={[styles.txTitle, { color: colors.text }]}>{tx.itemTitle}</Text>
                            <Text style={[styles.txMeta, { color: colors.textSecondary }]}>
                              Fatura No: {tx.invoiceNo} • Hedef:{' '}
                              <Text style={{ color: colors.gold }}>
                                {tx.targetSlug || 'qr-la.com'}
                              </Text>{' '}
                              • {new Date(tx.createdAt).toLocaleDateString('tr-TR')}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.txRight}>
                          <Text style={[styles.txAmount, { color: colors.text }]}>
                            {tx.amount.toLocaleString('tr-TR')} ₺
                          </Text>
                          <View style={[styles.txStatusBadge, { backgroundColor: '#064E3B' }]}>
                            <Text style={[styles.txStatusText, { color: '#34D399' }]}>
                              {tx.paymentMethod === 'bank_transfer' ? 'Havale / FAST' : 'Tamamlandı'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Havale / EFT & WhatsApp Ödeme Modalı */}
      <PaymentModal
        visible={paymentModalVisible}
        item={selectedPaymentItem}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, _colors?: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    backBtnText: {
      fontSize: 13,
      fontWeight: '600',
    },
    navTitleBox: {
      alignItems: 'center',
    },
    navTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    navSub: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
    panelLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
    },
    panelLinkText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#6366F1',
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },

    // 1. Hedef Varlık Seçici
    assetSelectorCard: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginBottom: 16,
    },
    assetSelectorHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },
    assetSelectorTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    selectorIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    assetSelectorTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    assetSelectorSubtitle: {
      fontSize: 12,
      marginTop: 2,
    },
    activeTargetBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    activeTargetBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#6366F1',
    },
    assetPillsRow: {
      gap: 10,
      paddingVertical: 4,
    },
    assetPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
    },
    assetPillTitle: {
      fontSize: 13,
    },
    assetPillSlug: {
      fontSize: 11,
      marginTop: 1,
    },
    assetPillBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    assetPillBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    noAssetBox: {
      padding: 12,
      alignItems: 'center',
    },
    noAssetText: {
      fontSize: 12,
    },

    // 2. Aktif Plan Özeti
    currentPlanBanner: {
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      marginBottom: 16,
    },
    currentPlanHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    currentPlanTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    currentPlanLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    currentTierBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    currentTierBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    currentPlanName: {
      fontSize: 17,
      fontWeight: '800',
      marginBottom: 6,
    },
    currentPlanDetailsRow: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    currentPlanDetail: {
      fontSize: 12,
    },

    // 3. Kupon Kodu
    couponCard: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginBottom: 16,
    },
    couponHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    couponIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    couponTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    couponSubtitle: {
      fontSize: 11,
      marginTop: 2,
    },
    couponInputRow: {
      flexDirection: 'row',
      gap: 8,
    },
    couponInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 13,
      fontWeight: '700',
    },
    applyCouponBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#6366F1',
      paddingHorizontal: 16,
      borderRadius: 10,
      justifyContent: 'center',
    },
    applyCouponBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    successAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      padding: 10,
      borderRadius: 8,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    successAlertText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#10B981',
    },

    // 4. Modül Bazlı Sekmeler
    tabScrollWrap: {
      marginBottom: 16,
    },
    categoryTabBar: {
      gap: 8,
    },
    categoryTabBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor: isDark ? '#131825' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#232D42' : '#E2E8F0',
    },
    categoryTabBtnActive: {
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.18)' : '#1A1817',
      borderColor: isDark ? '#6366F1' : '#1A1817',
    },
    categoryTabText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    categoryTabTextActive: {
      color: isDark ? '#6366F1' : '#FFFFFF',
      fontWeight: '700',
    },

    // 5. Plan Kartları
    plansContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    planCard: {
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      width: '100%',
      minWidth: 260,
      flex: 1,
      position: 'relative',
    },
    planCardPopular: {
      borderColor: '#6366F1',
      borderWidth: 2,
    },
    planCardCurrent: {
      borderColor: '#10B981',
      borderWidth: 2,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 18,
      backgroundColor: '#6366F1',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#0F172A',
    },
    currentBadge: {
      position: 'absolute',
      top: -10,
      right: 18,
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#10B981',
    },
    currentBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
    },
    tierName: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    },
    pkgDesc: {
      fontSize: 12,
      lineHeight: 17,
      marginBottom: 12,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 12,
    },
    priceText: {
      fontSize: 26,
      fontWeight: '900',
    },
    originalPriceText: {
      fontSize: 15,
      color: '#94A3B8',
      textDecorationLine: 'line-through',
    },
    periodText: {
      fontSize: 12,
      fontWeight: '600',
    },
    quotaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginBottom: 14,
      alignSelf: 'flex-start',
    },
    quotaBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    features: {
      gap: 8,
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    featureText: {
      fontSize: 12,
      lineHeight: 18,
      flex: 1,
    },
    chooseBtn: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6366F1',
    },
    chooseBtnPopular: {
      backgroundColor: '#6366F1',
    },
    chooseBtnDisabled: {
      backgroundColor: 'rgba(150, 150, 150, 0.2)',
    },
    chooseBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    chooseBtnTextPopular: {
      color: '#FFFFFF',
    },
    chooseBtnTextDisabled: {
      color: '#94A3B8',
    },

    // Suite
    suiteContainer: {
      width: '100%',
    },
    suiteCard: {
      padding: 28,
    },
    suiteHeaderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    suiteHeaderBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#6366F1',
    },

    // Faturalar
    historyContainer: {
      width: '100%',
    },
    historyCard: {
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    historyHeaderIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    historySubtitle: {
      fontSize: 12,
      marginTop: 2,
    },
    emptyTransactions: {
      padding: 40,
      alignItems: 'center',
      gap: 10,
    },
    emptyTransactionsText: {
      fontSize: 13,
    },
    transactionsList: {
      gap: 8,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      flexWrap: 'wrap',
      gap: 8,
    },
    txLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    txIconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    txTitle: {
      fontSize: 13,
      fontWeight: '700',
    },
    txMeta: {
      fontSize: 11,
      marginTop: 2,
    },
    txRight: {
      alignItems: 'flex-end',
    },
    txAmount: {
      fontSize: 15,
      fontWeight: '800',
    },
    txStatusBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 2,
    },
    txStatusText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#10B981',
    },
  });
}
