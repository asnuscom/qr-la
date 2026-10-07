import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { EventModel, PhotoModel } from '@/types';
import { LiveProjector } from '@/components/LiveProjector';

export default function LiveScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = event?.title ? `${event.title} - Canlı Projeksiyon | QR-la` : 'Canlı Projeksiyon | QR-la';
    }
  }, [event?.title]);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setIsLoading(true);
      const ev = await eventService.getEvent(slug);
      const ph = await eventService.getPhotos(slug);
      setEvent(ev);
      setPhotos(ph);
      setIsLoading(false);
    };
    load();

    // Subscribe to real-time photo uploads
    const unsubscribe = eventService.subscribePhotos(slug, (newPhotos) => {
      setPhotos(newPhotos);
    });

    return () => unsubscribe();
  }, [slug]);

  if (isLoading || !event) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Exit Button */}
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => router.push(`/${slug}` as any)}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
      </TouchableOpacity>

      <LiveProjector event={event} photos={photos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitBtn: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
});
