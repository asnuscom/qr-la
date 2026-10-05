import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlbumModel, PhotoModel } from '@/types';
import { LightboxModal } from './LightboxModal';

interface PhotoGridProps {
  albums: AlbumModel[];
  photos: PhotoModel[];
  onLikePhoto: (photoId: string) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ albums, photos, onLikePhoto }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('alb-all');
  const [activePhoto, setActivePhoto] = useState<PhotoModel | null>(null);
  const { width } = useWindowDimensions();

  const albumIds = new Set(albums.map((a) => a.id));

  // Filter photos based on album
  const filteredPhotos =
    selectedAlbumId === 'alb-all' || selectedAlbumId === 'all'
      ? photos
      : selectedAlbumId === 'alb-genel'
      ? photos.filter((p) => !p.albumId || p.albumId === 'alb-genel' || !albumIds.has(p.albumId))
      : photos.filter((p) => p.albumId === selectedAlbumId);

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

  return (
    <View style={styles.container}>
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

      {/* Grid of Photos */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Henüz bu albümde fotoğraf yok</Text>
          <Text style={styles.emptySubtitle}>İlk kareyi yükleyerek albümü sen canlandır!</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={[styles.photoCard, { width: itemWidth, height: itemWidth * 1.15 }]}
              onPress={() => setActivePhoto(photo)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: photo.thumbnailUrl || photo.originalUrl }} style={styles.image} resizeMode="cover" />

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
                  style={styles.heartBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onLikePhoto(photo.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="heart" size={14} color="#FF3366" />
                  <Text style={styles.heartText}>{photo.likes}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        photo={activePhoto}
        onClose={() => setActivePhoto(null)}
        onLike={(id) => {
          onLikePhoto(id);
          if (activePhoto && activePhoto.id === id) {
            setActivePhoto({ ...activePhoto, likes: activePhoto.likes + 1 });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  albumsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  albumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  albumNameActive: {
    color: '#FFFFFF',
  },
  albumCountBadge: {
    backgroundColor: '#F3EFE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  albumCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  albumCountText: {
    fontSize: 11,
    fontWeight: '700',
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
    marginTop: 8,
    justifyContent: 'center',
  },
  photoCard: {
    borderRadius: 16,
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
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  heartText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
