import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'qrcode';
import { authService } from '@/services/authService';
import { vehicleService, cleanPlate, formatPlate } from '@/services/vehicleService';
import { VehicleData, BloodType, VehicleCategory } from '@/types';
import {
  VEHICLE_THEMES,
  BLOOD_TYPE_OPTIONS,
  DEFAULT_PRESET_MESSAGES,
  getTheme,
} from '@/modules/vehicle/themes';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

const BRANDS = [
  { id: 'honda', label: 'Honda', category: 'universal' },
  { id: 'yamaha', label: 'Yamaha', category: 'motorcycle' },
  { id: 'bmw', label: 'BMW', category: 'universal' },
  { id: 'mercedes', label: 'Mercedes-Benz', category: 'car' },
  { id: 'audi', label: 'Audi', category: 'car' },
  { id: 'volkswagen', label: 'Volkswagen', category: 'car' },
  { id: 'ktm', label: 'KTM', category: 'motorcycle' },
  { id: 'kawasaki', label: 'Kawasaki', category: 'motorcycle' },
  { id: 'ducati', label: 'Ducati', category: 'motorcycle' },
  { id: 'husqvarna', label: 'Husqvarna', category: 'motorcycle' },
  { id: 'harley', label: 'Harley-Davidson', category: 'motorcycle' },
  { id: 'porsche', label: 'Porsche', category: 'car' },
  { id: 'volvo', label: 'Volvo', category: 'car' },
  { id: 'togg', label: 'Togg', category: 'car' },
  { id: 'aprilia', label: 'Aprilia', category: 'motorcycle' },
  { id: 'suzuki', label: 'Suzuki', category: 'motorcycle' },
  { id: 'triumph', label: 'Triumph', category: 'motorcycle' },
  { id: 'carbon_stealth', label: 'Karbon Stealth', category: 'universal' },
  { id: 'cyber_purple', label: 'Cyber Violet', category: 'universal' },
  { id: 'polar_minimal', label: 'Polar Minimal', category: 'universal' },
];

