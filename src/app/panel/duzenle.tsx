import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { authService } from '@/services/authService';
import { slugify } from '@/services/mockData';
import { EventModel, ScheduleItem } from '@/types';

// Curated luxury cover photo presets so user can pick with one tap
const COVER_PRESETS = [
  {
    id: 'cover-1',
    name: 'Klasik Vals',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-2',
    name: 'Kır Düğünü & Çiçek',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-3',
    name: 'Boğaz & Sahil',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cover-4',
    name: 'Romantik Mum Işığı',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  },
];

const THEME_PRESETS = [
  { name: 'Şampanya Altın', color: '#C5A059' },
  { name: 'Gül Kurusu', color: '#B76E79' },
  { name: 'Zümrüt Yeşili', color: '#059669' },
  { name: 'Asil Gece', color: '#1E293B' },
];

export default function EventFormScreen() {
  const router = useRouter();
  const { slug: paramSlug } = useLocalSearchParams<{ slug?: string }>();

  const user = authService.getState().user;
  const userSlug =
    (user && user.uid !== 'demo-host-yavuz' && user.events?.find((s) => s && s !== 'demo-panel' && s !== 'yavuz-ve-merve')) ||
    user?.events?.[0];
  const currentSlug = paramSlug || userSlug || 'demo-panel';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State initialized with rich defaults
  const [slug, setSlug] = useState(currentSlug);
  const [brideName, setBrideName] = useState('Merve');
  const [groomName, setGroomName] = useState('Yavuz');
  const [title, setTitle] = useState('Yavuz & Merve Düğünü');
  const [subtitle, setSubtitle] = useState(
    'Bu mutlu anımıza ortak olduğunuz için teşekkür ederiz. Masanızdaki QR kodu okutarak anılarınızı hemen paylaşabilirsiniz.'
  );
  const [eventDate, setEventDate] = useState('2026-10-18T19:00:00.000Z');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(COVER_PRESETS[0].url);
  const [primaryColor, setPrimaryColor] = useState('#C5A059');

  const [venueName, setVenueName] = useState('Sait Halim Paşa Yalısı');
  const [venueAddress, setVenueAddress] = useState('Köybaşı Cad. No:83, Yeniköy, Sarıyer / İstanbul');
  const [mapUrl, setMapUrl] = useState('https://maps.google.com/?q=Sait+Halim+Pasa+Yalisi+Istanbul');

  const [isPrivate, setIsPrivate] = useState(false);
  const [pinCode, setPinCode] = useState('1923');
  const [enableCompression, setEnableCompression] = useState(true);
  const [allowGuestDownloads, setAllowGuestDownloads] = useState(true);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: '18:30', title: 'Karşılama Kokteyli', description: 'Canlı müzik ve ikramlar' },
    { id: '2', time: '19:30', title: 'Nikah Töreni & İlk Dans', description: 'İlk vals' },
    { id: '3', time: '20:30', title: 'Akşam Yemeği & Orkestra', description: 'Yemek ve müzik dinletisi' },
    { id: '4', time: '22:00', title: 'Düğün Pastası Kesimi', description: 'Pasta merasimi' },
    { id: '5', time: '23:00', title: 'After Party & Canlı DJ', description: 'Kapanış partisi' },
  ]);

  // Load existing event if available, or generate default
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const ev = await eventService.getEvent(currentSlug, user?.displayName);
        if (ev) {
          setSlug(ev.slug);
          setBrideName(ev.hosts.brideOrPrimary || 'Merve');
          setGroomName(ev.hosts.groomOrSecondary || 'Yavuz');
          setTitle(ev.title);
          setSubtitle(ev.subtitle || '');
          setEventDate(ev.eventDate);
          setCoverPhotoUrl(ev.coverPhotoUrl);
          setPrimaryColor(ev.theme.primaryColor || '#C5A059');
          setVenueName(ev.venue.name);
          setVenueAddress(ev.venue.address);
          setMapUrl(ev.venue.mapUrl);
          setIsPrivate(ev.settings.isPrivate);
          setPinCode(ev.settings.pinCode || '1923');
          setEnableCompression(ev.settings.enableCompression);
          setAllowGuestDownloads(ev.settings.allowGuestDownloads);
          setIsLiveFeedActive(ev.settings.isLiveFeedActive);
          if (ev.schedule && ev.schedule.length > 0) {
            setSchedule(ev.schedule);
          }
        }
      } catch (err) {
        console.warn('Load event form err:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [currentSlug]);

  // When bride or groom names change, automatically update suggested title and slug
  const handleNameChange = (newBride: string, newGroom: string) => {
    setBrideName(newBride);
    setGroomName(newGroom);

    if (newBride && newGroom) {
      setTitle(`${newBride.trim()} & ${newGroom.trim()} Düğünü`);
      const generatedSlug = `${newBride.trim()}-ve-${newGroom.trim()}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen etkinlik başlığı ve linkini girin.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanSlug = slug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const updatedData: Partial<EventModel> = {
        slug: cleanSlug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        hosts: {
          brideOrPrimary: brideName.trim(),
          groomOrSecondary: groomName.trim(),
        },
        eventDate,
        coverPhotoUrl,
        theme: {
          primaryColor,
          backgroundColor: '#FAF7F2',
          secondaryColor: '#EAD7BB',
          textColor: '#1A1817',
        },
        venue: {
          name: venueName.trim(),
          address: venueAddress.trim(),
          mapUrl: mapUrl.trim(),
        },
        schedule,
        settings: {
          isPrivate,
          pinCode,
          enableCompression,
          allowGuestDownloads,
          isLiveFeedActive,
          allowGuestbook: true,
          autoApprovePhotos: true,
        },
      };

      await eventService.saveEvent(cleanSlug, updatedData);
      if (user) {
        await authService.addEventToUser(user.uid, cleanSlug);
      }

      setIsSaving(false);
      Alert.alert('Harika! 🎉', 'Etkinliğiniz başarıyla oluşturuldu ve Firebase ile senkronize edildi!', [
        {
          text: 'Panele Dön',
          onPress: () => router.push('/panel' as any),
        },
        {
          text: 'Sayfayı Gör',
          onPress: () => router.push(`/${cleanSlug}` as any),
        },
      ]);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      Alert.alert('Hata', 'Etkinlik kaydedilirken bir sorun oluştu.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>Etkinlik bilgileri yükleniyor...</Text>
      </View>
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
            <Text style={styles.navTitle}>Etkinlik Bilgileri & Kurulum</Text>
            <Text style={styles.navSub}>qr-la.com/{slug}</Text>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={16} color="#FFF" />
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Live Link Callout Banner */}
        <View style={styles.slugBanner}>
          <Ionicons name="link-outline" size={20} color="#C5A059" />
          <View style={{ flex: 1 }}>
            <Text style={styles.slugBannerLabel}>ÖZEL ETKİNLİK LİNKİNİZ</Text>
            <Text style={styles.slugBannerUrl}>qr-la.com/{slug}</Text>
          </View>
        </View>

        {/* Section 1: Couple Names & Title */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>1. Çift İsimleri & Başlık</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Gelin / Ev Sahibi</Text>
              <TextInput
                style={styles.input}
                value={brideName}
                onChangeText={(val) => handleNameChange(val, groomName)}
                placeholder="Örn: Merve"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Damat / 2. İsim</Text>
              <TextInput
                style={styles.input}
                value={groomName}
                onChangeText={(val) => handleNameChange(brideName, val)}
                placeholder="Örn: Yavuz"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Etkinlik Başlığı</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Örn: Merve & Yavuz Düğünü"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Karşılama Alt Yazısı (Misafirlere Mesajınız)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={subtitle}
              onChangeText={setSubtitle}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Section 2: Cover Photo & Theme */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>2. Kapak Fotoğrafı & Tema Rengi</Text>

          <Text style={styles.label}>Hazır Kapak Fotoğraflarından Seçin:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {COVER_PRESETS.map((preset) => {
              const isSelected = coverPhotoUrl === preset.url;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, isSelected && styles.presetCardActive]}
                  onPress={() => setCoverPhotoUrl(preset.url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: preset.url }} style={styles.presetImage} />
                  <View style={[styles.presetTag, isSelected && styles.presetTagActive]}>
                    <Text style={[styles.presetTagText, isSelected && styles.presetTagTextActive]}>
                      {preset.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <Text style={styles.label}>Veya Kendi Görsel Linkinizi Girin:</Text>
            <TextInput
              style={styles.input}
              value={coverPhotoUrl}
              onChangeText={setCoverPhotoUrl}
              placeholder="https://..."
            />
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Tema Rengi:</Text>
          <View style={styles.themeRow}>
            {THEME_PRESETS.map((theme) => {
              const isSelected = primaryColor === theme.color;
              return (
                <TouchableOpacity
                  key={theme.color}
                  style={[
                    styles.themeChip,
                    isSelected && { borderColor: theme.color, borderWidth: 2 },
                  ]}
                  onPress={() => setPrimaryColor(theme.color)}
                >
                  <View style={[styles.colorCircle, { backgroundColor: theme.color }]} />
                  <Text style={styles.themeChipText}>{theme.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Venue Details */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>3. Düğün / Etkinlik Mekanı</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mekan Adı</Text>
            <TextInput
              style={styles.input}
              value={venueName}
              onChangeText={setVenueName}
              placeholder="Örn: Sait Halim Paşa Yalısı"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mekan Adresi</Text>
            <TextInput
              style={styles.input}
              value={venueAddress}
              onChangeText={setVenueAddress}
              placeholder="Adres, İlçe / Şehir"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google Haritalar Linki (Yol Tarifi İçin)</Text>
            <TextInput
              style={styles.input}
              value={mapUrl}
              onChangeText={setMapUrl}
              placeholder="https://maps.google.com/..."
            />
          </View>
        </View>

        {/* Section 4: Privacy & Settings */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>4. Gizlilik & Kurallar</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>PIN Kodu ile Koru</Text>
              <Text style={styles.switchSub}>
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
            <View style={styles.pinBox}>
              <Text style={styles.label}>4 Haneli Giriş PIN Kodu:</Text>
              <TextInput
                style={styles.pinInput}
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          )}

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Akıllı Hızlı Sıkıştırma Aktif</Text>
              <Text style={styles.switchSub}>
                Misafir fotoğrafları otomatik optimize edilerek anında yüklenir.
              </Text>
            </View>
            <Switch
              value={enableCompression}
              onValueChange={setEnableCompression}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchLabel}>Misafirler Fotoğraf İndirebilsin</Text>
              <Text style={styles.switchSub}>
                Misafirler galerideki fotoğrafları telefonlarına indirebilir.
              </Text>
            </View>
            <Switch
              value={allowGuestDownloads}
              onValueChange={setAllowGuestDownloads}
              trackColor={{ false: '#D1D5DB', true: '#C5A059' }}
            />
          </View>
        </View>

        {/* Save CTA Button */}
        <TouchableOpacity
          style={[styles.bigSaveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.bigSaveBtnText}>Etkinliği Kaydet & Hemen Aç</Text>
            </>
          )}
        </TouchableOpacity>
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  slugBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  slugBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  slugBannerUrl: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1817',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  presetsScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  presetCard: {
    width: 140,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardActive: {
    borderColor: '#C5A059',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  presetTagActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.95)',
  },
  presetTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  presetTagTextActive: {
    fontWeight: '800',
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  pinBox: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinInput: {
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
  bigSaveBtn: {
    backgroundColor: '#C5A059',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#C5A059',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 4,
    marginTop: 8,
  },
  bigSaveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
