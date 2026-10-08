import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { EventModel, AlbumModel } from '@/types';
import { PhotoUploader } from '@/components/PhotoUploader';

export default function UploadScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = event?.title ? `${event.title} - Fotoğraf Yükle | QR-la` : 'Fotoğraf Yükle | QR-la';
    }
  }, [event?.title]);

  useEffect(() => {
    if (!slug) return;
    const loadData = async () => {
      setIsLoading(true);
      const ev = await eventService.getEvent(slug);
      const alb = await eventService.getAlbums(slug);
      setEvent(ev);
      setAlbums(alb);
      setIsLoading(false);
    };
    loadData();
  }, [slug]);

  if (isLoading || !event) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push(`/${slug}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.navTitleCenter}>
            <Text style={styles.navTitle}>{event.title}</Text>
            <Text style={styles.navSubtitle}>Fotoğraf Yükleme Alanı</Text>
          </View>
          <TouchableOpacity
            style={styles.galleryNavBtn}
            onPress={() => router.push(`/${slug}/galeri` as any)}
          >
            <Ionicons name="images-outline" size={18} color="#C5A059" />
          </TouchableOpacity>
        </View>

        {/* Uploader Component */}
        <PhotoUploader
          slug={slug}
          albums={albums}
          defaultOriginalQuality={Boolean(
            (event.settings as any)?.originalQuality || event.settings.enableCompression === false
          )}
        />
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    backgroundColor: '#FFF',
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
  navTitleCenter: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  galleryNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
});
