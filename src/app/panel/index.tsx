import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { authService } from '@/services/authService';
import { EventModel, PhotoModel, UserModel } from '@/types';
import { StorageMeter } from '@/components/StorageMeter';

export default function HostPanelScreen() {
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [isPrivate, setIsPrivate] = useState(false);
  const [pinCode, setPinCode] = useState('1923');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const loadData = async () => {
    const ev = await eventService.getEvent('demo-panel');
    if (ev) {
      setEvent(ev);
      setIsPrivate(ev.settings.isPrivate);
      setPinCode(ev.settings.pinCode || '1923');
      setAllowDownloads(ev.settings.allowGuestDownloads);
      setIsLiveFeedActive(ev.settings.isLiveFeedActive);
    }
    const ph = await eventService.getPhotos('demo-panel');
    setPhotos(ph);
  };

  useEffect(() => {
    loadData();
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
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
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı kalıcı olarak silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await eventService.deletePhoto('demo-panel', photoId);
            loadData();
          },
        },
      ]
    );
  };

  if (!event) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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
        <StorageMeter storage={event.storage} />

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
          <Text style={styles.sectionHeaderTitle}>Gizlilik & Etkinlik Ayarları</Text>

          {/* Private Event Switch */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingLabel}>PIN Kodu Koruması</Text>
              <Text style={styles.settingDesc}>
                Etkinliğe yalnızca masadaki PIN koduna sahip misafirler girebilir.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          {isPrivate && (
            <View style={styles.pinConfigRow}>
              <Text style={styles.pinLabel}>4 Haneli PIN Kodu:</Text>
              <TextInput
                style={styles.pinInputField}
                value={pinCode}
                onChangeText={setPinCode}
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
              onValueChange={setAllowDownloads}
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
              onValueChange={setIsLiveFeedActive}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
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
});
