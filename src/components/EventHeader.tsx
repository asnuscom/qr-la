import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventModel } from '@/types';

interface EventHeaderProps {
  event: EventModel;
  activeTab?: 'home' | 'yukle' | 'galeri' | 'ani-defteri' | 'canli';
}

export const EventHeader: React.FC<EventHeaderProps> = ({ event, activeTab = 'home' }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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

  const formattedDate = new Date(event.eventDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

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

        {/* Live Projector Quick Link */}
        <TouchableOpacity
          style={styles.liveBadge}
          onPress={() => router.push(`/${event.slug}/canli` as any)}
          activeOpacity={0.8}
        >
          <View style={styles.pulseDot} />
          <Ionicons name="tv-outline" size={14} color="#FFF" style={{ marginRight: 5 }} />
          <Text style={styles.liveBadgeText}>Canlı Projeksiyon</Text>
        </TouchableOpacity>
      </View>

      {/* Main Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.title}>{event.title}</Text>
        {event.subtitle && <Text style={styles.subtitle}>{event.subtitle}</Text>}

        {/* Date and Venue info chips */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#C5A059" />
            <Text style={styles.metaText}>{formattedDate}</Text>
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
            style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
            onPress={() => router.push(`/${event.slug}` as any)}
          >
            <Ionicons name="sparkles" size={18} color={activeTab === 'home' ? '#FFF' : '#C5A059'} />
            <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Akış & Bilgi</Text>
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
  liveBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
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
});
