import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlbumModel, PhotoModel } from '@/types';
import { LightboxModal } from './LightboxModal';
import { appStorage } from '@/services/storage';

interface PhotoGridProps {
  albums: AlbumModel[];
  photos: PhotoModel[];
  onLikePhoto: (photoId: string, shouldLike: boolean) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  albums,
  photos,
  onLikePhoto,
  onDeletePhoto,
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('alb-all');
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const [activePhoto, setActivePhoto] = useState<PhotoModel | null>(null);
  const [likedPhotoIds, setLikedPhotoIds] = useState<Set<string>>(new Set());
  const [animatingHeartPhotoId, setAnimatingHeartPhotoId] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  // Load liked photo IDs from local storage
  useEffect(() => {
    try {
      const stored = appStorage.getItem('qr_la_liked_photos');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLikedPhotoIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.warn('Error loading liked photos:', e);
    }
  }, []);

  const albumIds = new Set(albums.map((a) => a.id));

  // 1. Filter photos based on album
  let filteredPhotos =
    selectedAlbumId === 'alb-all' || selectedAlbumId === 'all'
      ? [...photos]
      : selectedAlbumId === 'alb-genel'
      ? photos.filter((p) => !p.albumId || p.albumId === 'alb-genel' || !albumIds.has(p.albumId))
      : photos.filter((p) => p.albumId === selectedAlbumId);

