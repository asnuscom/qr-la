import { ShareEventModal } from '@/components/ShareEventModal';
import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { slugify } from '@/services/mockData';
import { EventModel } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventSettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();

  const user = authService.getState().user;
  const userSlug =
    (user &&
      user.uid !== 'demo-host-yavuz' &&
      user.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule')) ||
    user?.events?.[0];

  const initialSlug = paramSlug || userSlug || 'demo-panel';
  const [loadedSlug, setLoadedSlug] = useState<string>(initialSlug);
  const activeSavedSlug = loadedSlug || initialSlug;
  const isDemo = activeSavedSlug === 'demo-panel' || !user || user.uid === 'demo-host-yavuz';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [eventData, setEventData] = useState<EventModel | null>(null);

  // Slug settings
  const [slug, setSlug] = useState(initialSlug);
  const [slugCheckStatus, setSlugCheckStatus] = useState<{
    checked: boolean;
    available: boolean;
    message?: string;
  } | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Privacy & Protection
  const [isPrivate, setIsPrivate] = useState(false);
  const [pinCode, setPinCode] = useState('1923');

  // Photo Upload & Quality
  const [enableCompression, setEnableCompression] = useState(true);
  const [autoApprovePhotos, setAutoApprovePhotos] = useState(true);

  // Guest Features & Permissions
  const [allowGuestDownloads, setAllowGuestDownloads] = useState(true);
  const [allowGuestbook, setAllowGuestbook] = useState(true);

  // Live Screen / Projector
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Özel Bağlantı & Gizlilik Ayarları | QR-la';
    }
  }, []);

  // Load existing event data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const slugToLoad = paramSlug || initialSlug;
        const ev = await eventService.getEvent(slugToLoad, user?.displayName);
        if (ev) {
          setEventData(ev);
          setLoadedSlug(ev.slug);
          setSlug(ev.slug);
          setSlugCheckStatus(null);

          setIsPrivate(ev.settings.isPrivate);
          setPinCode(ev.settings.pinCode || '1923');
          const isOrigQuality = Boolean(
            (ev.settings as any)?.originalQuality || ev.settings.enableCompression === false
          );
          setEnableCompression(!isOrigQuality);
          setAllowGuestDownloads(ev.settings.allowGuestDownloads ?? true);
          setIsLiveFeedActive(ev.settings.isLiveFeedActive ?? true);
          setAllowGuestbook(ev.settings.allowGuestbook ?? true);
          setAutoApprovePhotos(ev.settings.autoApprovePhotos ?? true);
        }
      } catch (err) {
        console.warn('Load settings err:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [paramSlug, initialSlug, user?.displayName]);

  // Debounced slug availability verification
  useEffect(() => {
    if (!slug || isDemo || slug === activeSavedSlug) {
      setSlugCheckStatus(null);
      setIsCheckingSlug(false);
      return;
    }

    if (slug.length < 3) {
      setSlugCheckStatus({
        checked: true,
        available: false,
        message: 'Bağlantı adı en az 3 karakterden oluşmalıdır.',
      });
      return;
    }

    setIsCheckingSlug(true);
    const timer = setTimeout(async () => {
      try {
        const res = await eventService.checkSlugAvailability(slug, user?.uid);
        setSlugCheckStatus({
          checked: true,
          available: res.available,
          message: res.available
            ? `qr-la.com/${res.formattedSlug} bağlantısı kullanılabilir!`
            : res.reason,
        });
      } catch {
        setSlugCheckStatus(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [slug, activeSavedSlug, isDemo, user?.uid]);

  const showDemoLockedNotice = (fieldName: string) => {
    Alert.alert(
      'Demo Modu Kilitlidir 🔒',
      `Demo etkinliğinde "${fieldName}" değiştirilemez. Kendi etkinliğinizi oluşturup kişiselleştirmek için lütfen ücretsiz kayıt olun.`,
      [
        { text: 'Anladım', style: 'cancel' },
        {
          text: 'Kayıt Ol',
          onPress: () => router.push({ pathname: '/giris', params: { tab: 'register' } } as any),
        },
      ]
    );
  };

  const handleSlugChange = (text: string) => {
    if (isDemo) {
      showDemoLockedNotice('Özel bağlantı linki (Slug)');
      return;
    }
    const sanitized = slugify(text);
    setSlug(sanitized);
  };

  const handleSave = async () => {
    if (isDemo) {
      showDemoLockedNotice('Tüm ayarlar');
      return;
    }

    const cleanSlug = slugify(slug);
    if (!cleanSlug || cleanSlug.length < 3) {
      Alert.alert('Eksik Bilgi', 'Özel bağlantı linki en az 3 karakterden oluşmalıdır.');
      return;
    }

    if (slugCheckStatus && !slugCheckStatus.available && cleanSlug !== activeSavedSlug) {
      Alert.alert('Bağlantı Kullanılamıyor', slugCheckStatus.message || 'Lütfen farklı bir bağlantı adı seçin.');
      return;
    }

    if (isPrivate && (!pinCode || pinCode.trim().length < 4)) {
      Alert.alert('Eksik Bilgi', 'Lütfen 4 haneli bir galeri giriş PIN kodu belirleyin.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = {
        isPrivate,
        pinCode: pinCode.trim(),
        enableCompression,
        originalQuality: !enableCompression,
        allowGuestDownloads,
        isLiveFeedActive,
        allowGuestbook,
        autoApprovePhotos,
      };

      if (cleanSlug !== activeSavedSlug) {
        // Slug changed: run complete migration of Firestore documents and subcollections
        await eventService.renameEventSlug(activeSavedSlug, cleanSlug, {
          settings: updatedSettings as any,
        });
        if (user) {
          await authService.updateUserEventSlug(user.uid, activeSavedSlug, cleanSlug);
        }
        setLoadedSlug(cleanSlug);
        setSlug(cleanSlug);
        setSlugCheckStatus(null);
        if (router.setParams) {
          router.setParams({ slug: cleanSlug });
        }
      } else {
        await eventService.saveEvent(cleanSlug, {
          settings: updatedSettings as any,
        });
        setLoadedSlug(cleanSlug);
        setSlug(cleanSlug);
        setSlugCheckStatus(null);
      }

      setIsSaving(false);
      Alert.alert('Harika! 🎉', 'Gizlilik, bağlantı ve sistem ayarlarınız kaydedildi!', [
        {
          text: 'Panele Dön',
          onPress: () => router.push({ pathname: '/panel', params: { slug: cleanSlug } } as any),
        },
        {
          text: 'Sayfayı Gör',
          onPress: () => router.push(`/${cleanSlug}` as any),
        },
      ]);
    } catch (e: any) {
      console.error(e);
      setIsSaving(false);
      Alert.alert('Hata', e?.message || 'Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Ayarlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push({ pathname: '/panel', params: { slug: activeSavedSlug } } as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={styles.navTitle} numberOfLines={1}>
              Özel Bağlantı & Gizlilik Ayarları
            </Text>
            <Text style={styles.navSub}>
              {eventData?.title || 'Etkinlik Ayarları'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={[styles.shareHeaderBtn, isMobile && styles.iconOnlyHeaderBtn]}
              onPress={() => setIsShareModalOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Paylaş"
            >
              <Ionicons name="share-social-outline" size={17} color="#8A6D3B" />
              {!isMobile && <Text style={styles.shareHeaderBtnText}>Paylaş</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveHeaderBtn, isMobile && styles.iconOnlyHeaderBtn]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
              accessibilityLabel="Kaydet"
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  {!isMobile && <Text style={styles.saveHeaderBtnText}>Kaydet</Text>}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Warning Banner */}
        {isDemo && (
          <View style={styles.demoWarningBanner}>
            <View style={styles.demoWarningIcon}>
              <Ionicons name="lock-closed" size={20} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoWarningTitle}>Demo Modu: Salt Okunur 🔒</Text>
              <Text style={styles.demoWarningText}>
                Örnek etkinliği inceliyorsunuz. Bağlantı linki ve sistem kuralları demoda kilitlidir.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.demoRegisterBtn}
              onPress={() => router.push({ pathname: '/giris', params: { tab: 'register' } } as any)}
            >
              <Text style={styles.demoRegisterBtnText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 1: Custom Slug / URL */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderIconWrap}>
              <Ionicons name="link-outline" size={20} color="#C5A059" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeader}>1. Özel Bağlantı (Slug / URL)</Text>
              <Text style={styles.cardHeaderSub}>
                Misafirlerinizin etkinliğe ve fotoğraf yükleme ekranına erişeceği kısa web adresi.
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRowWithBadge}>
              <Text style={styles.label}>Etkinlik Kısa Linki</Text>
              {isDemo ? (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={10} color="#B45309" />
                  <Text style={styles.lockedBadgeText}>Demoda Kilitli</Text>
                </View>
              ) : slugCheckStatus && slug !== activeSavedSlug ? (
                <View
                  style={[
                    styles.slugStatusBadge,
                    slugCheckStatus.available
                      ? styles.slugStatusBadgeSuccess
                      : styles.slugStatusBadgeError,
                  ]}
                >
                  <Ionicons
                    name={slugCheckStatus.available ? 'checkmark-circle' : 'alert-circle'}
                    size={11}
                    color={slugCheckStatus.available ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.slugStatusBadgeText,
                      slugCheckStatus.available
                        ? styles.slugStatusBadgeTextSuccess
                        : styles.slugStatusBadgeTextError,
                    ]}
                  >
                    {slugCheckStatus.available ? 'Kullanılabilir' : 'Alınamaz'}
                  </Text>
                </View>
              ) : null}
            </View>

            {isDemo ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => showDemoLockedNotice('Özel Bağlantı Linki (Slug)')}
                style={[styles.slugLockedBox, styles.inputLocked]}
              >
                <Ionicons name="lock-closed" size={16} color="#B45309" />
                <Text style={styles.slugPrefixText}>qr-la.com/</Text>
                <Text style={styles.slugValueText}>{slug || 'demo-panel'}</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.slugInputContainer,
                  slugCheckStatus && !slugCheckStatus.available && styles.slugInputContainerError,
                  slugCheckStatus &&
                    slugCheckStatus.available &&
                    slug !== activeSavedSlug &&
                    styles.slugInputContainerSuccess,
                ]}
              >
                <View style={styles.slugPrefixWrap}>
                  <Ionicons name="globe-outline" size={16} color="#8A6D3B" />
                  <Text style={styles.slugPrefixText}>qr-la.com/</Text>
                </View>
                <TextInput
                  style={styles.slugTextInput}
                  value={slug}
                  onChangeText={handleSlugChange}
                  placeholder="ornek-dugun"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isCheckingSlug ? (
                  <ActivityIndicator size="small" color="#C5A059" style={{ marginRight: 8 }} />
                ) : slug !== activeSavedSlug ? (
                  <TouchableOpacity
                    onPress={() => {
                      setSlug(activeSavedSlug);
                      setSlugCheckStatus(null);
                    }}
                    style={styles.slugResetBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="refresh" size={13} color="#8A6D3B" />
                    <Text style={styles.slugResetText}>Geri Al</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {isDemo ? (
              <Text style={styles.helperText}>
                Demo linki diğer misafirlerin incelemesi için sabittir. Kendi özel linkinizi oluşturmak için ücretsiz hesap açın.
              </Text>
            ) : slugCheckStatus?.message ? (
              <Text
                style={[
                  styles.slugFeedbackText,
                  slugCheckStatus.available ? styles.slugFeedbackSuccess : styles.slugFeedbackError,
                ]}
              >
                {slugCheckStatus.available ? `✅ ${slugCheckStatus.message}` : `⚠️ ${slugCheckStatus.message}`}
              </Text>
            ) : slug !== activeSavedSlug ? (
              <Text style={styles.slugNoticeText}>
                ⚠️ Bağlantıyı değiştirdiğinizde misafirlerin erişeceği adres ve masa QR kartlarınız "qr-la.com/{slug}" olarak güncellenecektir.
              </Text>
            ) : (
              <Text style={styles.helperText}>
                Misafirleriniz bu kısa bağlantı üzerinden fotoğraflara ulaşır (Örn: qr-la.com/{slug}). Sadece küçük harf, rakam ve tire (-) içerebilir.
              </Text>
            )}

            {/* Quick Share Link & WhatsApp Action */}
            <TouchableOpacity
              style={styles.shareActionCardBtn}
              onPress={() => setIsShareModalOpen(true)}
              activeOpacity={0.8}
            >
              <View style={styles.shareActionIconWrap}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shareActionTitle}>WhatsApp ile Paylaş</Text>
                <Text style={styles.shareActionSub}>
                  Hazır davet metniyle qr-la.com/{activeSavedSlug} adresini gönderin.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Privacy & PIN Protection */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeader}>2. Galeri Gizliliği & PIN Kodu</Text>
              <Text style={styles.cardHeaderSub}>
                Etkinliğinizi yalnızca masalarda oturan gerçek davetlilerinize özel kılın.
              </Text>
            </View>
          </View>

          {/* PIN Protection Switch */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>PIN Kodu ile Galeriyi Koru</Text>
              <Text style={styles.switchSub}>
                Fotoğraf galerisine yalnızca masadaki 4 haneli PIN koduna sahip misafirler girebilir.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {isPrivate && (
            <View style={styles.pinBox}>
              <View style={styles.pinHeader}>
                <Ionicons name="keypad-outline" size={16} color="#8A6D3B" />
                <Text style={styles.pinLabel}>4 Haneli Giriş PIN Kodu:</Text>
              </View>
              <TextInput
                style={styles.pinInput}
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="numeric"
                maxLength={4}
                placeholder="1923"
              />
              <Text style={styles.pinHelpText}>
                Bu kod masa kartlarınızda ve QR kod tarandığında misafirlere sorulur.
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: Photo Upload & Moderation Rules */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="images-outline" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeader}>3. Fotoğraf Yükleme & Moderasyon Kuralları</Text>
              <Text style={styles.cardHeaderSub}>
                Yükleme kalitesi ve fotoğraf onay akışını yapılandırın.
              </Text>
            </View>
          </View>

          {/* Original Quality Upload Option */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.switchLabel}>Orijinal Kalitede Yükleme</Text>
                {!enableCompression && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningBadgeText}>Kota Hızlı Dolar</Text>
                  </View>
                )}
              </View>
              <Text style={styles.switchSub}>
                {!enableCompression
                  ? 'Fotoğraflar sıkıştırılmadan orijinal ham çözünürlüğünde (3-8 MB) saklanır.'
                  : 'Fotoğraflar kalite kaybı yaşanmadan optimize edilerek hızlı yüklenir (Önerilen).'}
              </Text>
            </View>
            <Switch
              value={!enableCompression}
              onValueChange={(val) => setEnableCompression(!val)}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Auto Approve Photos */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Fotoğrafları Otomatik Onayla</Text>
              <Text style={styles.switchSub}>
                Misafirlerin yüklediği fotoğraflar moderatör onayı beklemeden anında galeride ve canlı projeksiyonda görünsün.
              </Text>
            </View>
            <Switch
              value={autoApprovePhotos}
              onValueChange={setAutoApprovePhotos}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>
        </View>

        {/* Section 4: Guest Permissions & Interactive Features */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people-outline" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeader}>4. Misafir İzinleri & Ekstra Özellikler</Text>
              <Text style={styles.cardHeaderSub}>
                Misafirlerin yapabileceği etkileşimleri belirleyin.
              </Text>
            </View>
          </View>

          {/* Guest Download Permission */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Misafirler Fotoğraf İndirebilsin</Text>
              <Text style={styles.switchSub}>
                Misafirler galerideki fotoğrafları telefonlarına tek tek veya albüm bazlı indirebilir.
              </Text>
            </View>
            <Switch
              value={allowGuestDownloads}
              onValueChange={setAllowGuestDownloads}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Guestbook Toggle */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Ziyaretçi Anı Defteri & Tebrik Notları</Text>
              <Text style={styles.switchSub}>
                Misafirleriniz dijital anı defterine çiftinize özel tebrik, anı ve iyi dilek mesajları bırakabilsin.
              </Text>
            </View>
            <Switch
              value={allowGuestbook}
              onValueChange={setAllowGuestbook}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>
        </View>

        {/* Section 5: Live Feed & Screen Mirroring */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#FAF5FF' }]}>
              <Ionicons name="tv-outline" size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeader}>5. Canlı Yayın & Projeksiyon Modu</Text>
              <Text style={styles.cardHeaderSub}>
                Salondaki dev ekranda veya projeksiyonda slayt gösterisi.
              </Text>
            </View>
          </View>

          {/* Live Feed Projector Toggle */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Canlı Projeksiyon & Slayt Modu</Text>
              <Text style={styles.switchSub}>
                Salondaki ekranda misafirlerin yüklediği yeni fotoğraflar canlı olarak yansıtılsın.
              </Text>
            </View>
            <Switch
              value={isLiveFeedActive}
              onValueChange={setIsLiveFeedActive}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          <TouchableOpacity
            style={styles.openLiveBtn}
            onPress={() => router.push(`/${activeSavedSlug}/canli` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle-outline" size={18} color="#8B5CF6" />
            <Text style={styles.openLiveBtnText}>Canlı Projeksiyon Ekranını Aç ({activeSavedSlug}/canli)</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Save Action Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Ayarları Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Share Event Modal */}
      <ShareEventModal
        visible={isShareModalOpen}
        event={eventData}
        onClose={() => setIsShareModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  navSub: {
    fontSize: 12,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  saveHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    minWidth: 70,
  },
  saveHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  shareHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EAD7BB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  shareHeaderBtnText: {
    color: '#8A6D3B',
    fontSize: 13,
    fontWeight: '700',
  },
  iconOnlyHeaderBtn: {
    width: 38,
    height: 38,
    minWidth: 38,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareActionCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  shareActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareActionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  shareActionSub: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
  },
  demoWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  demoWarningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  demoWarningText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  demoRegisterBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  demoRegisterBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  cardHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EAD7BB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  inputGroup: {
    marginTop: 4,
  },
  labelRowWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 16,
  },
  slugInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#E2D9CC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  slugInputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  slugInputContainerSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  slugPrefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 2,
  },
  slugPrefixText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  slugTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    paddingVertical: 8,
  },
  slugResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FAF5EA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAD7BB',
  },
  slugResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  slugStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  slugStatusBadgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  slugStatusBadgeError: {
    backgroundColor: '#FEE2E2',
  },
  slugStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slugStatusBadgeTextSuccess: {
    color: '#166534',
  },
  slugStatusBadgeTextError: {
    color: '#991B1B',
  },
  slugFeedbackText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 6,
  },
  slugFeedbackSuccess: {
    color: '#059669',
  },
  slugFeedbackError: {
    color: '#DC2626',
  },
  slugNoticeText: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 6,
    lineHeight: 16,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  slugLockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  slugValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  inputLocked: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F4EE',
  },
  switchLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warningBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
  },
  pinBox: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  pinInput: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    color: '#1A1817',
    width: 140,
    alignSelf: 'flex-start',
  },
  pinHelpText: {
    fontSize: 10.5,
    color: '#8A6D3B',
    marginTop: 6,
  },
  openLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  openLiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  bottomBar: {
    marginTop: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
});
