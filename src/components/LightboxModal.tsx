import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhotoModel } from '@/types';
import { formatBytes } from '@/services/compression';

interface LightboxModalProps {
  photo: PhotoModel | null;
  isLiked?: boolean;
  onClose: () => void;
  onLike: (photoId: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ photo, isLiked = false, onClose, onLike }) => {
  const [lastTap, setLastTap] = React.useState<number>(0);
  const [showHeartBurst, setShowHeartBurst] = React.useState(false);

  if (!photo) return null;

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      // Double tap detected
      onLike(photo.id);
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
    setLastTap(now);
  };

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = photo.originalUrl;
      link.download = `qr-la-foto-${photo.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Linking.openURL(photo.originalUrl);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'QR-la Fotoğrafı',
        message: `${photo.uploaderName || 'Bir misafir'} tarafından paylaşıldı: ${photo.originalUrl}`,
        url: photo.originalUrl,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  return (
    <Modal visible={!!photo} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Top Action Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity style={styles.circleBtn} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.8}>
              <Ionicons name="download-outline" size={18} color="#FFF" />
              <Text style={styles.downloadBtnText}>İndir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Image with Double Tap */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={1}
          onPress={handleDoubleTap}
        >
          <Image
            source={{ uri: photo.originalUrl || photo.thumbnailUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          {showHeartBurst && (
            <View style={styles.heartBurstOverlay}>
              <Ionicons name="heart" size={90} color="#FF2D55" />
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Details Drawer */}
        <View style={styles.bottomDrawer}>
          <View style={styles.detailsRow}>
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploaderName}>
                {photo.uploaderName || 'Misafir'}
              </Text>
              <View style={styles.tagsRow}>
                {photo.tableNumber && (
                  <View style={styles.tag}>
                    <Ionicons name="restaurant-outline" size={12} color="#C5A059" />
                    <Text style={styles.tagText}>{photo.tableNumber}</Text>
                  </View>
                )}
                <View style={styles.tag}>
                  <Ionicons name="cloud-done-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.tagText}>{formatBytes(photo.sizeBytes)}</Text>
                </View>
              </View>
            </View>

            {/* Like Button */}
            <TouchableOpacity
              style={[
                styles.likeBtn,
                isLiked && styles.likeBtnActive,
              ]}
              onPress={() => onLike(photo.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#FF2D55' : '#FFFFFF'}
              />
              <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                {photo.likes || 0}
              </Text>
            </TouchableOpacity>
          </View>

          {photo.guestNote && (
            <Text style={styles.guestNote}>"{photo.guestNote}"</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  downloadBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  bottomDrawer: {
    backgroundColor: 'rgba(20, 20, 22, 0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploaderInfo: {
    flex: 1,
  },
  uploaderName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tagText: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  likeBtnActive: {
    backgroundColor: 'rgba(255, 45, 85, 0.25)',
    borderColor: '#FF2D55',
  },
  likeCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  likeCountActive: {
    color: '#FF4D6D',
    fontWeight: '800',
  },
  guestNote: {
    color: '#E5E7EB',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 6,
  },
  heartBurstOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF2D55',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});

