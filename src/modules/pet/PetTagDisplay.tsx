import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PetData, PetVaccine } from '@/types';
import { petService } from '@/services/petService';

interface PetTagDisplayProps {
  pet: PetData;
  initialMode?: 'normal' | 'lost';
}

export function PetTagDisplay({ pet: initialPet, initialMode }: PetTagDisplayProps) {
  const [pet] = useState<PetData>(initialPet);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [locationSentSuccess, setLocationSentSuccess] = useState(false);
  const [copiedChip, setCopiedChip] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'contact'>('profile');

  // Override lost mode if URL specified it
  const isLost = initialMode === 'lost' || pet.lostInfo?.isLost;

  useEffect(() => {
    // Record basic scan on mount
    petService.recordScan(pet.slug);
  }, [pet.slug]);

  const handleCallOwner = () => {
    const phone = isLost && pet.lostInfo?.emergencyPhone ? pet.lostInfo.emergencyPhone : pet.ownerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
    }
  };

  const handleWhatsappOwner = (customMessage?: string) => {
    const rawNumber = pet.ownerWhatsapp || pet.ownerPhone;
    const phone = rawNumber.replace(/\D/g, '');
    const defaultMsg = isLost
      ? `Merhaba, sokakta/parkta ${pet.name} isimli dostunuzu buldum! Sizinle iletişime geçmek istiyorum.`
      : `Merhaba, ${pet.name} isimli dostunuzun künyesini taradım.`;
    const text = encodeURIComponent(customMessage || defaultMsg);
    const url = `https://wa.me/${phone}?text=${text}`;

    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleSendLocation = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsSendingLocation(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;
          const mapLink = `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
          
          // Log scan to backend
          petService.recordScan(pet.slug, {
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            address: `GPS Koordinatları (±${Math.round(accuracy)}m)`,
          });

          setIsSendingLocation(false);
          setLocationSentSuccess(true);

          // Open WhatsApp with direct location message
          const msg = `🚨 MERHABA! ${pet.name} isimli dostunuzun künyesini taradım. Şu anki konumum:\n${mapLink}\n(Konum hassasiyeti: ±${Math.round(accuracy)} metre). Lütfen bana buradan yazın veya arayın!`;
          handleWhatsappOwner(msg);
        },
        error => {
          setIsSendingLocation(false);
          alert('Konum izni alınamadı. Yine de doğrudan WhatsApp veya arama ile sahibe ulaşabilirsiniz.');
          console.warn('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Fallback
      handleWhatsappOwner(`Merhaba, ${pet.name} isimli dostunuzun künyesini taradım. Nerede olduğumu bildirmek istiyorum.`);
    }
  };

  const handleCallVet = () => {
    if (pet.vetPhone) {
      Linking.openURL(`tel:${pet.vetPhone.replace(/\s+/g, '')}`);
    }
  };

  const copyChipNumber = () => {
    if (pet.microchipNumber) {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(pet.microchipNumber);
      }
      setCopiedChip(true);
      setTimeout(() => setCopiedChip(false), 2500);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : `https://qr-la.com/p/${pet.slug}`;
      await Share.share({
        title: `${pet.name} | Petguru Akıllı Künye`,
        message: isLost
          ? `🚨 ACİL KAYIP ALARMI: ${pet.name} aranıyor! Görenlerin iletişime geçmesi rica olunur: ${shareUrl}`
          : `${pet.name} isimli dostumuzun akıllı künyesi: ${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Top Navbar */}
        <View style={styles.topBar}>
          <View style={styles.logoBadge}>
            <Ionicons name="paw" size={16} color="#10B981" />
            <Text style={styles.logoText}>Petguru <Text style={{ color: '#10B981' }}>x QR-la</Text></Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 🚨 CRITICAL LOST BANNER (IF MARKED LOST) */}
        {isLost && (
          <View style={styles.lostBannerContainer}>
            <View style={styles.lostHeaderRow}>
              <View style={styles.lostBadgePill}>
                <Ionicons name="alert-circle" size={18} color="#FFF" />
                <Text style={styles.lostBadgeText}>ACİL KAYIP ALARMI</Text>
              </View>
              {pet.lostInfo?.rewardAmount ? (
                <View style={styles.rewardPill}>
                  <Ionicons name="gift-outline" size={14} color="#FEF08A" />
                  <Text style={styles.rewardText}>{pet.lostInfo.rewardAmount}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.lostMainTitle}>
              DİKKAT! BU DOSTUMUZ KAYIPTIR
            </Text>
            <Text style={styles.lostSubDesc}>
              Ailesi endişeyle yolunu gözlüyor. Eğer yanınızdaysa veya gördüyseniz lütfen hemen aşağıdaki butonlardan iletişime geçin.
            </Text>

            {pet.lostInfo?.lostLocation && (
              <View style={styles.lostMetaRow}>
                <Ionicons name="location" size={16} color="#F87171" />
                <Text style={styles.lostMetaText}>
                  Son Görülen Yer: <Text style={{ fontWeight: '700', color: '#FFF' }}>{pet.lostInfo.lostLocation}</Text>
                </Text>
              </View>
            )}

            {pet.lostInfo?.lostDate && (
              <View style={styles.lostMetaRow}>
                <Ionicons name="time-outline" size={16} color="#FCA5A5" />
                <Text style={styles.lostMetaText}>
                  Kayıp Zamanı: <Text style={{ fontWeight: '600', color: '#FFF' }}>{pet.lostInfo.lostDate}</Text>
                </Text>
              </View>
            )}

            {pet.lostInfo?.notes && (
              <View style={styles.lostNoteBox}>
                <Text style={styles.lostNoteTitle}>Sahip Özel Notu:</Text>
                <Text style={styles.lostNoteBody}>{pet.lostInfo.notes}</Text>
              </View>
            )}

            {/* Quick Emergency Action Buttons in Lost Banner */}
            <View style={styles.lostActionsRow}>
              <TouchableOpacity
                style={styles.lostCallBtn}
                onPress={handleCallOwner}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={20} color="#FFF" />
                <Text style={styles.lostCallBtnText}>Sahibi Hemen Ara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lostGpsBtn}
                onPress={handleSendLocation}
                disabled={isSendingLocation}
                activeOpacity={0.85}
              >
                {isSendingLocation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="navigate" size={18} color="#FFF" />
                    <Text style={styles.lostGpsBtnText}>📍 Konum Bildir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {locationSentSuccess && (
              <View style={styles.locationSentToast}>
                <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                <Text style={styles.locationSentText}>
                  GPS koordinatlarınız sahibin WhatsApp hattına hazırlandı!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* UNCLAIMED TAG NOTICE (IF NOT CLAIMED YET) */}
        {!pet.isClaimed && (
          <View style={styles.unclaimedBox}>
            <Ionicons name="shield-outline" size={28} color="#F59E0B" />
            <Text style={styles.unclaimedTitle}>Eşleştirilmemiş Akıllı Künye</Text>
            <Text style={styles.unclaimedText}>
              Bu lazer baskılı metal künye henüz bir evcil hayvana bağlanmamış. Künyeyi satın aldıysanız kendi evcil hayvanınızla eşleştirmek için yönetim paneline geçebilirsiniz.
            </Text>
          </View>
        )}

        {/* HERO PET PROFILE CARD */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: pet.photoUrl }} style={styles.avatarImage} resizeMode="cover" />
            <View
              style={[
                styles.statusDotRing,
                { backgroundColor: isLost ? '#EF4444' : '#10B981' },
              ]}
            >
              <Ionicons name={isLost ? 'alert' : 'checkmark'} size={14} color="#FFF" />
            </View>
          </View>

          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🦜'} {pet.breed}
          </Text>

          {/* Quick Attribute Pills */}
          <View style={styles.pillsRow}>
            <View style={styles.pillItem}>
              <Ionicons
                name={pet.gender === 'male' ? 'male' : 'female'}
                size={13}
                color="#6EE7B7"
              />
              <Text style={styles.pillText}>{pet.gender === 'male' ? 'Erkek' : 'Dişi'}</Text>
            </View>

            <View style={styles.pillItem}>
              <Ionicons name="calendar-outline" size={13} color="#6EE7B7" />
              <Text style={styles.pillText}>{pet.age}</Text>
            </View>

            {pet.color ? (
              <View style={styles.pillItem}>
                <Ionicons name="color-palette-outline" size={13} color="#6EE7B7" />
                <Text style={styles.pillText}>{pet.color}</Text>
              </View>
            ) : null}
          </View>

          {/* Microchip Badge */}
          {pet.microchipNumber ? (
            <TouchableOpacity
              style={styles.chipRow}
              onPress={copyChipNumber}
              activeOpacity={0.7}
            >
              <Ionicons name="hardware-chip-outline" size={14} color="#34D399" />
              <Text style={styles.chipText}>
                Çip No: <Text style={styles.chipBold}>{pet.microchipNumber}</Text>
              </Text>
              <Ionicons
                name={copiedChip ? 'checkmark-circle' : 'copy-outline'}
                size={14}
                color={copiedChip ? '#34D399' : '#9CA3AF'}
              />
            </TouchableOpacity>
          ) : null}

          {/* Verified Collar Seal */}
          <View style={styles.verifiedSeal}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.verifiedSealText}>
              Petguru Doğrulanmış Akıllı Künye • ID: {pet.uniqueTagCode || pet.slug.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* PRIMARY OWNER CONTACT BUTTONS (IF NOT IN LOST MODE) */}
        {!isLost && (
          <View style={styles.contactButtonsRow}>
            <TouchableOpacity
              style={styles.mainCallBtn}
              onPress={handleCallOwner}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={20} color="#FFF" />
              <Text style={styles.mainCallBtnText}>Sahibi Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainWhatsappBtn}
              onPress={() => handleWhatsappOwner()}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.mainWhatsappBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ONE-TAP GPS LOCATION PROMPT (WHEN FINDER WANTS TO NOTIFY OWNER) */}
        <View style={styles.gpsBanner}>
          <View style={styles.gpsIconCircle}>
            <Ionicons name="navigate-outline" size={22} color="#10B981" />
          </View>
          <View style={styles.gpsTextCol}>
            <Text style={styles.gpsTitle}>Dostumuz Yanınızda mı?</Text>
            <Text style={styles.gpsDesc}>
              Konumunuzu sahibe göndererek ailesine güvenle kavuşmasını sağlayın.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.gpsTriggerBtn}
            onPress={handleSendLocation}
            disabled={isSendingLocation}
            activeOpacity={0.85}
          >
            {isSendingLocation ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.gpsTriggerBtnText}>📍 Konum Bildir</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* TABS SELECTOR */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons
              name="paw-outline"
              size={16}
              color={activeTab === 'profile' ? '#10B981' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
              Karakter & Notlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'health' && styles.tabButtonActive]}
            onPress={() => setActiveTab('health')}
          >
            <Ionicons
              name="medkit-outline"
              size={16}
              color={activeTab === 'health' ? '#10B981' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}>
              Aşı & Sağlık
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'contact' && styles.tabButtonActive]}
            onPress={() => setActiveTab('contact')}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={activeTab === 'contact' ? '#10B981' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
              İletişim & Klinik
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: PROFILE & PERSONALITY */}
        {activeTab === 'profile' && (
          <View style={styles.tabContentCard}>
            {/* Personality Tags */}
            {pet.personality && pet.personality.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>🐾 Karakter & Davranış</Text>
                <View style={styles.tagsFlex}>
                  {pet.personality.map((trait, idx) => (
                    <View key={idx} style={styles.traitBadge}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Special Care Notes */}
            {pet.specialNotes ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>📝 Yaklaşım & Özel Bakım Notu</Text>
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteText}>{pet.specialNotes}</Text>
                </View>
              </View>
            ) : null}

            {/* Allergies / Precautions */}
            {pet.allergies && pet.allergies.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>⚠️ Hassasiyetler & Alerjiler</Text>
                <View style={styles.allergiesList}>
                  {pet.allergies.map((allergy, idx) => (
                    <View key={idx} style={styles.allergyItem}>
                      <Ionicons name="warning" size={16} color="#F59E0B" />
                      <Text style={styles.allergyText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: HEALTH & VACCINES */}
        {activeTab === 'health' && (
          <View style={styles.tabContentCard}>
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>💉 Dijital Aşı Karnesi</Text>
                <View style={styles.upToDatePill}>
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text style={styles.upToDateText}>Petguru Kayıtlı</Text>
                </View>
              </View>

              {pet.vaccines && pet.vaccines.length > 0 ? (
                <View style={styles.vaccineTable}>
                  {pet.vaccines.map((vax: PetVaccine) => (
                    <View key={vax.id} style={styles.vaccineRow}>
                      <View style={styles.vaxLeft}>
                        <Ionicons
                          name={vax.isUpToDate ? 'checkmark-circle' : 'time'}
                          size={18}
                          color={vax.isUpToDate ? '#10B981' : '#F59E0B'}
                        />
                        <View style={{ marginLeft: 8 }}>
                          <Text style={styles.vaxName}>{vax.name}</Text>
                          <Text style={styles.vaxDate}>Yapılış: {vax.date}</Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.vaxStatusBadge,
                          { backgroundColor: vax.isUpToDate ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.vaxStatusText,
                            { color: vax.isUpToDate ? '#34D399' : '#FBBF24' },
                          ]}
                        >
                          {vax.isUpToDate ? 'Güncel' : 'Yaklaşıyor'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>Henüz aşı karnesi bilgisi girilmemiş.</Text>
              )}
            </View>

            {/* Registered Vet Clinic */}
            {pet.vetClinicName ? (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>🏥 Kayıtlı Veteriner Kliniği</Text>
                <View style={styles.vetCard}>
                  <View style={styles.vetIconCircle}>
                    <Ionicons name="medical" size={24} color="#10B981" />
                  </View>
                  <View style={styles.vetInfoCol}>
                    <Text style={styles.vetName}>{pet.vetClinicName}</Text>
                    {pet.vetAddress ? <Text style={styles.vetAddress}>{pet.vetAddress}</Text> : null}
                    {pet.vetPhone ? (
                      <TouchableOpacity
                        style={styles.vetCallBtn}
                        onPress={handleCallVet}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call-outline" size={14} color="#10B981" />
                        <Text style={styles.vetCallText}>Kliniği Ara ({pet.vetPhone})</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* TAB 3: CONTACT & OWNER INFO */}
        {activeTab === 'contact' && (
          <View style={styles.tabContentCard}>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>👤 Sahip Bilgileri</Text>
              <View style={styles.ownerCard}>
                <View style={styles.ownerRow}>
                  <View style={styles.ownerAvatar}>
                    <Ionicons name="person" size={20} color="#10B981" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.ownerNameText}>{pet.ownerName}</Text>
                    {pet.ownerAddress ? (
                      <Text style={styles.ownerAddressText}>📍 {pet.ownerAddress}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.ownerActionButtons}>
                  <TouchableOpacity
                    style={styles.ownerCallBtn}
                    onPress={handleCallOwner}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color="#FFF" />
                    <Text style={styles.ownerCallBtnText}>Telefon: {pet.ownerPhone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.ownerWhatsappBtn}
                    onPress={() => handleWhatsappOwner()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                    <Text style={styles.ownerWhatsappBtnText}>WhatsApp İletişim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Scan Counter */}
            <View style={styles.statBox}>
              <Ionicons name="qr-code-outline" size={20} color="#6EE7B7" />
              <Text style={styles.statText}>
                Bu akıllı künye bugüne kadar <Text style={{ fontWeight: '700', color: '#FFF' }}>{pet.viewCount || 1}</Text> kez tarandı.
              </Text>
            </View>
          </View>
        )}

        {/* FOOTER CALLOUT: PETGURU COLLAR INFO */}
        <View style={styles.footerInfoBox}>
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          <Text style={styles.footerInfoText}>
            Lazer kazımalı paslanmaz çelik tasma künyeleri ve çip entegrasyonu <Text style={{ fontWeight: '700', color: '#34D399' }}>Petguru x QR-la</Text> güvencesindedir.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#03120B',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
    maxWidth: 620,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  logoText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  // 🚨 Lost Banner
  lostBannerContainer: {
    backgroundColor: 'rgba(153, 27, 27, 0.35)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.25)',
  },
  lostHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lostBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  lostBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.25)',
    borderWidth: 1,
    borderColor: '#FACC15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  lostMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  lostSubDesc: {
    fontSize: 13,
    color: '#FECACA',
    lineHeight: 18,
    marginBottom: 12,
  },
  lostMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lostMetaText: {
    fontSize: 13,
    color: '#FCA5A5',
    marginLeft: 6,
  },
  lostNoteBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  lostNoteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCA5A5',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lostNoteBody: {
    fontSize: 13,
    color: '#FFF',
    lineHeight: 18,
  },
  lostActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  lostCallBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  lostCallBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  lostGpsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  lostGpsBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  locationSentToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: '#34D399',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  locationSentText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  // Unclaimed
  unclaimedBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  unclaimedTitle: {
    color: '#FBBF24',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
  },
  unclaimedText: {
    color: '#FDE68A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  // Hero Card
  heroCard: {
    backgroundColor: 'rgba(6, 40, 26, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    backdropFilter: 'blur(16px)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  statusDotRing: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#03120B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6EE7B7',
    marginBottom: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 5,
  },
  pillText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
    marginBottom: 12,
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  chipBold: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  verifiedSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  verifiedSealText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '600',
  },
  // Contact Buttons (Normal Mode)
  contactButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mainCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)',
  },
  mainCallBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  mainWhatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)',
  },
  mainWhatsappBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  // GPS Banner
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 40, 26, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  gpsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  gpsDesc: {
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 15,
  },
  gpsTriggerBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  gpsTriggerBtnText: {
    color: '#03120B',
    fontSize: 12,
    fontWeight: '800',
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  // Tab Content Card
  tabContentCard: {
    backgroundColor: 'rgba(6, 40, 26, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    padding: 18,
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E5E7EB',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  tagsFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  traitText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
  quoteCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  quoteText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  allergiesList: {
    gap: 8,
  },
  allergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  allergyText: {
    color: '#FDE68A',
    fontSize: 12,
    fontWeight: '600',
  },
  // Health
  upToDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  upToDateText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  vaccineTable: {
    gap: 8,
  },
  vaccineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 12,
  },
  vaxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaxName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  vaxDate: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  vaxStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vaxStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontStyle: 'italic',
  },
  vetCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  vetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetInfoCol: {
    flex: 1,
  },
  vetName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  vetAddress: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  vetCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vetCallText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  // Contact tab
  ownerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerNameText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ownerAddressText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  ownerActionButtons: {
    gap: 8,
  },
  ownerCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ownerCallBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  ownerWhatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ownerWhatsappBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  statText: {
    color: '#A7F3D0',
    fontSize: 12,
    flex: 1,
  },
  // Footer
  footerInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  footerInfoText: {
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
