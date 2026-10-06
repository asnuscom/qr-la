import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { authService } from '@/services/authService';
import { slugify, DEMO_PHOTOS } from '@/services/mockData';
import { EventModel, PhotoModel, UserModel, AlbumModel } from '@/types';
import { StorageMeter } from '@/components/StorageMeter';

export default function HostPanelScreen() {
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [isPrivate, setIsPrivate] = useState(false);
  const [pinCode, setPinCode] = useState('1923');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [originalQuality, setOriginalQuality] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const resolveActiveSlug = (user: UserModel | null): string => {
    if (!user) return 'demo-panel';
    if (user.uid === 'demo-host-yavuz') return 'demo-panel';
    const personal = user.events?.find((s) => s && s !== 'demo-panel' && s !== 'samet-ve-sule' && s !== 'yavuz-ve-merve');
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
      setIsPrivate(ev.settings.isPrivate);
      setPinCode(ev.settings.pinCode || '1923');
      setAllowDownloads(ev.settings.allowGuestDownloads);
      setIsLiveFeedActive(ev.settings.isLiveFeedActive);
      setOriginalQuality(Boolean((ev.settings as any).originalQuality || !ev.settings.enableCompression));
      setHasUnsavedSettings(false);
    }
    const ph = await eventService.getPhotos(activeSlug);
    setPhotos(ph);
    const alb = await eventService.getAlbums(activeSlug);
    setAlbums(alb);
  };

  const handleAddCategory = async () => {
    if (!event || !newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      await eventService.addAlbum(event.slug, newCategoryName.trim());
      const updated = await eventService.getAlbums(event.slug);
      setAlbums(updated);
      setNewCategoryName('');
      Alert.alert('Kategori Eklendi! 🏷️', `"${newCategoryName.trim()}" kategorisi başarıyla eklendi.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Kategori eklenirken bir sorun oluştu.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (album: AlbumModel) => {
    if (!event) return;
    if (album.id === 'alb-all' || album.id === 'alb-genel' || album.slug === 'all' || album.slug === 'genel') {
      Alert.alert('Bilgi', 'Varsayılan sistem kategorisi silinemez.');
      return;
    }

    Alert.alert(
      'Kategoriyi Sil',
      `"${album.name}" kategorisini silmek istediğinizden emin misiniz? (Bu kategorideki fotoğraflar "Genel" kategorisine aktarılacaktır.)`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await eventService.deleteAlbum(event.slug, album.id);
            const updated = await eventService.getAlbums(event.slug);
            setAlbums(updated);
            Alert.alert('Silindi', `"${album.name}" kategorisi başarıyla silindi.`);
          },
        },
      ]
    );
  };

  // Re-fetch data whenever user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      const u = authService.getState().user;
      setCurrentUser(u);
      loadData(u);
    }, [])
  );

  // Live real-time listener for photos
  useEffect(() => {
    const activeSlug = resolveActiveSlug(currentUser);
    const unsub = eventService.subscribePhotos(activeSlug, (updatedPhotos) => {
      setPhotos(updatedPhotos);
    });
    return () => unsub();
  }, [currentUser]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentUser);
    setIsRefreshing(false);
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

  const handleSaveSettings = async () => {
    if (!event) return;
    if (isPrivate && (!pinCode || pinCode.trim().length !== 4)) {
      Alert.alert('Eksik Bilgi', 'PIN koruması aktifken lütfen 4 haneli geçerli bir PIN kodu giriniz.');
      return;
    }

    setIsSavingSettings(true);
    try {
      const updatedSettings = {
        ...event.settings,
        isPrivate,
        pinCode: pinCode.trim(),
        allowGuestDownloads: allowDownloads,
        isLiveFeedActive,
        enableCompression: !originalQuality,
        originalQuality,
      };

      await eventService.saveEvent(event.slug, { settings: updatedSettings });
      setEvent({ ...event, settings: updatedSettings });
      setHasUnsavedSettings(false);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3500);

      Alert.alert('Başarılı! 🎉', 'Gizlilik ve etkinlik ayarlarınız başarıyla güncellendi.');
    } catch (e) {
      console.error('Settings save error:', e);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setIsSavingSettings(false);
    }
  };

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

  const handleDownloadAllZip = () => {
    Alert.alert(
      'Arşiv İndirme',
      `${photos.length} adet yüksek çözünürlüklü fotoğraf ZIP arşivi olarak hazırlanıyor. İndirme birazdan başlayacaktır!`
    );
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!event) return;
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı kalıcı olarak silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await eventService.deletePhoto(event.slug, photoId);
            loadData(currentUser);
          },
        },
      ]
    );
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
          <TouchableOpacity
            style={styles.viewEventBtn}
            onPress={() => router.push(`/${event.slug}` as any)}
          >
            <Ionicons name="eye-outline" size={16} color="#FFF" />
            <Text style={styles.viewEventText}>Sayfayı Gör</Text>
          </TouchableOpacity>
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
              onPress={() => {
                authService.signOut();
                Alert.alert('Çıkış Yapıldı', 'Hesabınızdan güvenle çıkış yaptınız.');
              }}
            >
              <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              <Text style={styles.logoutText}>Çıkış</Text>
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

        {/* Prominent Edit / Setup Button */}
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
              İsimler, kapak görseli, mekan, akış saatleri ve tema ayarları
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C5A059" />
        </TouchableOpacity>

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
            onPress={handleDownloadAllZip}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="archive-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionTitle}>ZIP İndir</Text>
            <Text style={styles.actionDesc}>Tüm {photos.length} fotoğrafı tek tıkla cihazına indir.</Text>
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
            <View style={[styles.actionIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flash-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionTitle}>Kota Yükselt</Text>
            <Text style={styles.actionDesc}>2 GB, 5 GB veya VIP 15 GB depolamaya geç.</Text>
          </TouchableOpacity>
        </View>

        {/* Security & Event Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.settingsHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeaderTitle}>Gizlilik & Etkinlik Ayarları</Text>
              <Text style={styles.sectionHeaderSub}>Misafir erişimi ve yükleme kuralları</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.saveSettingsHeaderBtn,
                hasUnsavedSettings && styles.saveSettingsHeaderBtnActive,
                isSavingSettings && { opacity: 0.6 },
              ]}
              onPress={handleSaveSettings}
              disabled={isSavingSettings}
              activeOpacity={0.8}
            >
              {isSavingSettings ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={settingsSaveSuccess ? 'checkmark-circle' : 'save-outline'}
                    size={15}
                    color="#FFF"
                  />
                  <Text style={styles.saveSettingsHeaderBtnText}>
                    {settingsSaveSuccess ? 'Kaydedildi' : 'Kaydet'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Private Event Switch */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingLabel}>PIN Kodu ile Galeri Koruması</Text>
              <Text style={styles.settingDesc}>
                Fotoğraf galerisine yalnızca masadaki PIN koduna sahip misafirler girebilir.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={(val) => {
                setIsPrivate(val);
                setHasUnsavedSettings(true);
              }}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {isPrivate && (
            <View style={styles.pinConfigRow}>
              <Text style={styles.pinLabel}>4 Haneli PIN Kodu:</Text>
              <TextInput
                style={styles.pinInputField}
                value={pinCode}
                onChangeText={(newPin) => {
                  setPinCode(newPin);
                  setHasUnsavedSettings(true);
                }}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          )}

          {/* Allow Guest Downloads */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingLabel}>Misafir İndirme İzni</Text>
              <Text style={styles.settingDesc}>
                Misafirler galerideki fotoğrafları kendi cihazlarına indirebilsin.
              </Text>
            </View>
            <Switch
              value={allowDownloads}
              onValueChange={(val) => {
                setAllowDownloads(val);
                setHasUnsavedSettings(true);
              }}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Live Feed active */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingLabel}>Canlı Projeksiyon Yayını</Text>
              <Text style={styles.settingDesc}>
                Yeni yüklenen fotoğraflar anında projeksiyon slayt ekranına düşsün.
              </Text>
            </View>
            <Switch
              value={isLiveFeedActive}
              onValueChange={(val) => {
                setIsLiveFeedActive(val);
                setHasUnsavedSettings(true);
              }}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {/* Original Quality Upload Switch */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.settingLabel}>Orijinal Kalite Seçeneği</Text>
                {originalQuality && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningBadgeText}>Kota Hızlı Dolar</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDesc}>
                Fotoğraflar sıkıştırılmadan orijinal ham çözünürlüğünde (3-8 MB) yüklensin.
              </Text>
            </View>
            <Switch
              value={originalQuality}
              onValueChange={(val) => {
                setOriginalQuality(val);
                setHasUnsavedSettings(true);
              }}
              trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
            />
          </View>

          {originalQuality && (
            <View style={styles.quotaWarningBox}>
              <View style={styles.quotaWarningHeader}>
                <Ionicons name="warning" size={18} color="#D97706" />
                <Text style={styles.quotaWarningTitle}>Depolama Kotası Uyarısı</Text>
              </View>
              <Text style={styles.quotaWarningDesc}>
                ⚠️ Dikkat: Orijinal boyutta yüklerseniz 500 MB depolama kotanız çok daha çabuk dolar. Her bir görsel ortalama 3-8 MB yer kaplayacağı için toplam fotoğraf kapasiteniz düşebilir.
              </Text>
            </View>
          )}

          {/* Bottom Prominent Save Button */}
          <TouchableOpacity
            style={[
              styles.saveSettingsMainBtn,
              hasUnsavedSettings && styles.saveSettingsMainBtnActive,
              isSavingSettings && { opacity: 0.7 },
            ]}
            onPress={handleSaveSettings}
            disabled={isSavingSettings}
            activeOpacity={0.8}
          >
            {isSavingSettings ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={settingsSaveSuccess ? 'checkmark-circle' : 'checkmark-done'}
                  size={18}
                  color="#FFF"
                />
                <Text style={styles.saveSettingsMainBtnText}>
                  {settingsSaveSuccess
                    ? 'Ayarlar Kaydedildi!'
                    : hasUnsavedSettings
                    ? 'Değişiklikleri Kaydet'
                    : 'Ayarları Kaydet'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Gallery Categories Management Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeaderTitle}>Galeri Kategorileri (Albümler)</Text>
              <Text style={styles.sectionHeaderSub}>
                Misafirler fotoğrafları bu kategorilere göre yükler ve galeri içinde filtreler
              </Text>
            </View>
            <View style={styles.catCountBadge}>
              <Text style={styles.catCountBadgeText}>{albums.length} Kategori</Text>
            </View>
          </View>

          <View style={styles.catListWrap}>
            {albums.map((album) => {
              const isAll = album.id === 'alb-all' || album.slug === 'all';
              const isDefault = album.id === 'alb-genel' || album.slug === 'genel';
              const isCustom = !isAll && !isDefault;
              const photoCount = isAll
                ? photos.length
                : isDefault
                ? photos.filter((p) => !p.albumId || p.albumId === 'alb-genel').length
                : photos.filter((p) => p.albumId === album.id).length;

              return (
                <View key={album.id} style={styles.catItemRow}>
                  <View style={styles.catItemInfo}>
                    <View style={[styles.catIconWrap, isDefault && { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons
                        name={isAll ? 'albums' : isDefault ? 'folder' : 'folder-outline'}
                        size={18}
                        color={isDefault ? '#D97706' : '#C5A059'}
                      />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.catItemName}>{album.name}</Text>
                        {isDefault && (
                          <View style={styles.catDefaultBadge}>
                            <Text style={styles.catDefaultBadgeText}>Varsayılan</Text>
                          </View>
                        )}
                        {isAll && (
                          <View style={styles.catSystemBadge}>
                            <Text style={styles.catSystemBadgeText}>Filtre</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.catItemSub}>{photoCount} Fotoğraf</Text>
                    </View>
                  </View>

                  {isCustom && (
                    <TouchableOpacity
                      style={styles.catDeleteBtn}
                      onPress={() => handleDeleteCategory(album)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Quick Add Category Input */}
          <View style={styles.addCatRow}>
            <TextInput
              style={styles.addCatInput}
              placeholder="Yeni Kategori (Örn: Aile, Pasta, Dans...)"
              placeholderTextColor="#9CA3AF"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onSubmitEditing={handleAddCategory}
            />
            <TouchableOpacity
              style={[
                styles.addCatBtn,
                (!newCategoryName.trim() || isAddingCategory) && styles.addCatBtnDisabled,
              ]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim() || isAddingCategory}
              activeOpacity={0.8}
            >
              {isAddingCategory ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="add" size={18} color="#FFF" />
                  <Text style={styles.addCatBtnText}>Ekle</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Moderation section */}
        <View style={styles.moderationSection}>
          <View style={styles.modHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Fotoğraf Yönetimi & Moderasyon</Text>
            <Text style={styles.modCountText}>{photos.length} Görsel</Text>
          </View>
          <Text style={styles.modDesc}>
            İstemediğiniz veya uygunsuz bulduğunuz fotoğrafları tek tıkla silebilirsiniz.
          </Text>

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
          ) : (
            <View style={styles.modGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.modCard}>
                  <Image source={{ uri: photo.thumbnailUrl || photo.originalUrl }} style={styles.modImage} />
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
          )}
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
  editSetupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C5A059',
    gap: 12,
    shadowColor: '#C5A059',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
  quotaWarningBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginTop: 8,
    marginBottom: 8,
  },
  quotaWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quotaWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  quotaWarningDesc: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  settingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  saveSettingsHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#C5A059',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  saveSettingsHeaderBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  saveSettingsHeaderBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  saveSettingsMainBtn: {
    backgroundColor: '#C5A059',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: '#C5A059',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  saveSettingsMainBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  saveSettingsMainBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
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
});
