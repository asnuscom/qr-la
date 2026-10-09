import { StorageMeter } from '@/components/StorageMeter';
import { ShareEventModal } from '@/components/ShareEventModal';
import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { DEMO_PHOTOS, slugify } from '@/services/mockData';
import { EventModel, PhotoModel, UserModel } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import JSZip from 'jszip';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HostPanelScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // ZIP Download progress state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgressText, setZipProgressText] = useState('');
  const [zipPercent, setZipPercent] = useState(0);

  // Moderation pagination & search states
  const MOD_PAGE_SIZE = 30;
  const [modVisibleCount, setModVisibleCount] = useState<number>(MOD_PAGE_SIZE);
  const [isModLoadingMore, setIsModLoadingMore] = useState<boolean>(false);
  const [modSearchQuery, setModSearchQuery] = useState<string>('');
  const [modMediaTypeFilter, setModMediaTypeFilter] = useState<'all' | 'photo' | 'video'>('all');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Yönetim Paneli | QR-la';
    }
  }, []);


  const resolveActiveSlug = (user: UserModel | null): string => {
    if (paramSlug && paramSlug !== 'demo-panel') return paramSlug;
    if (!user) return 'demo-panel';
    if (user.uid === 'demo-host-yavuz') return 'demo-panel';
    const personal = user.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule');
    if (personal) return personal;
    const rawName = user.displayName || user.email?.split('@')[0] || 'etkinlik';
    return slugify(rawName);
  };

  const loadData = async (userToUse?: UserModel | null) => {
    const targetUser = userToUse !== undefined ? userToUse : currentUser;
    const activeSlug = resolveActiveSlug(targetUser);
    const ev = await eventService.getEvent(activeSlug, targetUser?.displayName);
    if (ev) {
      setEvent(ev);
    }
    const ph = await eventService.getPhotos(activeSlug);
    setPhotos(ph);
  };



  // Re-fetch data whenever user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      const u = authService.getState().user;
      setCurrentUser(u);
      loadData(u);
    }, [paramSlug])
  );

  // Live real-time listener for photos
  useEffect(() => {
    const activeSlug = resolveActiveSlug(currentUser);
    const unsub = eventService.subscribePhotos(activeSlug, (updatedPhotos) => {
      setPhotos(updatedPhotos);
    });
    return () => unsub();
  }, [currentUser, paramSlug]);

  // Live subscription to auth state changes
  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentUser);
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    const executeLogout = async () => {
      try {
        await authService.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
      setCurrentUser(null);
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

  const handleLoadSamplePhotos = async () => {
    if (!event) return;
    setIsLoadingSamples(true);
    try {
      for (const sample of DEMO_PHOTOS) {
        await eventService.addPhoto(event.slug, {
          eventSlug: event.slug,
          albumId: sample.albumId || 'alb-1',
          originalUrl: sample.originalUrl,
          thumbnailUrl: sample.thumbnailUrl,
          uploaderName: sample.uploaderName,
          tableNumber: sample.tableNumber,
          guestNote: sample.guestNote,
          sizeBytes: sample.sizeBytes,
        });
      }
      await loadData(currentUser);
      Alert.alert(
        'Örnek Fotoğraflar Yüklendi! 📸',
        'Etkinliğinize 6 adet örnek misafir fotoğrafı eklendi. Moderasyon ve galeri özelliklerini hemen test edebilirsiniz.'
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Örnek fotoğraflar yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoadingSamples(false);
    }
  };



  const isDemo = event?.slug === 'demo-panel' || !currentUser || currentUser.uid === 'demo-host-yavuz';

  useEffect(() => {
    const initialUser = authService.getState().user;
    setCurrentUser(initialUser);
    loadData(initialUser);

    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
      loadData(state.user);
    });
    return () => unsub();
  }, []);

  const handleDownloadAllZip = async () => {
    if (!photos || photos.length === 0) {
      Alert.alert('İndirilecek Fotoğraf Yok', 'Galeride henüz indirilmeye hazır fotoğraf veya video bulunmuyor.');
      return;
    }

    if (isZipping) return;

    setIsZipping(true);
    setZipPercent(5);
    setZipProgressText(`Arşiv hazırlanıyor (0/${photos.length})...`);

    try {
      const zip = new JSZip();
      const folderName = `${event?.slug || 'etkinlik'}-fotograflar`;
      const imgFolder = zip.folder(folderName) || zip;

      let downloadedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        setZipProgressText(`Medya indiriliyor (${i + 1}/${photos.length})...`);
        setZipPercent(Math.round(5 + ((i + 1) / photos.length) * 75));

        try {
          const mediaUrl = photo.originalUrl || photo.thumbnailUrl;
          const response = await fetch(mediaUrl);
          if (!response.ok) throw new Error('Fetch failed');
          const blob = await response.blob();

          const isVideo = photo.mediaType === 'video';
          const ext = isVideo ? 'mp4' : 'jpg';
          const guest = (photo.uploaderName || 'misafir')
            .replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, '_')
            .slice(0, 20);
          const filename = `${String(i + 1).padStart(3, '0')}_${guest}_${photo.id.slice(0, 6)}.${ext}`;

          imgFolder.file(filename, blob);
          downloadedCount++;
        } catch (fetchErr) {
          console.warn(`Photo ${photo.id} could not be downloaded into ZIP:`, fetchErr);
          failedCount++;
        }
      }

      if (downloadedCount === 0) {
        throw new Error('Dosyalar indirilemedi. İnternet bağlantınızı kontrol edin.');
      }

      setZipProgressText('ZIP arşivi sıkıştırılıyor...');
      setZipPercent(85);

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        },
        (metadata) => {
          if (metadata.percent) {
            setZipPercent(Math.round(85 + (metadata.percent * 0.14)));
          }
        }
      );

      setZipPercent(100);
      setZipProgressText('İndirme başlatılıyor...');

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${event?.slug || 'etkinlik'}-tum-fotograflar.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      } else {
        Alert.alert('Tamamlandı', `${downloadedCount} adet medya dosyası ZIP olarak paketlendi.`);
      }

      setTimeout(() => {
        setIsZipping(false);
        setZipProgressText('');
        setZipPercent(0);
        if (failedCount > 0) {
          Alert.alert(
            'İndirme Tamamlandı 📦',
            `${downloadedCount} adet medya dosyası ZIP olarak indirildi. (${failedCount} dosya sunucu erişim kısıtı nedeniyle atlandı.)`
          );
        }
      }, 1000);
    } catch (err: any) {
      console.error('ZIP creation error:', err);
      setIsZipping(false);
      setZipProgressText('');
      setZipPercent(0);
      Alert.alert(
        'İndirme Başarısız',
        'ZIP arşivi oluşturulurken bir hata meydana geldi: ' + (err?.message || 'Bilinmeyen hata')
      );
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!event) return;

    if (isDemo) {
      Alert.alert(
        'Demo Modu 🔒',
        'Örnek demo fotoğrafları diğer ziyaretçilerin inceleyebilmesi için silinemez. Kendi fotoğraflarınızı yönetmek için ücretsiz kayıt olabilirsiniz.'
      );
      return;
    }

    const executeDelete = async () => {
      // Optimistic instant UI update
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      await eventService.deletePhoto(event.slug, photoId);
      await loadData(currentUser);
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Bu fotoğrafı kalıcı olarak silmek istediğinizden emin misiniz?') : true;
      if (confirmed) {
        await executeDelete();
      }
    } else {
      Alert.alert(
        'Fotoğrafı Sil',
        'Bu fotoğrafı kalıcı olarak silmek istediğinizden emin misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  const filteredModPhotos = photos.filter((p) => {
    if (modMediaTypeFilter === 'photo' && p.mediaType === 'video') return false;
    if (modMediaTypeFilter === 'video' && p.mediaType !== 'video') return false;
    if (modSearchQuery.trim()) {
      const q = modSearchQuery.toLowerCase().trim();
      const matchName = (p.uploaderName || '').toLowerCase().includes(q);
      const matchTable = (p.tableNumber || '').toLowerCase().includes(q);
      const matchNote = (p.guestNote || '').toLowerCase().includes(q);
      return matchName || matchTable || matchNote;
    }
    return true;
  });

  const displayedModPhotos = filteredModPhotos.slice(0, modVisibleCount);
  const hasMoreMod = modVisibleCount < filteredModPhotos.length;
  const remainingMod = filteredModPhotos.length - modVisibleCount;

  const handleLoadMoreMod = () => {
    setIsModLoadingMore(true);
    setTimeout(() => {
      setModVisibleCount((prev) => Math.min(prev + MOD_PAGE_SIZE, filteredModPhotos.length));
      setIsModLoadingMore(false);
    }, 200);
  };

  if (!event) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#C5A059"
            colors={['#C5A059']}
          />
        }
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Ev Sahibi Kontrol Paneli</Text>
            <Text style={styles.navSub}>{event.title}</Text>
          </View>
          <View style={styles.navRightActions}>
            <TouchableOpacity
              style={[styles.shareEventBtn, isMobile && styles.iconOnlyHeaderBtn]}
              onPress={() => setIsShareModalOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Paylaş"
            >
              <Ionicons name="share-social-outline" size={17} color="#8A6D3B" />
              {!isMobile && <Text style={styles.shareEventText}>Paylaş</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewEventBtn, isMobile && styles.iconOnlyHeaderBtn]}
              onPress={() => router.push(`/${event.slug}` as any)}
              activeOpacity={0.8}
              accessibilityLabel="Sayfayı Gör"
            >
              <Ionicons name="eye-outline" size={17} color="#FFF" />
              {!isMobile && <Text style={styles.viewEventText}>Sayfayı Gör</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* User Account Bar */}
        {currentUser ? (
          <View style={styles.userBar}>
            <View style={styles.userInfoRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {currentUser.displayName?.charAt(0).toUpperCase() || 'E'}
                </Text>
              </View>
              <View>
                <Text style={styles.userWelcome}>Hoş geldiniz,</Text>
                <Text style={styles.userName}>{currentUser.displayName || currentUser.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestHostBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestHostTitle}>Ev Sahibi Hesabı</Text>
              <Text style={styles.guestHostSub}>
                Etkinliklerinizi güvenle saklamak için giriş yapın veya yeni hesap açın.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.loginCtaBtn}
              onPress={() => router.push('/giris' as any)}
            >
              <Ionicons name="log-in-outline" size={16} color="#FFF" />
              <Text style={styles.loginCtaText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Storage Meter */}
        <StorageMeter
          storage={{
            ...event.storage,
            photoCount: photos.length,
            usedBytes:
              photos.length > 0
                ? photos.reduce((acc, p) => acc + (p.sizeBytes || 650000), 0)
                : event.storage.usedBytes,
          }}
          onUpgradePress={() => router.push(`/panel/tarifeler?slug=${event.slug}` as any)}
        />

        {/* Prominent Host Management Action Cards */}
        <View style={styles.topActionCardsContainer}>
          <TouchableOpacity
            style={styles.editSetupCard}
            onPress={() => router.push(`/panel/duzenle?slug=${event.slug}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.editSetupIcon}>
              <Ionicons name="create" size={22} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.editSetupTitle}>Etkinlik Bilgilerini & Akışı Düzenle</Text>
              <Text style={styles.editSetupSub}>
                İsimler, kapak görseli, mekan, akış saatleri ve albüm kategorileri
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C5A059" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editSetupCard, styles.settingsSetupCard]}
            onPress={() => router.push(`/panel/ayarlar?slug=${event.slug}` as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.editSetupIcon, styles.settingsSetupIcon]}>
              <Ionicons name="shield-checkmark" size={22} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.editSetupTitle}>Özel Bağlantı, Gizlilik & Ayarlar</Text>
              <Text style={styles.editSetupSub}>
                Özel URL (slug), galeri PIN şifresi, canlı yayın ve misafir kuralları
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Quick Host Actions */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/panel/qr-kart' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#FAF7F2' }]}>
              <Ionicons name="print-outline" size={24} color="#C5A059" />
            </View>
            <Text style={styles.actionTitle}>Masa Kartları</Text>
            <Text style={styles.actionDesc}>Yazdırılabilir QR masa standı şablonunu hazırla.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setIsShareModalOpen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <Text style={styles.actionTitle}>WhatsApp'ta Paylaş</Text>
            <Text style={styles.actionDesc}>Misafirlere hazır davet ve yükleme linki gönder.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, isZipping && { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}
            onPress={handleDownloadAllZip}
            disabled={isZipping}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: isZipping ? '#DCFCE7' : '#F0FDF4' }]}>
              {isZipping ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <Ionicons name="archive-outline" size={24} color="#10B981" />
              )}
            </View>
            <Text style={[styles.actionTitle, isZipping && { color: '#047857' }]}>
              {isZipping ? `Hazırlanıyor (%${zipPercent})` : 'ZIP İndir'}
            </Text>
            <Text style={styles.actionDesc}>
              {isZipping
                ? zipProgressText || 'Arşiv sıkıştırılıyor...'
                : `Tüm ${photos.length} fotoğrafı tek tıkla cihazına indir.`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(`/${event.slug}/canli` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="tv-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionTitle}>Projeksiyon Modu</Text>
            <Text style={styles.actionDesc}>Salondaki TV veya projeksiyona tam ekran yansıt.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/panel/tarifeler' as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIconWrap,
                { backgroundColor: event.storage.tier === 'vip' ? '#EDE9FE' : '#FEF3C7' },
              ]}
            >
              <Ionicons
                name={event.storage.tier === 'vip' ? 'shield-checkmark-outline' : 'flash-outline'}
                size={24}
                color={event.storage.tier === 'vip' ? '#8B5CF6' : '#D97706'}
              />
            </View>
            <Text style={styles.actionTitle}>
              {event.storage.tier === 'vip' ? 'Tarifeler & Paket' : 'Kota Yükselt'}
            </Text>
            <Text style={styles.actionDesc}>
              {event.storage.tier === 'vip'
                ? 'VIP 15 GB en yüksek paket aktif.'
                : '2 GB, 5 GB veya VIP 15 GB depolamaya geç.'}
            </Text>
          </TouchableOpacity>
        </View>





        {/* Moderation section */}
        <View style={styles.moderationSection}>
          <View style={styles.modHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Fotoğraf Yönetimi & Moderasyon</Text>
            <Text style={styles.modCountText}>
              {filteredModPhotos.length === photos.length
                ? `${photos.length} Görsel`
                : `${filteredModPhotos.length} / ${photos.length} Görsel`}
            </Text>
          </View>
          <Text style={styles.modDesc}>
            İstemediğiniz veya uygunsuz bulduğunuz fotoğrafları tek tıkla silebilirsiniz.
          </Text>

          {/* Search & Media Filter Controls for High Volume (1000+ Items) */}
          {photos.length > 0 && (
            <View style={styles.modFilterBar}>
              <View style={styles.modSearchWrap}>
                <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                <TextInput
                  style={styles.modSearchInput}
                  placeholder="Misafir adı, masa no veya not ara..."
                  value={modSearchQuery}
                  onChangeText={(val) => {
                    setModSearchQuery(val);
                    setModVisibleCount(MOD_PAGE_SIZE);
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {modSearchQuery.trim() ? (
                  <TouchableOpacity
                    onPress={() => {
                      setModSearchQuery('');
                      setModVisibleCount(MOD_PAGE_SIZE);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.modTypeChipsRow}>
                <TouchableOpacity
                  style={[styles.modTypeChip, modMediaTypeFilter === 'all' && styles.modTypeChipActive]}
                  onPress={() => {
                    setModMediaTypeFilter('all');
                    setModVisibleCount(MOD_PAGE_SIZE);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modTypeChipText, modMediaTypeFilter === 'all' && styles.modTypeChipTextActive]}>
                    Tümü ({photos.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modTypeChip, modMediaTypeFilter === 'photo' && styles.modTypeChipActive]}
                  onPress={() => {
                    setModMediaTypeFilter('photo');
                    setModVisibleCount(MOD_PAGE_SIZE);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={13} color={modMediaTypeFilter === 'photo' ? '#FFF' : '#6B7280'} />
                  <Text style={[styles.modTypeChipText, modMediaTypeFilter === 'photo' && styles.modTypeChipTextActive]}>
                    Fotoğraflar ({photos.filter((p) => p.mediaType !== 'video').length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modTypeChip, modMediaTypeFilter === 'video' && styles.modTypeChipActive]}
                  onPress={() => {
                    setModMediaTypeFilter('video');
                    setModVisibleCount(MOD_PAGE_SIZE);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="videocam-outline" size={13} color={modMediaTypeFilter === 'video' ? '#FFF' : '#6B7280'} />
                  <Text style={[styles.modTypeChipText, modMediaTypeFilter === 'video' && styles.modTypeChipTextActive]}>
                    Videolar ({photos.filter((p) => p.mediaType === 'video').length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {photos.length === 0 ? (
            <View style={styles.emptyModBox}>
              <View style={styles.emptyModIconCircle}>
                <Ionicons name="images-outline" size={32} color="#C5A059" />
              </View>
              <Text style={styles.emptyModTitle}>Henüz Fotoğraf Yüklenmedi</Text>
              <Text style={styles.emptyModSubtitle}>
                Bu yeni etkinlik için henüz fotoğraf bulunmuyor. Masa QR kodunu paylaşarak misafirlerden fotoğraf toplayabilir veya sistemi hemen denemek için örnek fotoğrafları yükleyebilirsiniz.
              </Text>
              <View style={styles.emptyModActionsRow}>
                <TouchableOpacity
                  style={styles.emptyModBtnPrimary}
                  onPress={() => router.push('/panel/qr-kart' as any)}
                >
                  <Ionicons name="print-outline" size={16} color="#FFF" />
                  <Text style={styles.emptyModBtnText}>Masa QR Kartı</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.emptyModBtnSecondary}
                  onPress={() => router.push(`/${event.slug}/yukle` as any)}
                >
                  <Ionicons name="camera-outline" size={16} color="#1A1817" />
                  <Text style={styles.emptyModBtnSecondaryText}>Fotoğraf Yükle</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.emptyModBtnSamples, isLoadingSamples && { opacity: 0.6 }]}
                onPress={handleLoadSamplePhotos}
                disabled={isLoadingSamples}
                activeOpacity={0.8}
              >
                {isLoadingSamples ? (
                  <ActivityIndicator color="#C5A059" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#C5A059" />
                    <Text style={styles.emptyModBtnSamplesText}>
                      Örnek Fotoğrafları Yükle (Test Et)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : filteredModPhotos.length === 0 ? (
            <View style={styles.emptySearchResultBox}>
              <Ionicons name="search-outline" size={36} color="#9CA3AF" />
              <Text style={styles.emptySearchResultTitle}>Aramanıza Uygun Medya Bulunamadı</Text>
              <Text style={styles.emptySearchResultSub}>
                "{modSearchQuery}" ifadesiyle eşleşen misafir veya masa kaydı yok.
              </Text>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setModSearchQuery('');
                  setModMediaTypeFilter('all');
                  setModVisibleCount(MOD_PAGE_SIZE);
                }}
              >
                <Text style={styles.clearFilterBtnText}>Filtreleri Temizle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.modGrid}>
                {displayedModPhotos.map((photo) => (
                  <View key={photo.id} style={styles.modCard}>
                    {photo.mediaType === 'video' ? (
                      <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {Platform.OS === 'web' ? (
                          <video
                            src={photo.thumbnailUrl || photo.originalUrl}
                            muted
                            playsInline
                            preload="metadata"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              pointerEvents: 'none',
                            }}
                          />
                        ) : (
                          <Image source={{ uri: photo.thumbnailUrl || photo.originalUrl }} style={styles.modImage} />
                        )}
                        <View style={styles.modVideoBadge}>
                          <Ionicons name="videocam" size={11} color="#FFF" />
                        </View>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: photo.thumbnailUrl || photo.originalUrl }}
                        style={styles.modImage}
                        {...(Platform.OS === 'web' ? ({ loading: 'lazy' } as any) : {})}
                      />
                    )}
                    <View style={styles.modInfoRow}>
                      <Text style={styles.modUploader} numberOfLines={1}>
                        {photo.uploaderName || 'Misafir'}
                      </Text>
                      <TouchableOpacity
                        style={styles.modDeleteBtn}
                        onPress={() => handleDeletePhoto(photo.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Moderation Pagination Footer */}
              <View style={styles.modPaginationContainer}>
                <Text style={styles.modPaginationText}>
                  Toplam {filteredModPhotos.length} medyadan {Math.min(modVisibleCount, filteredModPhotos.length)} tanesi listeleniyor
                </Text>

                {hasMoreMod ? (
                  <TouchableOpacity
                    style={styles.modLoadMoreBtn}
                    onPress={handleLoadMoreMod}
                    disabled={isModLoadingMore}
                    activeOpacity={0.8}
                  >
                    {isModLoadingMore ? (
                      <ActivityIndicator size="small" color="#1A1817" />
                    ) : (
                      <>
                        <Ionicons name="sparkles-outline" size={16} color="#1A1817" />
                        <Text style={styles.modLoadMoreBtnText}>
                          Daha Fazla Göster (+{Math.min(MOD_PAGE_SIZE, remainingMod)})
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#1A1817" />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  filteredModPhotos.length > MOD_PAGE_SIZE && (
                    <View style={styles.modAllLoadedBadge}>
                      <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                      <Text style={styles.modAllLoadedText}>
                        Tüm fotoğraflar listelendi ({filteredModPhotos.length})
                      </Text>
                    </View>
                  )
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating ZIP Progress Banner */}
      {isZipping && (
        <View style={styles.zipFloatingBanner}>
          <View style={styles.zipFloatingTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.zipFloatingTitle}>ZIP Arşivi Paketleniyor...</Text>
            </View>
            <Text style={styles.zipFloatingPercent}>%{zipPercent}</Text>
          </View>
          <View style={styles.zipProgressBarTrack}>
            <View style={[styles.zipProgressBarFill, { width: `${zipPercent}%` }]} />
          </View>
          <Text style={styles.zipFloatingSub}>{zipProgressText}</Text>
        </View>
      )}

      {/* Share Event Modal */}
      <ShareEventModal
        visible={isShareModalOpen}
        event={event}
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
  scroll: {
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  shareEventText: {
    color: '#8A6D3B',
    fontSize: 12,
    fontWeight: '700',
  },
  viewEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewEventText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iconOnlyHeaderBtn: {
    width: 38,
    height: 38,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  pinConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  pinLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  pinInputField: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: '700',
    width: 70,
    textAlign: 'center',
  },
  moderationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  modHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A059',
  },
  modDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  modGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  modImage: {
    width: '100%',
    height: '100%',
  },
  modVideoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 5,
  },
  modInfoRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modUploader: {
    color: '#FFF',
    fontSize: 10,
    flex: 1,
  },
  modDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    padding: 4,
    borderRadius: 6,
  },
  topActionCardsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  editSetupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C5A059',
    gap: 12,
    shadowColor: '#C5A059',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsSetupCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FAFAFF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.06,
  },
  settingsSetupIcon: {
    backgroundColor: '#4F46E5',
  },
  editSetupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editSetupTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 2,
  },
  editSetupSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  userWelcome: {
    fontSize: 11,
    color: '#6B7280',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  guestHostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    gap: 12,
  },
  guestHostTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  guestHostSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  loginCtaText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyModBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    marginTop: 8,
  },
  emptyModIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  emptyModTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 6,
  },
  emptyModSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    maxWidth: 290,
  },
  emptyModActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyModBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  emptyModBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyModBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  emptyModBtnSecondaryText: {
    color: '#1A1817',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyModBtnSamples: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 12,
    width: '100%',
    maxWidth: 290,
  },
  emptyModBtnSamplesText: {
    color: '#C5A059',
    fontSize: 13,
    fontWeight: '700',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },

  categoriesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  categoriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  catCountBadge: {
    backgroundColor: '#FAF7F2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  catCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  catListWrap: {
    gap: 8,
    marginBottom: 16,
  },
  catItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  catItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  catItemSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  catDefaultBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  catDefaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  catSystemBadge: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  catSystemBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
  },
  catDeleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  addCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCatInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1817',
  },
  addCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addCatBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  addCatBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  zipFloatingBanner: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  zipFloatingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  zipFloatingTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  zipFloatingPercent: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  zipProgressBarTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  zipProgressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  zipFloatingSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  modFilterBar: {
    marginBottom: 16,
    gap: 10,
  },
  modSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  modSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1A1817',
    padding: 0,
  },
  modTypeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  modTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modTypeChipActive: {
    backgroundColor: '#1A1817',
    borderColor: '#1A1817',
  },
  modTypeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  modTypeChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  emptySearchResultBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptySearchResultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  emptySearchResultSub: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
  clearFilterBtn: {
    marginTop: 8,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  clearFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A059',
  },
  modPaginationContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  modPaginationText: {
    fontSize: 12,
    color: '#8A6D3B',
    fontWeight: '600',
    backgroundColor: '#FAF5EA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  modLoadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  modLoadMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  modAllLoadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  modAllLoadedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
});
