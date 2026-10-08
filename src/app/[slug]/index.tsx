import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { appStorage } from '@/services/storage';
import { EventModel, PhotoModel } from '@/types';
import { EventHeader } from '@/components/EventHeader';
import { ScheduleTimeline } from '@/components/ScheduleTimeline';

export default function EventHomeScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<PhotoModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    const ev = await eventService.getEvent(slug);
    const ph = await eventService.getPhotos(slug);
    setEvent(ev);
    setRecentPhotos(ph.slice(0, 4));
    const unlocked = appStorage.getItem(`qr_la_unlocked_${slug}`) === 'true';
    setIsUnlocked(unlocked);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (event?.title && Platform.OS === 'web' && typeof document !== 'undefined') {
      const typeLabel =
        event.eventType === 'dugun'
          ? 'Düğünü'
          : event.eventType === 'nisan'
          ? 'Nişanı'
          : 'Kutlaması';
      document.title = `${event.title} | Karekod Fotoğraf & Video Galerisi - QR-la`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        `${event.title} ${typeLabel} karekod fotoğraf ve video galerisi. Masadaki QR kodu okutarak anılarınızı anında paylaşın.`
      );
    }
  }, [event?.title, event?.eventType]);

  useFocusEffect(
    useCallback(() => {
      if (!slug) return;
      const unlocked = appStorage.getItem(`qr_la_unlocked_${slug}`) === 'true';
      setIsUnlocked(unlocked);
    }, [slug])
  );

  if (isLoading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  const openMap = () => {
    if (event.venue.mapUrl) {
      if (Platform.OS === 'web') {
        window.open(event.venue.mapUrl, '_blank');
      } else {
        Linking.openURL(event.venue.mapUrl);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Header Card */}
        <EventHeader event={event} activeTab="home" />

        {/* Big Action Floating Callout */}
        <View style={styles.actionCallout}>
          <View style={styles.calloutTextCol}>
            <Text style={styles.calloutTitle}>Anılarını Paylaşmaya Hazır mısın?</Text>
            <Text style={styles.calloutSubtitle}>
              Masandan çektiğin fotoğraflar saniyeler içinde dev salondaki ekrana yansısın.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.calloutBtn}
            onPress={() => router.push(`/${event.slug}/yukle` as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.calloutBtnText}>Hemen Yükle</Text>
          </TouchableOpacity>
        </View>

        {/* Venue Location Card */}
        <View style={styles.venueCard}>
          <View style={styles.venueHeader}>
            <View style={styles.venueIconCircle}>
              <Ionicons name="location" size={22} color="#C5A059" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.venueLabel}>DÜĞÜN MEKANI</Text>
              <Text style={styles.venueTitle}>{event.venue.name}</Text>
            </View>
          </View>
          <Text style={styles.venueAddress}>{event.venue.address}</Text>

          <TouchableOpacity style={styles.mapBtn} onPress={openMap} activeOpacity={0.8}>
            <Ionicons name="navigate-circle-outline" size={18} color="#C5A059" />
            <Text style={styles.mapBtnText}>Google Haritalar'da Yol Tarifi Al</Text>
          </TouchableOpacity>
        </View>

        {/* Event Schedule Timeline */}
        <ScheduleTimeline schedule={event.schedule} />

        {/* Recent Photos Teaser or Private Lock Card */}
        {recentPhotos.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Son Paylaşılan Kareler</Text>
                <Text style={styles.sectionSubtitle}>
                  {event.settings.isPrivate && !isUnlocked
                    ? 'PIN korumalı özel galeri'
                    : 'Misafirlerimizden sıcağı sıcağına'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/${event.slug}/galeri` as any)}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>
                  {event.settings.isPrivate && !isUnlocked ? 'Kilidi Aç' : 'Tümünü Gör'}
                </Text>
                <Ionicons
                  name={event.settings.isPrivate && !isUnlocked ? 'lock-closed' : 'arrow-forward'}
                  size={14}
                  color="#C5A059"
                />
              </TouchableOpacity>
            </View>

            {event.settings.isPrivate && !isUnlocked ? (
              <TouchableOpacity
                style={styles.privateTeaserCard}
                onPress={() => router.push(`/${event.slug}/galeri` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.privateTeaserLockCircle}>
                  <Ionicons name="lock-closed" size={26} color="#C5A059" />
                </View>
                <Text style={styles.privateTeaserTitle}>Fotoğraflar PIN Korumalı</Text>
                <Text style={styles.privateTeaserDesc}>
                  Fotoğrafları ve galeriyi görüntülemek için masanızdaki PIN kodunu giriniz.
                </Text>
                <View style={styles.privateTeaserBtn}>
                  <Ionicons name="key-outline" size={15} color="#FFF" />
                  <Text style={styles.privateTeaserBtnText}>
                    PIN ile Galeriyi Aç ({recentPhotos.length}+ Fotoğraf)
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.recentGrid}>
                {recentPhotos.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.recentThumb}
                    onPress={() => router.push(`/${event.slug}/galeri` as any)}
                  >
                    <Image source={{ uri: photo.thumbnailUrl || photo.originalUrl }} style={styles.recentImage} />
                    <View style={styles.recentUploaderBadge}>
                      <Text style={styles.recentUploaderText} numberOfLines={1}>
                        {photo.uploaderName || 'Misafir'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/' as any)}>
            <Text style={styles.poweredText}>
              Powered by <Text style={{ fontWeight: '800', color: '#C5A059' }}>QR-la.com</Text>
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
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCallout: {
    backgroundColor: '#1A1817',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
    gap: 12,
  },
  calloutTextCol: {
    flex: 1,
  },
  calloutTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  calloutBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  calloutBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  venueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  venueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A37E36',
    letterSpacing: 1,
  },
  venueTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1817',
  },
  venueAddress: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF7F2',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5A059',
  },
  recentGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  recentThumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentUploaderBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  recentUploaderText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  poweredText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  privateTeaserCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  privateTeaserLockCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
  },
  privateTeaserTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  privateTeaserDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    maxWidth: 280,
  },
  privateTeaserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  privateTeaserBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