  // 2. Sort photos (latest vs popular)
  if (sortMode === 'popular') {
    filteredPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  // Column calculations
  const numColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const gap = 12;
  const padding = 16;
  const availableWidth = Math.min(width, 1000) - padding * 2 - gap * (numColumns - 1);
  const itemWidth = availableWidth / numColumns;

  const getAlbumCount = (albumId: string) => {
    if (albumId === 'alb-all' || albumId === 'all') {
      return photos.length;
    }
    if (albumId === 'alb-genel') {
      return photos.filter((p) => !p.albumId || p.albumId === 'alb-genel' || !albumIds.has(p.albumId)).length;
    }
    return photos.filter((p) => p.albumId === albumId).length;
  };

  const handleToggleLike = (photoId: string) => {
    const isCurrentlyLiked = likedPhotoIds.has(photoId);
    const updated = new Set(likedPhotoIds);

    if (isCurrentlyLiked) {
      updated.delete(photoId);
      onLikePhoto(photoId, false);
    } else {
      updated.add(photoId);
      onLikePhoto(photoId, true);
      // Trigger heart animation
      setAnimatingHeartPhotoId(photoId);
      setTimeout(() => setAnimatingHeartPhotoId(null), 700);
    }

    setLikedPhotoIds(updated);
    appStorage.setItem('qr_la_liked_photos', JSON.stringify(Array.from(updated)));
  };

  const handlePhotoPress = (photo: PhotoModel) => {
    setActivePhoto(photo);
  };

  // Find max likes to identify top trending photos
  const maxLikes = Math.max(...photos.map((p) => p.likes || 0), 0);

  return (
    <View style={styles.container}>
      {/* Sort Options & Albums Header Bar */}
      <View style={styles.filterSection}>
        <View style={styles.sortBar}>
          <TouchableOpacity
            style={[styles.sortBtn, sortMode === 'latest' && styles.sortBtnActive]}
            onPress={() => setSortMode('latest')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={sortMode === 'latest' ? '#FFF' : '#6B7280'}
            />
            <Text style={[styles.sortBtnText, sortMode === 'latest' && styles.sortBtnTextActive]}>
              En Yeni
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortBtn, sortMode === 'popular' && styles.sortBtnPopularActive]}
            onPress={() => setSortMode('popular')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="flame"
              size={14}
              color={sortMode === 'popular' ? '#FFF' : '#EF4444'}
            />
            <Text style={[styles.sortBtnText, sortMode === 'popular' && styles.sortBtnTextActive]}>
              En Çok Beğenilenler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Albums Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.albumsContainer}
        >
          {albums.map((album) => {
            const isSelected = selectedAlbumId === album.id || (album.slug === 'all' && selectedAlbumId === 'alb-all');
            const count = getAlbumCount(album.id);
            return (
              <TouchableOpacity
                key={album.id}
                style={[styles.albumPill, isSelected && styles.albumPillActive]}
                onPress={() => setSelectedAlbumId(album.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.albumName, isSelected && styles.albumNameActive]}>
                  {album.name}
                </Text>
                <View style={[styles.albumCountBadge, isSelected && styles.albumCountBadgeActive]}>
                  <Text style={[styles.albumCountText, isSelected && styles.albumCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid of Photos */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Henüz bu albümde fotoğraf yok</Text>
          <Text style={styles.emptySubtitle}>İlk kareyi yükleyerek albümü sen canlandır!</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredPhotos.map((photo) => {
            const isLiked = likedPhotoIds.has(photo.id);
            const isTopTrending = maxLikes > 0 && photo.likes === maxLikes;
            const isAnimating = animatingHeartPhotoId === photo.id;

            return (
              <TouchableOpacity
                key={photo.id}
                style={[styles.photoCard, { width: itemWidth, height: itemWidth * 1.15 }]}
                onPress={() => handlePhotoPress(photo)}
                activeOpacity={0.9}
              >
                {photo.mediaType === 'video' ? (
                  <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {Platform.OS === 'web' ? (
                      <video
                        src={photo.thumbnailUrl || photo.originalUrl}
                        muted
                        playsInline
                        preload="metadata"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
                      <Image
                        source={{ uri: photo.thumbnailUrl || photo.originalUrl }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.videoPlayBadge}>
                      <Ionicons name="play" size={12} color="#FFF" />
                      <Text style={styles.videoPlayBadgeText}>Video</Text>
                    </View>
                  </View>
                ) : (
                  <Image
                    source={{ uri: photo.thumbnailUrl || photo.originalUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}

                {/* Double Tap Heart Burst Animation */}
                {isAnimating && (
                  <View style={styles.burstCenter}>
                    <Ionicons name="heart" size={64} color="#FF2D55" />
                  </View>
                )}

                {/* Top Trending Ribbon Badge */}
                {isTopTrending && photo.likes > 0 && (
                  <View style={styles.trendingBadge}>
                    <Ionicons name="flame" size={11} color="#FFF" />
                    <Text style={styles.trendingBadgeText}>POPÜLER</Text>
                  </View>
                )}

                {/* Bottom Gradient overlay info */}
                <View style={styles.photoOverlay}>
                  <View style={styles.uploaderBox}>
                    <Text style={styles.uploaderText} numberOfLines={1}>
                      {photo.uploaderName || 'Misafir'}
                    </Text>
                    {photo.tableNumber && (
                      <Text style={styles.tableText} numberOfLines={1}>
                        {photo.tableNumber}
                      </Text>
                    )}
                  </View>

                  {/* Like Button */}
                  <TouchableOpacity
                    style={[
                      styles.heartBtn,
                      isLiked && styles.heartBtnLiked,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleToggleLike(photo.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={14}
                      color={isLiked ? '#FF2D55' : '#FFFFFF'}
                    />
                    <Text style={[styles.heartText, isLiked && styles.heartTextLiked]}>
                      {photo.likes || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        photo={activePhoto}
        isLiked={activePhoto ? likedPhotoIds.has(activePhoto.id) : false}
        onClose={() => setActivePhoto(null)}
        onLike={(id) => handleToggleLike(id)}
        onDelete={onDeletePhoto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  filterSection: {
    backgroundColor: '#FAF7F2',
    paddingBottom: 4,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sortBtnActive: {
    backgroundColor: '#1A1817',
    borderColor: '#1A1817',
  },
  sortBtnPopularActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
  albumsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  albumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  albumPillActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  albumName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  albumNameActive: {
    color: '#FFFFFF',
  },
  albumCountBadge: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  albumCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  albumCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  albumCountTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  photoCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  burstCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 10,
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    zIndex: 5,
  },
  trendingBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  videoPlayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    zIndex: 5,
  },
  videoPlayBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploaderBox: {
    flex: 1,
    marginRight: 6,
  },
  uploaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tableText: {
    color: '#E5E7EB',
    fontSize: 10,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heartBtnLiked: {
    backgroundColor: 'rgba(255, 45, 85, 0.25)',
    borderColor: '#FF2D55',
  },
  heartText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heartTextLiked: {
    color: '#FF4D6D',
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});

