import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { VehicleData } from '@/types';
import { getTheme } from './themes';
import { vehicleService } from '@/services/vehicleService';

interface TagDisplayProps {
  vehicle: VehicleData;
}

export function TagDisplay({ vehicle }: TagDisplayProps) {
  const router = useRouter();
  const theme = getTheme(vehicle.theme || vehicle.brand);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (!hasScanned) {
      setHasScanned(true);
      vehicleService.incrementVehicleScans(vehicle.slug).catch(() => {});
    }
  }, [hasScanned, vehicle.slug]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = `${vehicle.plateNumber} | Araç Park & İletişim Kartı - QR-la`;
    }
  }, [vehicle.plateNumber]);

  const cleanPhoneForWa = (phone: string): string => {
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '90' + p.slice(1);
    else if (!p.startsWith('90') && p.length === 10) p = '90' + p;
    return p;
  };

  const handleSendWhatsApp = (customText?: string) => {
    const textToSend =
      customText ||
      selectedMessage ||
      `Merhaba, ${vehicle.plateNumber} plakalı aracınızın başındayım.`;
    const fullMessage = `${textToSend}\n\n(Bu mesaj QR-la Araç İletişim Kodu üzerinden gönderilmiştir.)`;
    const waUrl = `https://wa.me/${cleanPhoneForWa(vehicle.ownerPhone)}?text=${encodeURIComponent(
      fullMessage
    )}`;
    Linking.openURL(waUrl).catch(() => {
      if (Platform.OS === 'web') {
        window.open(waUrl, '_blank');
      } else {
        Alert.alert('Hata', 'WhatsApp uygulaması açılamadı.');
      }
    });
  };

  const handleDirectCall = () => {
    if (vehicle.privacyMode) {
      Alert.alert(
        'Numara Gizliliği 🔒',
        'Araç sahibi telefon numarasını doğrudan aramaya kapatmıştır. Lütfen aşağıdaki WhatsApp butonunu kullanarak mesaj gönderin.'
      );
      return;
    }
    const clean = vehicle.ownerPhone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleEmergencyCall = () => {
    if (!vehicle.emergencyContact?.phone) return;
    const clean = vehicle.emergencyContact.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleOpenInstagram = () => {
    if (!vehicle.instagram) return;
    const handle = vehicle.instagram.replace(/^@/, '');
    Linking.openURL(`https://instagram.com/${handle}`);
  };

  const isMotorcycle = vehicle.vehicleType === 'motorcycle';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bgGradient[0] }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header / Branding Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.logoPill}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>QR-la</Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>TAG</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.liveBeacon}>
            <View style={styles.beaconDot} />
            <Text style={styles.beaconText}>Aktif Araç Kartı</Text>
          </View>
        </View>

        {/* Turkish License Plate Component */}
        <View style={styles.plateContainer}>
          <View style={[styles.plateCard, { borderColor: theme.plateBorder }]}>
            {/* TR Blue Band */}
            <View style={styles.plateBlueBand}>
              <Text style={styles.plateCountryStars}>★★</Text>
              <Text style={styles.plateCountryCode}>TR</Text>
            </View>

            {/* Embossed Plate Text */}
            <View style={styles.plateTextBox}>
              <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
            </View>

            {/* Hologram / Right Seal */}
            <View style={styles.plateSealBox}>
              <View style={styles.plateScrew} />
            </View>
          </View>
        </View>

        {/* Brand & Model Showcase */}
        <View
          style={[
            styles.vehicleCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              shadowColor: theme.glowColor,
            },
          ]}
        >
          <View style={styles.vehicleHeaderRow}>
            <View style={styles.brandBadgeWrap}>
              <View style={[styles.brandIconCircle, { backgroundColor: theme.badgeBg }]}>
                <Ionicons
                  name={isMotorcycle ? 'speedometer' : 'car-sport'}
                  size={20}
                  color={theme.accentColor}
                />
              </View>
              <View>
                <Text style={styles.brandTitle}>
                  {vehicle.brand.toUpperCase()} {vehicle.model}
                </Text>
                <Text style={styles.vehicleCategoryText}>
                  {isMotorcycle ? 'Motosiklet' : 'Otomobil'} • Sürücü:{' '}
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>{vehicle.ownerName}</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Driver Note Box */}
          {vehicle.note ? (
            <View style={styles.noteBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.accentColor} />
              <Text style={styles.noteText}>{vehicle.note}</Text>
            </View>
          ) : null}
        </View>

        {/* Life-Saving Emergency Card (Kaza / İlk Yardım Kartı) */}
        {(vehicle.bloodType && vehicle.bloodType !== 'Bilinmiyor') ||
        vehicle.emergencyContact ? (
          <View
            style={[
              styles.emergencyCard,
              {
                backgroundColor: theme.emergencyBg,
                borderColor: theme.emergencyBorder,
              },
            ]}
          >
            <View style={styles.emergencyHeaderRow}>
              <View style={styles.emergencyTitleRow}>
                <View style={styles.emergencyIconPulse}>
                  <Ionicons name="medkit" size={16} color="#EF4444" />
                </View>
                <Text style={styles.emergencyTitle}>Hayati Acil Durum & İlk Yardım</Text>
              </View>

              {vehicle.bloodType && vehicle.bloodType !== 'Bilinmiyor' && (
                <View style={styles.bloodBadge}>
                  <Ionicons name="water" size={12} color="#FFF" />
                  <Text style={styles.bloodText}>{vehicle.bloodType}</Text>
                </View>
              )}
            </View>

            {vehicle.emergencyContact && (
              <View style={styles.emergencyContactRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.emergencyContactLabel}>
                    Acil Durum Kişisi {vehicle.emergencyContact.relationship ? `(${vehicle.emergencyContact.relationship})` : ''}:
                  </Text>
                  <Text style={styles.emergencyContactName}>
                    {vehicle.emergencyContact.name}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.emergencyCallBtn}
                  onPress={handleEmergencyCall}
                  activeOpacity={0.85}
                >
                  <Ionicons name="call" size={16} color="#FFF" />
                  <Text style={styles.emergencyCallBtnText}>Acil Ara</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}

        {/* Quick Message Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hızlı Bildirim Gönder</Text>
          <Text style={styles.sectionSubtitle}>
            Aşağıdaki durumlardan birini seçerek araç sahibine tek tıkla WhatsApp bildirimi atabilirsiniz:
          </Text>

          <View style={styles.presetGrid}>
            {(vehicle.presetMessages && vehicle.presetMessages.length > 0
              ? vehicle.presetMessages
              : [
                  'Merhaba, aracınız çıkışımı engelliyor. Rica etsem alabilir misiniz?',
                  'Merhaba, aracınızın farları açık kalmış!',
                  'Merhaba, aracınızın alarmı çalıyor.',
                  'Merhaba, aracınızın camı açık kalmış.',
                ]
            ).map((msg, idx) => {
              const isSelected = selectedMessage === msg;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetBtn,
                    isSelected && {
                      borderColor: theme.accentColor,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    },
                  ]}
                  onPress={() => {
                    setSelectedMessage(msg);
                    handleSendWhatsApp(msg);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      idx === 0
                        ? 'car-outline'
                        : idx === 1
                        ? 'bulb-outline'
                        : idx === 2
                        ? 'notifications-outline'
                        : 'alert-circle-outline'
                    }
                    size={16}
                    color={theme.accentColor}
                  />
                  <Text style={styles.presetBtnText}>{msg}</Text>
                  <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary Main WhatsApp Action */}
          <TouchableOpacity
            style={styles.mainWaBtn}
            onPress={() => handleSendWhatsApp()}
            activeOpacity={0.88}
          >
            <View style={styles.waIconBox}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mainWaBtnTitle}>WhatsApp ile İletişime Geç</Text>
              <Text style={styles.mainWaBtnSub}>
                {vehicle.privacyMode
                  ? '🔒 Numara Gizli • Doğrudan mesaj şablonu'
                  : 'Anında mesaj gönderin'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Secondary Direct Call or Instagram */}
          <View style={styles.secondaryRow}>
            {!vehicle.privacyMode ? (
              <TouchableOpacity
                style={styles.secondaryCallBtn}
                onPress={handleDirectCall}
                activeOpacity={0.8}
              >
                <Ionicons name="call-outline" size={18} color="#FFF" />
                <Text style={styles.secondaryCallText}>Doğrudan Ara</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.privacyBadgeText}>Gizli Numara Koruması Aktif</Text>
              </View>
            )}

            {vehicle.instagram ? (
              <TouchableOpacity
                style={styles.igBtn}
                onPress={handleOpenInstagram}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-instagram" size={18} color="#E1306C" />
                <Text style={styles.igBtnText}>@{vehicle.instagram}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Viral Footer CTA */}
        <View style={styles.footerBox}>
          <View style={styles.footerShieldRow}>
            <Ionicons name="shield-checkmark-outline" size={22} color={theme.accentColor} />
            <Text style={styles.footerShieldText}>
              Bu araç <Text style={{ color: '#FFF', fontWeight: '800' }}>QR-la</Text> akıllı cam etiketi ile korunmaktadır.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createOwnBtn, { borderColor: theme.cardBorder }]}
            onPress={() => router.push('/panel/arac' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.accentColor} />
            <Text style={[styles.createOwnBtnText, { color: theme.badgeText }]}>
              Siz de Aracınız İçin Ücretsiz QR Oluşturun
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5A059',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tagBadge: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 9,
  },
  liveBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  beaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  beaconText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  plateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  plateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3.5,
    width: '100%',
    maxWidth: 380,
    height: 84,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  plateBlueBand: {
    backgroundColor: '#003399',
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  plateCountryStars: {
    color: '#FFCC00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  plateCountryCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  plateTextBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'web' ? 'Arial, Helvetica, sans-serif' : undefined,
  },
  plateSealBox: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateScrew: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9CA3AF',
    borderWidth: 1.5,
    borderColor: '#4B5563',
  },
  vehicleCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  vehicleCategoryText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  emergencyCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyIconPulse: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
  },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  emergencyContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  emergencyContactLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  emergencyContactName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emergencyCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  presetGrid: {
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  presetBtnText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  mainWaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  waIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainWaBtnTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  mainWaBtnSub: {
    color: '#DCFCE7',
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  privacyBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  igBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(225, 48, 108, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(225, 48, 108, 0.3)',
  },
  igBtnText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '700',
  },
  footerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    gap: 12,
  },
  footerShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerShieldText: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
  },
  createOwnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  createOwnBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
