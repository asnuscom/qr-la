import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { EventModel, AlbumModel, PhotoModel } from '@/types';
import { PhotoGrid } from '@/components/PhotoGrid';

export default function GalleryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    const ev = await eventService.getEvent(slug);
    const alb = await eventService.getAlbums(slug);
    const ph = await eventService.getPhotos(slug);
    setEvent(ev);
    setAlbums(alb);
    setPhotos(ph);
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    loadData();
    // Subscribe to real-time photo additions
    const unsubscribe = eventService.subscribePhotos(slug, (updatedPhotos) => {
      setPhotos(updatedPhotos);
    });
    return () => unsubscribe();
  }, [loadData, slug]);

  const handleLike = async (photoId: string) => {
    await eventService.likePhoto(slug, photoId);
  };

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
        {/* Top Nav Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push(`/${slug}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>

          <View style={styles.navTitleCenter}>
            <Text style={styles.navTitle}>Fotoğraf Galerisi</Text>
            <Text style={styles.navSubtitle}>{photos.length} Anı Paylaşıldı</Text>
          </View>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => router.push(`/${slug}/yukle` as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={16} color="#FFF" />
            <Text style={styles.uploadBtnText}>Yükle</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Grid */}
        <PhotoGrid albums={albums} photos={photos} onLikePhoto={handleLike} />
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
    marginBottom: 8,
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
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  uploadBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
