import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '@/services/eventService';
import { appStorage } from '@/services/storage';
import { EventModel, AlbumModel, PhotoModel } from '@/types';
import { PhotoGrid } from '@/components/PhotoGrid';

export default function GalleryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventModel | null>(null);
  const [albums, setAlbums] = useState<AlbumModel[]>([]);
  const [photos, setPhotos] = useState<PhotoModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const loadData = React.useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    const ev = await eventService.getEvent(slug);
    const alb = await eventService.getAlbums(slug);
    const ph = await eventService.getPhotos(slug);
    setEvent(ev);
    setAlbums(alb);
    setPhotos(ph);

    // Check if gallery was already unlocked in this session or if event is public
    if (!ev || !ev.settings.isPrivate) {
      setIsUnlocked(true);
    } else {
      const alreadyUnlocked = appStorage.getItem(`qr_la_unlocked_${slug}`) === 'true';
      if (alreadyUnlocked) {
        setIsUnlocked(true);
      }
    }

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

  const handleVerifyPin = () => {
    if (!event) return;
    if (event.settings.pinCode === pinInput.trim()) {
      setIsUnlocked(true);
      setPinError(false);
      appStorage.setItem(`qr_la_unlocked_${slug}`, 'true');
    } else {
      setPinError(true);
    }
  };

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

  // If private and not yet unlocked, show PIN verification screen
  if (event.settings.isPrivate && !isUnlocked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.pinHeaderNav}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push(`/${slug}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <Text style={styles.pinNavTitle}>{event.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.pinContainer}>
          <View style={styles.pinCard}>
            <View style={styles.lockCircle}>
              <Ionicons name="lock-closed" size={32} color="#C5A059" />
            </View>
            <Text style={styles.pinTitle}>Fotoğraf Galerisi Korumalı</Text>
            <Text style={styles.pinDesc}>
              Bu etkinlikteki anıları yalnızca masadaki davetliler görüntüleyebilir. Lütfen masa kartındaki 4 haneli PIN kodunu giriniz.
            </Text>

            <TextInput
              style={[styles.pinInput, pinError && styles.pinInputError]}
              keyboardType="numeric"
              maxLength={4}
              placeholder="PIN"
              placeholderTextColor="#9CA3AF"
              value={pinInput}
              autoFocus
              onChangeText={(txt) => {
                setPinInput(txt);
                setPinError(false);
                if (event.settings.pinCode === txt.trim()) {
                  setIsUnlocked(true);
                  appStorage.setItem(`qr_la_unlocked_${slug}`, 'true');
                }
              }}
              secureTextEntry
            />

            {pinError && (
              <Text style={styles.errorText}>Hatalı PIN kodu. Lütfen tekrar deneyin.</Text>
            )}

            <TouchableOpacity
              style={[styles.verifyBtn, pinInput.trim().length === 0 && { opacity: 0.6 }]}
              onPress={handleVerifyPin}
              activeOpacity={0.8}
              disabled={pinInput.trim().length === 0}
            >
              <Ionicons name="key-outline" size={18} color="#FFF" />
              <Text style={styles.verifyBtnText}>Galeriyi Aç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelLinkBtn}
              onPress={() => router.push(`/${slug}` as any)}
            >
              <Text style={styles.cancelLinkText}>Etkinlik Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
  // PIN Verification Screen Styles
  pinHeaderNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pinNavTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pinCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },
  lockCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
  },
  pinTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 8,
    textAlign: 'center',
  },
  pinDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  pinInput: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    borderColor: '#EFE7DA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: '#1A1817',
    marginBottom: 12,
  },
  pinInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyBtn: {
    width: '100%',
    backgroundColor: '#C5A059',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 6,
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelLinkBtn: {
    marginTop: 16,
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
});
