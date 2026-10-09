import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { COUPON_CODES, PLAN_TIERS } from '@/services/mockData';
import { EventModel, PlanTierConfig, StorageTier } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WHATSAPP_PHONE = '905415779166';
const WHATSAPP_DISPLAY = '+90 541 577 91 66';

export default function PricingUpgradeScreen() {
  const router = useRouter();
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();

  const currentUser = authService.getState().user;
  const userSlug =
    (currentUser &&
      currentUser.uid !== 'demo-host-yavuz' &&
      currentUser.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule')) ||
    currentUser?.events?.[0];

  const activeSlug = paramSlug || userSlug || 'demo-panel';

  const [event, setEvent] = useState<EventModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Kota ve Paket Yükseltme | QR-la';
    }
  }, []);

  // Helper to open WhatsApp for purchasing / requesting coupons
  const openWhatsApp = (customText?: string) => {
    const defaultText = `Merhaba, qr-la.com/${activeSlug} etkinliğim için depolama paketi satın almak veya kupon kodu edinmek istiyorum.`;
    const text = encodeURIComponent(customText || defaultText);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        Linking.openURL(url).catch(() => { });
      }
    } else {
      Linking.openURL(url).catch((err) => {
        console.warn('WhatsApp açılamadı:', err);
        Linking.openURL(`https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`).catch(() => {
          Alert.alert('WhatsApp İletişim', `Bize WhatsApp üzerinden ulaşabilirsiniz: ${WHATSAPP_DISPLAY}`);
        });
      });
    }
  };

  // Load active event data
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const ev = await eventService.getEvent(activeSlug, currentUser?.displayName);
        if (isMounted && ev) {
          setEvent(ev);
        }
      } catch (err) {
        console.warn('Tarifeler getEvent error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  const applyCouponCode = async (codeToApply: string) => {
    const cleanCode = (codeToApply || '').trim().toUpperCase();
    if (!cleanCode) {
      Alert.alert('Kupon Kodu Gerekli', 'Lütfen yükseltme yapmak için bir kupon kodu giriniz.');
      return;
    }

    const coupon = COUPON_CODES[cleanCode];
    if (!coupon) {
      openWhatsApp(
        `Merhaba, qr-la.com/${activeSlug} etkinliğim için "${cleanCode}" kuponunu kullanmak veya indirimli paket satın almak istiyorum.`
      );
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
      const successMsg = `🎉 "${cleanCode}" kuponu başarıyla uygulandı! Paketiniz "${coupon.tierName}" (${coupon.quotaMB >= 1024 ? coupon.quotaMB / 1024 + ' GB' : coupon.quotaMB + ' MB'}) olarak güncellendi.`;
      setCouponSuccessMessage(successMsg);

      Alert.alert('Tebrikler! 🎉', successMsg, [
        { text: 'Panele Dön', onPress: () => router.push('/panel' as any) },
        { text: 'Burada Kal', style: 'cancel' },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Kupon uygulanırken bir sorun oluştu. Lütfen tekrar deneyiniz.');
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

  const handleSelectPlan = (tier: PlanTierConfig) => {
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

    openWhatsApp(
      `Merhaba, qr-la.com/${activeSlug} etkinliğim için ${tier.name} (${tier.priceTL} ₺) depolama paketini satın almak ve yükseltmek istiyorum.`
    );
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

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await authService.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
      router.replace('/giris' as any);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm('Yönetim panelinden ve hesabınızdan çıkış yapmak istediğinize emin misiniz?');
      if (confirmed) {
        await executeLogout();
      }
    } else {
      Alert.alert(
        'Çıkış Yap',
        'Yönetim panelinden ve hesabınızdan çıkış yapmak istediğinize emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Çıkış Yap',
            style: 'destructive',
            onPress: executeLogout,
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Paket bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Depolama Paketleri</Text>
            <Text style={styles.navSub}>qr-la.com/{activeSlug}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Active Plan Summary Banner */}
          {event && (
            <View style={styles.currentPlanBanner}>
              <View style={styles.currentPlanHeader}>
                <View style={styles.currentPlanTitleRow}>
                  <Ionicons name="shield-checkmark" size={18} color={currentTierInfo.color} />
                  <Text style={styles.currentPlanLabel}>MEVCUT AKTİF PAKETİNİZ</Text>
                </View>
                <View style={[styles.currentTierBadge, { backgroundColor: currentTierInfo.color + '20' }]}>
                  <Text style={[styles.currentTierBadgeText, { color: currentTierInfo.color }]}>
                    {currentTier.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.currentPlanName}>{currentTierInfo.name}</Text>
              <View style={styles.currentPlanDetailsRow}>
                <Text style={styles.currentPlanDetail}>
                  📦 Toplam Kota: <Text style={{ fontWeight: '700', color: '#1A1817' }}>{currentTierInfo.quota}</Text>
                </Text>
                {event.storage.expiresAt && (
                  <Text style={styles.currentPlanDetail}>
                    ⏳ Bitiş: {new Date(event.storage.expiresAt).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Luxury Coupon Code & WhatsApp Card */}
          <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <View style={styles.couponIconBox}>
                <Ionicons name="gift" size={20} color="#C5A059" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.couponTitle}>Kupon / Promosyon Kodu</Text>
                <Text style={styles.couponSubtitle}>
                  Size tanımlanan özel etkinlik veya kupon kodunu girerek paketinizi anında etkinleştirin.
                </Text>
              </View>
            </View>

            {/* Input Row */}
            <View style={styles.couponInputRow}>
              <TextInput
                style={styles.couponInput}
                value={couponInput}
                onChangeText={(val) => setCouponInput(val.toUpperCase())}
                placeholder="Kupon kodunuzu giriniz..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                autoCorrect={false}
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
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.applyCouponBtnText}>Uygula</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* WhatsApp Support & Purchase Banner */}
            <TouchableOpacity
              style={styles.whatsappBanner}
              onPress={() => openWhatsApp()}
              activeOpacity={0.85}
            >
              <View style={styles.whatsappIconCircle}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.whatsappBannerTitle}>Kupon veya Satın Alma İçin İletişime Geçin</Text>
                <Text style={styles.whatsappBannerSubtitle}>
                  WhatsApp ({WHATSAPP_DISPLAY}) üzerinden anında kupon kodu talep edebilir ya da paketinizi yükseltebilirsiniz.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#059669" />
            </TouchableOpacity>

            {couponSuccessMessage && (
              <View style={styles.successAlert}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.successAlertText}>{couponSuccessMessage}</Text>
              </View>
            )}
          </View>

          <Text style={styles.headerTitle}>
            {currentTier === 'vip'
              ? '👑 En Yüksek VIP Pakettesiniz'
              : 'Düğün Anılarınız Asla Yarıda Kalmasın'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {currentTier === 'vip'
              ? 'Etkinliğiniz için en üst düzey 15 GB depolama alanı ve tüm ayrıcalıklar sınırsız olarak tanımlanmıştır.'
              : 'Ücretsiz 500 MB kotanız dolmak üzereyse veya salonda canlı projeksiyon özelliğini açmak istiyorsanız uygun paketi seçin.'}
          </Text>

          {/* Pricing Plans Grid */}
          <View style={styles.plansContainer}>
            {PLAN_TIERS.map((tier) => {
              const isCurrent = currentTier === tier.tier;
              const currentRank = TIER_RANKS[currentTier] ?? 0;
              const tierRank = TIER_RANKS[tier.tier] ?? 0;
              const isLower = tierRank < currentRank;
              const isDisabled = isCurrent || isLower;

              let btnText = 'WhatsApp ile Satın Al / Yükselt';
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
                    isLower && styles.planCardLower,
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
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
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
                    activeOpacity={0.8}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.chooseBtnText,
                        tier.isPopular && !isLower && styles.chooseBtnTextPopular,
                        isCurrent && styles.chooseBtnTextCurrent,
                        isLower && styles.chooseBtnTextLower,
                      ]}
                    >
                      {btnText}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    paddingBottom: 50,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  navTitleBox: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  navSub: {
    fontSize: 11,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  currentPlanBanner: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  currentTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentTierBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 8,
  },
  currentPlanDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currentPlanDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  couponCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    shadowColor: '#C5A059',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  couponIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  couponSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    letterSpacing: 1,
  },
  applyCouponBtn: {
    backgroundColor: '#C5A059',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  applyCouponBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  whatsappBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  whatsappIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  whatsappBannerSubtitle: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 15,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  successAlertText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 20,
    lineHeight: 18,
  },
  plansContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  planCardPopular: {
    borderColor: '#C5A059',
    borderWidth: 2,
    shadowColor: '#C5A059',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  planCardCurrent: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#FAFDFB',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#C5A059',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#10B981',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tierName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#C5A059',
  },
  periodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quotaBox: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 2,
  },
  quotaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  retentionText: {
    fontSize: 11,
    color: '#6B7280',
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
    color: '#4B5563',
    flex: 1,
  },
  chooseBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  chooseBtnPopular: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  chooseBtnCurrent: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  chooseBtnLower: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  chooseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  chooseBtnTextPopular: {
    color: '#FFF',
  },
  chooseBtnTextCurrent: {
    color: '#059669',
  },
  chooseBtnTextLower: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  planCardLower: {
    opacity: 0.85,
    backgroundColor: '#FAFAFA',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A6D3B',
    fontWeight: '600',
  },
});

