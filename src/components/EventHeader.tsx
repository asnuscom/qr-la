import { authService } from '@/services/authService';
import { EventModel, UserModel } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventHeaderProps {
  event: EventModel;
  activeTab?: 'home' | 'davetiye' | 'yukle' | 'galeri' | 'ani-defteri' | 'canli';
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event, activeTab = 'home' }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  const isHost = Boolean(
    currentUser && (
      currentUser.uid === event.hostId ||
      currentUser.events?.includes(event.slug) ||
      (currentUser.uid === 'demo-host-yavuz' && (event.slug === 'samet-ve-sule' || event.slug === 'demo-panel')) ||
      (currentUser.events && currentUser.events.length > 0)
    )
  );

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(event.eventDate).getTime() - new Date().getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.eventDate]);

  const openMap = () => {
    if (event.venue.mapUrl) {
      if (Platform.OS === 'web') {
        window.open(event.venue.mapUrl, '_blank');
      } else {
        Linking.openURL(event.venue.mapUrl);
      }
    }
  };

  const openInvitation = () => {
    if (event.invitationUrl && event.invitationUrl.trim()) {
      let url = event.invitationUrl.trim();
      const lower = url.toLowerCase();
      const isPdf = lower.includes('.pdf');
      if (isPdf) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        if (Platform.OS === 'web') {
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          Linking.openURL(url);
        }
      } else {
        setIsInvitationModalOpen(true);
      }
    } else {
      Alert.alert(
        'Dijital Davetiye 💌',
        'Bu etkinlik için henüz bir dijital davetiye yüklenmemiş veya bağlantı eklenmemiş.'
      );
    }
  };

  const dateObj = new Date(event.eventDate);
  const isValidDate = !isNaN(dateObj.getTime());
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      })
    : '';

  const formattedTime = isValidDate
    ? dateObj.toLocaleTimeString('tr-TR', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace('.', ':')
    : '';

  return (
    <View style={styles.container}>
      {/* Cover Image with gradient overlay effect */}
      <View style={styles.coverWrapper}>
        <Image source={{ uri: event.coverPhotoUrl }} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.overlay} />

        {/* Floating Tag */}
        <View style={styles.eventTypeBadge}>
          <Text style={styles.eventTypeText}>
            {event.eventType === 'dugun' ? '💍 DÜĞÜN KUTLAMASI' : '✨ ÖZEL ETKİNLİK'}
          </Text>
        </View>

        {/* Top Right Floating Actions */}
        <View style={styles.topRightActions}>
          {isHost && (
            <TouchableOpacity
              style={styles.hostPanelBadge}
              onPress={() => router.push(`/panel?slug=${event.slug}` as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="shield-checkmark" size={13} color="#FFF" />
              <Text style={styles.hostPanelBadgeText}>Yönetim Paneli</Text>
            </TouchableOpacity>
          )}

          {/* Live Projector Quick Link */}
          <TouchableOpacity
            style={styles.liveBadge}
            onPress={() => router.push(`/${event.slug}/canli` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.pulseDot} />
            <Ionicons name="tv-outline" size={14} color="#FFF" style={{ marginRight: 5 }} />
            <Text style={styles.liveBadgeText}>Canlı</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Details Card */}
      <View style={styles.detailsCard}>
        {/* Host Banner */}
        {isHost && (
          <TouchableOpacity
            style={styles.hostBanner}
            onPress={() => router.push(`/panel?slug=${event.slug}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.hostBannerLeft}>
              <View style={styles.hostBannerIcon}>
                <Ionicons name="shield-checkmark" size={16} color="#8A6D3B" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.hostBadgeRow}>
                  <Text style={styles.hostBannerTitle}>Sayfa Sahibi (Yönetici)</Text>
                  <View style={styles.hostLiveDot} />
                  <Text style={styles.hostStatusText}>Oturum Açık</Text>
                </View>
                <Text style={styles.hostBannerSub}>
                  QR kartları indir, fotoğrafları yönet veya ayarları düzenle
                </Text>
              </View>
            </View>
            <View style={styles.hostBannerBtn}>
              <Text style={styles.hostBannerBtnText}>Panele Git</Text>
              <Ionicons name="arrow-forward" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{event.title}</Text>
        {event.subtitle && <Text style={styles.subtitle}>{event.subtitle}</Text>}

        {/* Date and Venue info chips */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#C5A059" />
            <Text style={styles.metaText}>{formattedDate}{formattedTime ? ` • ${formattedTime}` : ''}</Text>
          </View>
          <TouchableOpacity style={styles.metaItem} onPress={openMap} activeOpacity={0.7}>
            <Ionicons name="location-outline" size={16} color="#C5A059" />
            <Text style={[styles.metaText, styles.mapLink]}>{event.venue?.name || 'Düğün Mekanı'}</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown Box */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>BÜYÜK GÜNE KALAN SÜRE</Text>
          <View style={styles.countdownGrid}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeLeft.days}</Text>
              <Text style={styles.timeUnit}>Gün</Text>
            </View>
            <Text style={styles.timeDivider}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
              <Text style={styles.timeUnit}>Saat</Text>
            </View>
            <Text style={styles.timeDivider}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
              <Text style={styles.timeUnit}>Dakika</Text>
            </View>
            <Text style={styles.timeDivider}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
              <Text style={styles.timeUnit}>Saniye</Text>
            </View>
          </View>
        </View>

        {/* Quick Nav Bar */}
        <View style={styles.quickNav}>
          <TouchableOpacity
            style={[styles.navButton, activeTab === 'davetiye' && styles.navButtonActive]}
            onPress={openInvitation}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-open-outline" size={18} color={activeTab === 'davetiye' ? '#FFF' : '#C5A059'} />
            <Text style={[styles.navText, activeTab === 'davetiye' && styles.navTextActive]}>Dijital Davetiye</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.uploadHighlight, activeTab === 'yukle' && styles.navButtonActive]}
            onPress={() => router.push(`/${event.slug}/yukle` as any)}
          >
            <Ionicons name="camera" size={18} color="#FFF" />
            <Text style={[styles.navText, { color: '#FFF', fontWeight: '700' }]}>Fotoğraf Yükle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activeTab === 'galeri' && styles.navButtonActive]}
            onPress={() => router.push(`/${event.slug}/galeri` as any)}
          >
            <Ionicons name="images" size={18} color={activeTab === 'galeri' ? '#FFF' : '#C5A059'} />
            <Text style={[styles.navText, activeTab === 'galeri' && styles.navTextActive]}>Galeri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, activeTab === 'ani-defteri' && styles.navButtonActive]}
            onPress={() => router.push(`/${event.slug}/ani-defteri` as any)}
          >
            <Ionicons name="book" size={18} color={activeTab === 'ani-defteri' ? '#FFF' : '#C5A059'} />
            <Text style={[styles.navText, activeTab === 'ani-defteri' && styles.navTextActive]}>Anı Defteri</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Digital Invitation Lightbox Modal */}
      <Modal
        visible={isInvitationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInvitationModalOpen(false)}
      >
        <View style={styles.invitationModalOverlay}>
          <View style={styles.invitationModalContent}>
            <View style={styles.invitationModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="mail-open" size={20} color="#C5A059" />
                <Text style={styles.invitationModalTitle}>Dijital Davetiye</Text>
              </View>
              <TouchableOpacity
                style={styles.invitationModalCloseBtn}
                onPress={() => setIsInvitationModalOpen(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={22} color="#1A1817" />
              </TouchableOpacity>
            </View>

            <View style={styles.invitationModalBody}>
              {Boolean(event.invitationUrl) && (
                <Image
                  source={{ uri: event.invitationUrl }}
                  style={styles.invitationModalImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.invitationModalFooter}>
              <TouchableOpacity
                style={styles.invitationModalDownloadBtn}
                onPress={() => {
                  let url = (event.invitationUrl || '').trim();
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = `https://${url}`;
                  }
                  if (Platform.OS === 'web') {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } else {
                    Linking.openURL(url);
                  }
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="open-outline" size={16} color="#FFF" />
                <Text style={styles.invitationModalDownloadBtnText}>Tam Boyut / İndir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.invitationModalDismissBtn}
                onPress={() => setIsInvitationModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.invitationModalDismissBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF7F2',
  },
  coverWrapper: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  eventTypeBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  topRightActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostPanelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(26, 24, 23, 0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5A059',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  hostPanelBadgeText: {
    color: '#FBF8F2',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3366',
    marginRight: 6,
  },
  liveBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hostBanner: {
    width: '100%',
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: '#EAD7BB',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  hostBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hostBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  hostBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hostBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1817',
  },
  hostLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  hostStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  hostBannerSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
    marginTop: 2,
  },
  hostBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8A6D3B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  hostBannerBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C5A059',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  mapLink: {
    color: '#C5A059',
    textDecorationLine: 'underline',
  },
  countdownContainer: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A37E36',
    letterSpacing: 1,
    marginBottom: 10,
  },
  countdownGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 44,
  },
  timeNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
  },
  timeUnit: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  timeDivider: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C5A059',
    marginBottom: 14,
  },
  quickNav: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  navButtonActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  uploadHighlight: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  navTextActive: {
    color: '#FFF',
  },
  invitationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  invitationModalContent: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FAF7F2',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  invitationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DA',
    backgroundColor: '#FFF',
  },
  invitationModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  invitationModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationModalBody: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
    maxHeight: 500,
    backgroundColor: '#1E293B',
  },
  invitationModalImage: {
    width: '100%',
    height: 420,
  },
  invitationModalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE7DA',
  },
  invitationModalDownloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    borderRadius: 12,
  },
  invitationModalDownloadBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  invitationModalDismissBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationModalDismissBtnText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
});