export default function VehicleManagementScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);
  const [currentUser, setCurrentUser] = useState(authService.getState().user);
  const [userVehicles, setUserVehicles] = useState<VehicleData[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | 'new'>('new');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleCategory>('motorcycle');
  const [brand, setBrand] = useState('honda');
  const [model, setModel] = useState('');
  const [theme, setTheme] = useState('honda');
  const [bloodType, setBloodType] = useState<BloodType>('A Rh+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [note, setNote] = useState('');

  // QR Sticker Modal State
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Araç & Motosiklet Park Tagı Yönetimi | QR-la';
    }
  }, []);

  const resetForm = () => {
    const u = currentUser;
    setPlateNumber('');
    setOwnerName(u?.displayName || '');
    setOwnerPhone('');
    setOwnerEmail(u?.email || '');
    setInstagram('');
    setVehicleType('motorcycle');
    setBrand('honda');
    setModel('');
    setTheme('honda');
    setBloodType('A Rh+');
    setEmergencyName('');
    setEmergencyPhone('');
    setEmergencyRelation('Eşi');
    setPrivacyMode(true);
    setNote('');
  };

  const applyVehicleToForm = (v: VehicleData) => {
    setSelectedVehicleId(v.id);
    setPlateNumber(v.plateNumber);
    setOwnerName(v.ownerName);
    setOwnerPhone(v.ownerPhone);
    setOwnerEmail(v.ownerEmail || '');
    setInstagram(v.instagram || '');
    setVehicleType(v.vehicleType);
    setBrand(v.brand);
    setModel(v.model);
    setTheme(v.theme || v.brand);
    setBloodType(v.bloodType || 'Bilinmiyor');
    setEmergencyName(v.emergencyContact?.name || '');
    setEmergencyPhone(v.emergencyContact?.phone || '');
    setEmergencyRelation(v.emergencyContact?.relationship || '');
    setPrivacyMode(v.privacyMode);
    setNote(v.note || '');
  };

  const loadVehicles = async () => {
    setIsLoading(true);
    const u = authService.getState().user;
    setCurrentUser(u);
    const userId = u?.uid || 'demo-host-yavuz';
    const list = await vehicleService.getUserVehicles(userId);
    setUserVehicles(list);

    if (list.length > 0) {
      applyVehicleToForm(list[0]);
      setSelectedVehicleId(list[0].id);
    } else {
      resetForm();
      setSelectedVehicleId('new');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSelectVehicle = (id: string) => {
    if (id === 'new') {
      resetForm();
      setSelectedVehicleId('new');
      return;
    }
    const found = userVehicles.find((v) => v.id === id);
    if (found) {
      applyVehicleToForm(found);
    }
  };

  const handleSave = async () => {
    const clean = cleanPlate(plateNumber);
    if (!clean || clean.length < 5) {
      Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir araç plakası girin (örn: 34 ABC 123).');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen sürücü adını girin.');
      return;
    }
    if (!ownerPhone.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen iletişim telefon numarasını girin.');
      return;
    }

    setIsSaving(true);
    try {
      const userId = currentUser?.uid || 'demo-host-yavuz';
      const saved = await vehicleService.saveVehicle({
        id: selectedVehicleId !== 'new' ? selectedVehicleId : undefined,
        userId,
        plateNumber,
        ownerName,
        ownerPhone,
        ownerEmail,
        instagram,
        vehicleType,
        brand,
        model,
        theme,
        bloodType,
        emergencyContact: emergencyName.trim()
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.trim(),
              relationship: emergencyRelation.trim() || undefined,
            }
          : undefined,
        privacyMode,
        presetMessages: DEFAULT_PRESET_MESSAGES,
        note,
      });

      Alert.alert('Başarılı! 🎉', `${saved.plateNumber} araç etiketi başarıyla kaydedildi.`);
      await loadVehicles();
      setSelectedVehicleId(saved.id);
    } catch (err: any) {
      Alert.alert('Kayıt Başarısız', err?.message || 'Araç kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenLive = () => {
    const slug = cleanPlate(plateNumber);
    if (!slug) {
      Alert.alert('Uyarı', 'Önce geçerli bir plaka girmelisiniz.');
      return;
    }
    router.push(`/${slug}` as any);
  };

  const handleShowQrSticker = async () => {
    const slug = cleanPlate(plateNumber);
    if (!slug) {
      Alert.alert('Uyarı', 'Önce geçerli bir plaka girmelisiniz.');
      return;
    }
    const origin =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'https://qr-la.com';
    const tagUrl = `${origin}/${slug}`;

    try {
      const url = await QRCode.toDataURL(tagUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      setQrDataUrl(url);
      setQrModalVisible(true);
    } catch (_e) {
      Alert.alert('Hata', 'QR kod oluşturulamadı.');
    }
  };

  const activeTheme = getTheme(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel')}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Araç & Park Tagı</Text>
            <Text style={styles.navSub}>Ön Cam İletişim & Güvenlik Kartı</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeToggleBtn size="sm" />
            <TouchableOpacity
              style={styles.previewNavBtn}
              onPress={handleOpenLive}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={16} color="#0284C7" />
              <Text style={styles.previewNavBtnText}>Önizle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Switcher Bar */}
        <View style={styles.switcherSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherScroll}>
            {userVehicles.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                  onPress={() => handleSelectVehicle(v.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={v.vehicleType === 'motorcycle' ? 'speedometer-outline' : 'car-outline'}
                    size={14}
                    color={isSelected ? '#FFF' : '#6B7280'}
                  />
                  <Text style={[styles.switcherTabText, isSelected && styles.switcherTabTextActive]}>
                    {v.plateNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.switcherTab, selectedVehicleId === 'new' && styles.switcherTabActive]}
              onPress={() => handleSelectVehicle('new')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add-circle-outline"
                size={14}
                color={selectedVehicleId === 'new' ? '#FFF' : '#0284C7'}
              />
              <Text
                style={[
                  styles.switcherTabText,
                  selectedVehicleId === 'new' && styles.switcherTabTextActive,
                  { color: selectedVehicleId === 'new' ? '#FFF' : '#0284C7' },
                ]}
              >
                + Yeni Araç Ekle
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Live License Plate Preview Banner */}
        <View style={styles.previewBanner}>
          <Text style={styles.previewBannerLabel}>CANLI PLAKA & TEMA GÖRÜNÜMÜ</Text>
          <View style={[styles.plateCard, { borderColor: activeTheme.plateBorder }]}>
            <View style={styles.plateBlueBand}>
              <Text style={styles.plateStars}>★★</Text>
              <Text style={styles.plateCountryCode}>TR</Text>
            </View>
            <View style={styles.plateTextBox}>
              <Text style={styles.plateText}>
                {plateNumber.trim() ? formatPlate(plateNumber) : '34 ABC 123'}
              </Text>
            </View>
          </View>
          <Text style={styles.previewThemeName}>
            Aktif Tema: <Text style={{ color: activeTheme.accentColor, fontWeight: '800' }}>{activeTheme.name}</Text>
          </Text>
        </View>

        {/* Form Section 1: Plate & Vehicle Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="car-sport" size={20} color="#0284C7" />
            <Text style={styles.sectionHeaderTitle}>Araç & Plaka Bilgileri</Text>
          </View>

          {/* Vehicle Category Selector */}
          <Text style={styles.fieldLabel}>Araç Tipi</Text>
          <View style={styles.catRow}>
            {[
              { type: 'motorcycle' as VehicleCategory, label: 'Motosiklet', icon: 'speedometer' },
              { type: 'car' as VehicleCategory, label: 'Otomobil', icon: 'car-sport' },
              { type: 'commercial' as VehicleCategory, label: 'Ticari / Minibüs', icon: 'bus' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.type}
                style={[styles.catBtn, vehicleType === cat.type && styles.catBtnActive]}
                onPress={() => setVehicleType(cat.type)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={vehicleType === cat.type ? '#FFF' : '#6B7280'}
                />
                <Text
                  style={[styles.catBtnText, vehicleType === cat.type && styles.catBtnTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Plate Input */}
          <Text style={styles.fieldLabel}>Araç Plakası *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 34 ABC 123"
            value={plateNumber}
            onChangeText={(txt) => setPlateNumber(txt.toUpperCase())}
            autoCapitalize="characters"
          />

          {/* Brand Selector */}
          <Text style={styles.fieldLabel}>Marka Seçimi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll}>
            {BRANDS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.brandPill, brand === b.id && styles.brandPillActive]}
                onPress={() => {
                  setBrand(b.id);
                  setTheme(b.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.brandPillText, brand === b.id && styles.brandPillTextActive]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Model Input */}
          <Text style={styles.fieldLabel}>Model & Donanım</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: CBR 650R, 320i M Sport, Golf 8"
            value={model}
            onChangeText={setModel}
          />

          {/* Theme Selector */}
          <Text style={styles.fieldLabel}>Renk & Tasarım Teması (20+ Marka Paleti)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
            {Object.values(VEHICLE_THEMES).map((th) => {
              const isSelected = theme === th.id;
              return (
                <TouchableOpacity
                  key={th.id}
                  style={[
                    styles.themeCard,
                    { backgroundColor: th.cardBg, borderColor: th.cardBorder },
                    isSelected && { borderColor: th.accentColor, borderWidth: 2.5 },
                  ]}
                  onPress={() => setTheme(th.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.themeColorDot, { backgroundColor: th.accentColor }]} />
                  <Text style={[styles.themeCardText, isSelected && { color: '#FFF' }]}>
                    {th.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Form Section 2: Driver & Contact Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-circle" size={20} color="#0284C7" />
            <Text style={styles.sectionHeaderTitle}>Sürücü & İletişim Bilgileri</Text>
          </View>

          <Text style={styles.fieldLabel}>Sürücü Adı Soyadı *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Samet Sunman"
            value={ownerName}
            onChangeText={setOwnerName}
          />

          <Text style={styles.fieldLabel}>İletişim Telefonu (WhatsApp İçin) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 0541 577 91 66"
            value={ownerPhone}
            onChangeText={setOwnerPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.fieldLabel}>Instagram Kullanıcı Adı (İsteğe Bağlı)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: sametsunman"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
          />

          {/* Privacy Switch */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.switchTitle}>🔒 Gizli Numara Modu (Tavsiye Edilen)</Text>
              <Text style={styles.switchSubtitle}>
                Telefon numaranız camdaki QR'ı taratan kişilere açıkça gösterilmez. İletişim doğrudan WhatsApp hazır şablonu üzerinden güvenle kurulur.
              </Text>
            </View>
            <Switch
              value={privacyMode}
              onValueChange={setPrivacyMode}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
            />
          </View>

          {/* Driver Note */}
          <Text style={styles.fieldLabel}>Sürücü Özel Park Notu</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Örn: Kısa süreliğine marketteyim. Girişi kapattıysam lütfen WhatsApp'tan yazın hemen geliyorum."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Form Section 3: Life-Saving Emergency Card */}
        <View style={[styles.sectionCard, styles.emergencySectionCard]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="medkit" size={20} color="#EF4444" />
            <Text style={[styles.sectionHeaderTitle, { color: '#EF4444' }]}>
              Hayati Acil Durum & Kaza Kartı
            </Text>
          </View>
          <Text style={styles.sectionDesc}>
            Olası kaza, bayılma veya acil durumlarda ilk yardım ve polis ekiplerinin anında müdahale edebilmesi için hayati bilgileriniz etikette öne çıkarılır.
          </Text>

          {/* Blood Type Grid */}
          <Text style={styles.fieldLabel}>Kan Grubu</Text>
          <View style={styles.bloodGrid}>
            {BLOOD_TYPE_OPTIONS.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[styles.bloodPill, bloodType === bt && styles.bloodPillActive]}
                onPress={() => setBloodType(bt as BloodType)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.bloodPillText, bloodType === bt && styles.bloodPillTextActive]}
                >
                  {bt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Emergency Contact */}
          <Text style={styles.fieldLabel}>Kaza / Acil Durumda Aranacak Kişi</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Şule Sunman"
            value={emergencyName}
            onChangeText={setEmergencyName}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Acil Durum Telefonu</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 0555 123 45 67"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ width: 120 }}>
              <Text style={styles.fieldLabel}>Yakınlık</Text>
              <TextInput
                style={styles.input}
                placeholder="Eşi / Babası"
                value={emergencyRelation}
                onChangeText={setEmergencyRelation}
              />
            </View>
          </View>
        </View>

        {/* Save & Print Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.88}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.printStickerBtn}
            onPress={handleShowQrSticker}
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code-outline" size={18} color="#0284C7" />
            <Text style={styles.printStickerBtnText}>Ön Cam QR Çıktısı Al</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Sticker Modal */}
      {qrModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Ön Cam Akıllı QR Sticker</Text>
                <Text style={styles.modalSubtitle}>{formatPlate(plateNumber)}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setQrModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#1A1817" />
              </TouchableOpacity>
            </View>

            {/* Simulated Physical Window Sticker */}
            <View style={styles.stickerPreviewCard}>
              <View style={styles.stickerTopBar}>
                <Text style={styles.stickerBrandLogo}>QR-la TAG</Text>
                <Text style={styles.stickerPlateBadge}>{formatPlate(plateNumber)}</Text>
              </View>

              {qrDataUrl ? (
                <View style={styles.stickerQrWrap}>
                  <img
                    src={qrDataUrl}
                    alt="Araç QR"
                    style={{ width: 180, height: 180, display: 'block' }}
                  />
                </View>
              ) : null}

              <Text style={styles.stickerHint}>
                Acil durumda veya park halinde kamerayla okutun
              </Text>
              <Text style={styles.stickerSafeBadge}>🔒 Güvenli Numara Maskeleme</Text>
            </View>

            <TouchableOpacity
              style={styles.modalPrintBtn}
              onPress={() => {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                  window.print();
                } else {
                  Alert.alert('Bilgi', 'Tarayıcıdan yazdır seçeneğini kullanabilirsiniz.');
                }
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="print-outline" size={18} color="#FFF" />
              <Text style={styles.modalPrintBtnText}>Sticker'ı Yazdır / PDF İndir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean, colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
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
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    navTitleBox: {
      alignItems: 'center',
    },
    navTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    navSub: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '600',
    },
    previewNavBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewNavBtnText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    switcherSection: {
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    switcherScroll: {
      flexDirection: 'row',
      gap: 8,
    },
    switcherTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.card,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    switcherTabActive: {
      backgroundColor: isDark ? colors.accent : '#1A1817',
      borderColor: isDark ? colors.accent : '#1A1817',
    },
    switcherTabText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    switcherTabTextActive: {
      color: '#FFFFFF',
    },
    previewBanner: {
      backgroundColor: isDark ? '#141622' : '#111827',
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      marginBottom: 16,
    },
    previewBannerLabel: {
      color: '#9CA3AF',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      marginBottom: 12,
    },
    plateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      borderWidth: 3,
      width: '100%',
      maxWidth: 320,
      height: 72,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    plateBlueBand: {
      backgroundColor: '#003399',
      width: 38,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    plateStars: {
      color: '#FFCC00',
      fontSize: 8,
      fontWeight: '900',
    },
    plateCountryCode: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
      marginTop: 2,
    },
    plateTextBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plateText: {
      fontSize: 26,
      fontWeight: '900',
      color: '#111827',
      letterSpacing: 2,
      fontFamily: Platform.OS === 'web' ? 'Arial, Helvetica, sans-serif' : undefined,
    },
    previewThemeName: {
      color: '#9CA3AF',
      fontSize: 12,
      marginTop: 12,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emergencySectionCard: {
      borderColor: isDark ? '#7F1D1D' : '#FECACA',
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FFF5F5',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    sectionHeaderTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    sectionDesc: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    textArea: {
      height: 70,
      textAlignVertical: 'top',
    },
    catRow: {
      flexDirection: 'row',
      gap: 8,
    },
    catBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
    },
    catBtnActive: {
      backgroundColor: isDark ? colors.accent : '#1A1817',
      borderColor: isDark ? colors.accent : '#1A1817',
    },
    catBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    catBtnTextActive: {
      color: '#FFFFFF',
    },
    brandScroll: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    brandPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
    },
    brandPillActive: {
      backgroundColor: '#0284C7',
      borderColor: '#0284C7',
    },
    brandPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    brandPillTextActive: {
      color: '#FFFFFF',
    },
    themeScroll: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    themeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 8,
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
    },
    themeColorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    themeCardText: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
      borderRadius: 14,
      padding: 14,
      marginTop: 14,
      marginBottom: 8,
    },
    switchTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: isDark ? '#34D399' : '#166534',
      marginBottom: 3,
    },
    switchSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
    bloodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    bloodPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: isDark ? '#7F1D1D' : '#FECACA',
    },
    bloodPillActive: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
    },
    bloodPillText: {
      fontSize: 12,
      fontWeight: '800',
      color: isDark ? '#FCA5A5' : '#991B1B',
    },
    bloodPillTextActive: {
      color: '#FFFFFF',
    },
    bottomActions: {
      paddingHorizontal: 16,
      gap: 10,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#10B981',
      paddingVertical: 14,
      borderRadius: 16,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    printStickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.card,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#0284C7',
    },
    printStickerBtnText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '800',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 9999,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    modalSubtitle: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: '700',
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    stickerPreviewCard: {
      backgroundColor: '#111827',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      width: '100%',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: '#0284C7',
    },
    stickerTopBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 14,
    },
    stickerBrandLogo: {
      color: '#0284C7',
      fontWeight: '900',
      fontSize: 14,
      letterSpacing: 1,
    },
    stickerPlateBadge: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 14,
    },
    stickerQrWrap: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 10,
      marginBottom: 12,
    },
    stickerHint: {
      color: '#E2E8F0',
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 6,
    },
    stickerSafeBadge: {
      color: '#34D399',
      fontSize: 10,
      fontWeight: '700',
    },
    modalPrintBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: isDark ? '#0284C7' : '#1A1817',
      paddingVertical: 14,
      borderRadius: 14,
      width: '100%',
    },
    modalPrintBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
