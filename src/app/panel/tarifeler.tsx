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
import { COUPON_CODES, PLAN_TIERS, ECOSYSTEM_PACKAGES } from '@/services/mockData';
import { EventModel, PlanTierConfig, StorageTier } from '@/types';
import { paymentService, PaymentItem, TransactionRecord } from '@/services/paymentService';
import PaymentModal from '@/components/PaymentModal';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

type PricingTab = 'events' | 'modules' | 'suite' | 'history';

export default function PricingUpgradeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  const currentUser = authService.getState().user;
  const userSlug =
    (currentUser &&
      currentUser.uid !== 'demo-host-yavuz' &&
      currentUser.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule')) ||
    currentUser?.events?.[0];

  const activeSlug = paramSlug || userSlug || 'demo-panel';

  const [activeTab, setActiveTab] = useState<PricingTab>('events');
  const [event, setEvent] = useState<EventModel | null>(null);

  // Kupon Kodu
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
      document.title = 'Paketler & Online Ödeme | QR-la';
    }
  }, []);

  // Etkinlik Verilerini Yükle
  const loadEvent = async () => {
    try {
      const ev = await eventService.getEvent(activeSlug, currentUser?.displayName);
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
    loadEvent();
    loadTransactions();
  }, [activeSlug]);

  // Kupon Kodu Uygulama
  const applyCouponCode = async (codeToApply: string) => {
    const cleanCode = (codeToApply || '').trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Kupon Kodu Gerekli', 'Lütfen yükseltme yapmak için bir kupon kodu giriniz.');
      return;
    }

    const coupon = COUPON_CODES[cleanCode];
    if (!coupon) {
      // Eğer kupon indirim kuponuysa modalı aç
      const disc = paymentService.checkCoupon(cleanCode, 3990);
      if (disc.valid) {
        handleSelectPlan(PLAN_TIERS[2], cleanCode);
        return;
      }
      Alert.alert('Geçersiz Kupon', `"${cleanCode}" geçerli bir kupon kodu değildir.`);
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const updated = await eventService.upgradeStorageTier(
        activeSlug,
        coupon.tier,
        coupon.retentionDays,
        coupon.quotaMB
      );
      setEvent(updated);
      setCouponInput('');
      const successMsg = `🎉 "${cleanCode}" kuponu başarıyla uygulandı! Paketiniz "${coupon.tierName}" (${
        coupon.quotaMB >= 1024 ? coupon.quotaMB / 1024 + ' GB' : coupon.quotaMB + ' MB'
      }) olarak güncellendi.`;
      setCouponSuccessMessage(successMsg);

      Alert.alert('Tebrikler! 🎉', successMsg, [
        { text: 'Panele Dön', onPress: () => router.push('/panel' as any) },
        { text: 'Burada Kal', style: 'cancel' },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Kupon uygulanırken bir sorun oluştu.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const currentTier = event?.storage.tier || 'free';

  const TIER_RANKS: Record<StorageTier, number> = {
    free: 0,
    standart: 1,
    premium: 2,
    vip: 3,
  };

  const getTierDisplay = (tier: StorageTier) => {
    switch (tier) {
      case 'vip':
        return { name: 'VIP Masalsı Düğün', quota: '15 GB', color: '#8B5CF6' };
      case 'premium':
        return { name: 'Premium Düğün', quota: '5 GB', color: '#C5A059' };
      case 'standart':
        return { name: 'Standart Kutlama', quota: '2 GB', color: '#3B82F6' };
      default:
        return { name: 'Ücretsiz Başlangıç', quota: '500 MB', color: '#10B981' };
    }
  };

  const currentTierInfo = getTierDisplay(currentTier);

  // Düğün Paketi Seçildiğinde -> Ödeme Modalı Aç
  const handleSelectPlan = (tier: PlanTierConfig, _prefilledCoupon?: string) => {
    const isCurrent = currentTier === tier.tier;
    if (isCurrent) {
      Alert.alert('Mevcut Paketiniz', `Zaten ${tier.name} paketini kullanmaktasınız.`);
      return;
    }

    const currentRank = TIER_RANKS[currentTier] ?? 0;
    const selectedRank = TIER_RANKS[tier.tier] ?? 0;

    if (selectedRank < currentRank) {
      Alert.alert(
        'Mevcut Paketiniz Daha Yüksek',
        `Zaten daha üst seviye olan "${getTierDisplay(currentTier).name}" paketini kullanmaktasınız.`
      );
      return;
    }

    if (tier.priceTL === 0) {
      Alert.alert('Başlangıç Paketi', 'Ücretsiz başlangıç paketi tüm etkinliklerde varsayılan olarak etkindir.');
      return;
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
      } gün güvenli bulut arşivi.`,
      features: tier.features,
    });
    setPaymentModalVisible(true);
  };

  // Modül Paketi Seçildiğinde
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
      description: pkg.description,
      features: pkg.features,
    });
    setPaymentModalVisible(true);
  };

  // Ödeme Başarıyla Tamamlandığında
  const handlePaymentSuccess = (transaction: TransactionRecord) => {
    if (transaction.category === 'event_tier') {
      loadEvent();
    }
    loadTransactions();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Üst Navigasyon */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : colors.text} />
          </TouchableOpacity>

          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Paketler & Online Ödeme</Text>
            <Text style={styles.navSub}>qr-la.com/{activeSlug}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeToggleBtn size="sm" />
            <TouchableOpacity
              style={styles.panelLinkBtn}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="apps-outline" size={16} color={colors.gold} />
              {!isMobile && <Text style={styles.panelLinkText}>Panel</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Aktif Paket Özeti */}
          {event && (
            <View style={styles.currentPlanBanner}>
              <View style={styles.currentPlanHeader}>
                <View style={styles.currentPlanTitleRow}>
                  <Ionicons name="shield-checkmark" size={18} color={currentTierInfo.color} />
                  <Text style={styles.currentPlanLabel}>MEVCUT AKTİF PAKETİNİZ</Text>
                </View>
                <View style={[styles.currentTierBadge, { backgroundColor: currentTierInfo.color + '25' }]}>
                  <Text style={[styles.currentTierBadgeText, { color: currentTierInfo.color }]}>
                    {currentTier.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.currentPlanName}>{currentTierInfo.name}</Text>

              <View style={styles.currentPlanDetailsRow}>
                <Text style={styles.currentPlanDetail}>
                  📦 Toplam Kota: <Text style={{ fontWeight: '700', color: '#F8FAFC' }}>{currentTierInfo.quota}</Text>
                </Text>
                {event.storage.expiresAt && (
                  <Text style={styles.currentPlanDetail}>
                    ⏳ Bitiş: {new Date(event.storage.expiresAt).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Kupon Kodu Alanı */}
          <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <View style={styles.couponIconBox}>
                <Ionicons name="gift" size={20} color="#D4AF37" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.couponTitle}>Kupon & Promosyon Kodu</Text>
                <Text style={styles.couponSubtitle}>
                  Özel promosyon kodunuz varsa girerek paketinizi anında indirimli etkinleştirin.
                </Text>
              </View>
            </View>

            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                value={couponInput}
                onChangeText={(val) => setCouponInput(val.toUpperCase())}
                placeholder="Örn: ASNUSVIP, YUZDE20, HOSGELDIN"
                placeholderTextColor="#64748B"
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
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={15} color="#0F172A" />
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

          {/* 4 Ana Kategori Sekmesi */}
          <View style={styles.categoryTabBar}>
            <TouchableOpacity
              style={[styles.categoryTabBtn, activeTab === 'events' && styles.categoryTabBtnActive]}
              onPress={() => setActiveTab('events')}
            >
              <Ionicons
                name="heart"
                size={16}
                color={activeTab === 'events' ? '#D4AF37' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  activeTab === 'events' && styles.categoryTabTextActive,
                ]}
              >
                💍 Düğün Paketleri
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTabBtn, activeTab === 'modules' && styles.categoryTabBtnActive]}
              onPress={() => setActiveTab('modules')}
            >
              <Ionicons
                name="shapes"
                size={16}
                color={activeTab === 'modules' ? '#D4AF37' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  activeTab === 'modules' && styles.categoryTabTextActive,
                ]}
              >
                🌐 Modül Paketleri
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTabBtn, activeTab === 'suite' && styles.categoryTabBtnActive]}
              onPress={() => setActiveTab('suite')}
            >
              <Ionicons
                name="diamond"
                size={16}
                color={activeTab === 'suite' ? '#D4AF37' : '#94A3B8'}
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
              style={[styles.categoryTabBtn, activeTab === 'history' && styles.categoryTabBtnActive]}
              onPress={() => setActiveTab('history')}
            >
              <Ionicons
                name="receipt-outline"
                size={16}
                color={activeTab === 'history' ? '#D4AF37' : '#94A3B8'}
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
          </View>

          {/* SEKME 1: DÜĞÜN & ETKİNLİK PAKETLERİ */}
          {activeTab === 'events' && (
            <View style={styles.plansContainer}>
              {PLAN_TIERS.map((tier) => {
                const isCurrent = currentTier === tier.tier;
                const currentRank = TIER_RANKS[currentTier] ?? 0;
                const tierRank = TIER_RANKS[tier.tier] ?? 0;
                const isLower = tierRank < currentRank;
                const isDisabled = isCurrent || isLower;

                let btnText = 'Hemen Satın Al & Yükselt';
                if (isCurrent) {
                  btnText = 'Şu Anki Aktif Paketiniz';
                } else if (isLower) {
                  btnText = 'Mevcut Paketinizin Altında';
                }

                return (
                  <View
                    key={tier.tier}
                    style={[
                      styles.planCard,
                      tier.isPopular && styles.planCardPopular,
                      isCurrent && styles.planCardCurrent,
                    ]}
                  >
                    {isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>AKTİF PAKETİNİZ</Text>
                      </View>
                    ) : tier.isPopular && !isLower ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>EN ÇOK TERCİH EDİLEN</Text>
                      </View>
                    ) : null}

                    <Text style={styles.tierName}>{tier.name}</Text>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>
                        {tier.priceTL === 0 ? 'ÜCRETSİZ' : `${tier.priceTL} ₺`}
                      </Text>
                      {tier.priceTL > 0 && <Text style={styles.periodText}>/ tek seferlik</Text>}
                    </View>

                    <View style={styles.quotaBox}>
                      <Text style={styles.quotaText}>
                        📦 {tier.quotaMB >= 1024 ? `${tier.quotaMB / 1024} GB` : `${tier.quotaMB} MB`} Bulut Depolama
                      </Text>
                      <Text style={styles.retentionText}>⏳ {tier.retentionDays} Gün Arşiv Süresi</Text>
                    </View>

                    <View style={styles.features}>
                      {tier.features.map((feat, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={15} color="#D4AF37" />
                          <Text style={styles.featureText}>{feat}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.chooseBtn,
                        tier.isPopular && !isLower && styles.chooseBtnPopular,
                        isCurrent && styles.chooseBtnCurrent,
                        isLower && styles.chooseBtnLower,
                      ]}
                      onPress={() => handleSelectPlan(tier)}
                      activeOpacity={0.85}
                      disabled={isDisabled}
                    >
                      <Ionicons
                        name={isCurrent ? 'checkmark' : 'lock-closed-outline'}
                        size={16}
                        color={isCurrent ? '#CBD5E1' : '#0F172A'}
                      />
                      <Text
                        style={[
                          styles.chooseBtnText,
                          tier.isPopular && !isLower && styles.chooseBtnTextPopular,
                          isCurrent && styles.chooseBtnTextCurrent,
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

          {/* SEKME 2: MODÜL & EKOSİSTEM PAKETLERİ */}
          {activeTab === 'modules' && (
            <View style={styles.plansContainer}>
              {ECOSYSTEM_PACKAGES.filter((p) => p.category === 'module_package').map((pkg) => (
                <View key={pkg.id} style={styles.planCard}>
                  {pkg.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{pkg.badge.toUpperCase()}</Text>
                    </View>
                  )}

                  <Text style={styles.tierName}>{pkg.title}</Text>
                  <Text style={styles.pkgDesc}>{pkg.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{pkg.price} ₺</Text>
                    {pkg.originalPrice ? (
                      <Text style={styles.originalPriceText}>{pkg.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={styles.periodText}>/ {pkg.period}</Text>
                  </View>

                  <View style={styles.features}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                        <Text style={styles.featureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, styles.chooseBtnPopular]}
                    onPress={() => handleSelectEcosystemPackage(pkg)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="sparkles" size={16} color="#0F172A" />
                    <Text style={[styles.chooseBtnText, styles.chooseBtnTextPopular]}>
                      Hemen Etkinleştir ({pkg.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* SEKME 3: KURUMSAL SUITE */}
          {activeTab === 'suite' && (
            <View style={styles.suiteContainer}>
              {ECOSYSTEM_PACKAGES.filter((p) => p.category === 'suite_license').map((suite) => (
                <View key={suite.id} style={[styles.planCard, styles.planCardPopular, styles.suiteCard]}>
                  <View style={styles.suiteHeaderBadge}>
                    <Ionicons name="diamond" size={16} color="#D4AF37" />
                    <Text style={styles.suiteHeaderBadgeText}>HER ŞEY DAHİL VIP LİSANS</Text>
                  </View>

                  <Text style={[styles.tierName, { fontSize: 22 }]}>{suite.title}</Text>
                  <Text style={styles.pkgDesc}>{suite.description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { fontSize: 32 }]}>{suite.price} ₺</Text>
                    {suite.originalPrice ? (
                      <Text style={styles.originalPriceText}>{suite.originalPrice} ₺</Text>
                    ) : null}
                    <Text style={styles.periodText}>/ yıllık</Text>
                  </View>

                  <View style={styles.features}>
                    {suite.features.map((feat, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                        <Text style={[styles.featureText, { color: '#F1F5F9' }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.chooseBtn, styles.chooseBtnPopular, { paddingVertical: 16 }]}
                    onPress={() => handleSelectEcosystemPackage(suite)}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="card" size={18} color="#0F172A" />
                    <Text style={[styles.chooseBtnText, styles.chooseBtnTextPopular, { fontSize: 16 }]}>
                      Kurumsal Suite Lisansını Satın Al ({suite.price} ₺)
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* SEKME 4: FATURALARIM & ÖDEME GEÇMİŞİ */}
          {activeTab === 'history' && (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Ionicons name="receipt" size={20} color="#D4AF37" />
                <Text style={styles.historyTitle}>e-Arşiv Fatura & Ödeme Geçmişi</Text>
              </View>

              {transactions.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Ionicons name="document-text-outline" size={40} color="#64748B" />
                  <Text style={styles.emptyHistoryText}>Henüz bir fatura kaydı bulunmamaktadır.</Text>
                </View>
              ) : (
                transactions.map((trx) => (
                  <View key={trx.id} style={styles.transactionCard}>
                    <View style={styles.trxTopRow}>
                      <View>
                        <Text style={styles.trxInvoiceNo}>{trx.invoiceNo}</Text>
                        <Text style={styles.trxTitle}>{trx.itemTitle}</Text>
                      </View>
                      <View style={styles.trxStatusBadge}>
                        <Text style={styles.trxStatusText}>ÖDENDİ</Text>
                      </View>
                    </View>

                    <View style={styles.trxDetailsRow}>
                      <Text style={styles.trxMeta}>
                        📅 {new Date(trx.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                      <Text style={styles.trxMeta}>
                        💳 {trx.paymentMethod === 'credit_card' ? `Kart (${trx.cardBrand || 'Banka'})` : 'Havale / FAST'}
                      </Text>
                      <Text style={styles.trxAmount}>{trx.amount} ₺</Text>
                    </View>

                    <View style={styles.trxActionRow}>
                      <TouchableOpacity
                        style={styles.trxPrintBtn}
                        onPress={() => paymentService.printReceipt(trx)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="print-outline" size={15} color="#D4AF37" />
                        <Text style={styles.trxPrintBtnText}>e-Arşiv Fatura Yazdır</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Online Ödeme Modalı */}
      <PaymentModal
        visible={paymentModalVisible}
        item={selectedPaymentItem}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handlePaymentSuccess}
      />
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      paddingBottom: 60,
    },
    navbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: isDark ? '#1E293B' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navTitleBox: {
      alignItems: 'center',
    },
    navTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    navSub: {
      fontSize: 11,
      color: colors.gold,
      fontWeight: '600',
    },
    panelLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? '#1E293B' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    panelLinkText: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '600',
    },
    content: {
      padding: 20,
      gap: 20,
      maxWidth: 1080,
      width: '100%',
      alignSelf: 'center',
    },
    currentPlanBanner: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      gap: 10,
    },
    currentPlanHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentPlanTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    currentPlanLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
    },
    currentTierBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentTierBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    currentPlanName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    currentPlanDetailsRow: {
      flexDirection: 'row',
      gap: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      flexWrap: 'wrap',
    },
    currentPlanDetail: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    couponCard: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      gap: 14,
    },
    couponHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    couponIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(197, 160, 89, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    couponTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    couponSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    couponInputRow: {
      flexDirection: 'row',
      gap: 10,
    },
    couponInput: {
      flex: 1,
      backgroundColor: isDark ? '#131D31' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      fontSize: 13,
    },
    applyCouponBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gold,
      paddingHorizontal: 18,
      borderRadius: 12,
      gap: 6,
    },
    applyCouponBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    successAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 1,
      borderColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      gap: 8,
    },
    successAlertText: {
      color: isDark ? '#A7F3D0' : '#065F46',
      fontSize: 13,
      fontWeight: '600',
    },
    categoryTabBar: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 6,
      gap: 6,
      flexWrap: 'wrap',
    },
    categoryTabBtn: {
      flex: 1,
      minWidth: 130,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      gap: 6,
    },
    categoryTabBtnActive: {
      backgroundColor: isDark ? '#1E293B' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.gold,
    },
    categoryTabText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    categoryTabTextActive: {
      color: colors.gold,
      fontWeight: '700',
    },
    plansContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    planCard: {
      flex: 1,
      minWidth: 280,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      padding: 24,
      gap: 16,
      justifyContent: 'space-between',
    },
    planCardPopular: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#131D31' : '#FAF7F2',
      shadowColor: colors.gold,
      shadowOpacity: 0.15,
      shadowRadius: 18,
    },
    planCardCurrent: {
      borderColor: '#10B981',
    },
    badge: {
      position: 'absolute',
      top: 14,
      right: 14,
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    currentBadge: {
      position: 'absolute',
      top: 14,
      right: 14,
      backgroundColor: '#064E3B',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    currentBadgeText: {
      color: '#A7F3D0',
      fontSize: 10,
      fontWeight: '800',
    },
    tierName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    pkgDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: -8,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    priceText: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
    },
    originalPriceText: {
      color: colors.textSecondary,
      fontSize: 16,
      textDecorationLine: 'line-through',
    },
    periodText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    quotaBox: {
      backgroundColor: isDark ? '#131D31' : '#FAF7F2',
      padding: 12,
      borderRadius: 12,
      gap: 4,
    },
    quotaText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    retentionText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    features: {
      gap: 10,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    featureText: {
      color: isDark ? '#CBD5E1' : '#4B5563',
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
    chooseBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      paddingVertical: 14,
      borderRadius: 14,
      gap: 8,
      marginTop: 6,
    },
    chooseBtnPopular: {
      backgroundColor: colors.gold,
    },
    chooseBtnCurrent: {
      backgroundColor: isDark ? '#1E293B' : '#E5E7EB',
    },
    chooseBtnLower: {
      backgroundColor: isDark ? '#1E293B' : '#E5E7EB',
      opacity: 0.5,
    },
    chooseBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    chooseBtnTextPopular: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    chooseBtnTextCurrent: {
      color: colors.textSecondary,
    },
    suiteContainer: {
      width: '100%',
    },
    suiteCard: {
      maxWidth: 720,
      alignSelf: 'center',
    },
    suiteHeaderBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(197, 160, 89, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    suiteHeaderBadgeText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '700',
    },
    historyContainer: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      gap: 16,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    historyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyHistoryBox: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 10,
    },
    emptyHistoryText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    transactionCard: {
      backgroundColor: isDark ? '#131D31' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 10,
    },
    trxTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    trxInvoiceNo: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '700',
    },
    trxTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 2,
    },
    trxStatusBadge: {
      backgroundColor: '#064E3B',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    trxStatusText: {
      color: '#A7F3D0',
      fontSize: 10,
      fontWeight: '700',
    },
    trxDetailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      flexWrap: 'wrap',
      gap: 8,
    },
    trxMeta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    trxAmount: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    trxActionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    trxPrintBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    trxPrintBtnText: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
