import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventModel, PhotoModel } from '@/types';

interface LiveProjectorProps {
  event: EventModel;
  photos: PhotoModel[];
}

export const LiveProjector: React.FC<LiveProjectorProps> = ({ event, photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [newPhotoAlert, setNewPhotoAlert] = useState<PhotoModel | null>(null);

  // Auto advance slides every 6 seconds
  useEffect(() => {
    if (!isPlaying || photos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, photos.length]);

  // When a new photo is added, trigger alert banner
  useEffect(() => {
    if (photos.length > 0 && photos[0]) {
      setNewPhotoAlert(photos[0]);
      setCurrentIndex(0); // jump to newly added photo immediately

      const timeout = setTimeout(() => {
        setNewPhotoAlert(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [photos]);

  const toggleFullscreen = () => {
    if (Platform.OS === 'web' && document.documentElement) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <View style={styles.container}>
      {/* Background ambient blur */}
      {currentPhoto && (
        <Image
          source={{ uri: currentPhoto.originalUrl || currentPhoto.thumbnailUrl }}
          style={styles.ambientBackground}
          blurRadius={40}
        />
      )}
      <View style={styles.darkWash} />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CANLI YAYIN AKIŞI</Text>
            <Text style={styles.dotDivider}>•</Text>
            <Text style={styles.photoCountText}>{photos.length} Anı Paylaşıldı</Text>
          </View>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setIsPlaying(!isPlaying)}
            activeOpacity={0.7}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFF" />
          </TouchableOpacity>

          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={toggleFullscreen}
              activeOpacity={0.7}
            >
              <Ionicons name="expand" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Slide Stage */}
      <View style={styles.stage}>
        {currentPhoto ? (
          <View style={styles.slideCard}>
            <Image
              source={{ uri: currentPhoto.originalUrl || currentPhoto.thumbnailUrl }}
              style={styles.mainImage}
              resizeMode="contain"
            />

            {/* Slide Caption Box */}
            <View style={styles.captionBox}>
              <View style={styles.captionTop}>
                <Text style={styles.captionUploader}>
                  📸 {currentPhoto.uploaderName || 'Misafir'}
                </Text>
                {currentPhoto.tableNumber && (
                  <View style={styles.captionTable}>
                    <Text style={styles.captionTableText}>{currentPhoto.tableNumber}</Text>
                  </View>
                )}
              </View>
              {currentPhoto.guestNote && (
                <Text style={styles.captionNote}>"{currentPhoto.guestNote}"</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyStage}>
            <Ionicons name="images-outline" size={64} color="#C5A059" />
            <Text style={styles.emptyTitle}>Henüz fotoğraf yüklenmedi</Text>
            <Text style={styles.emptySub}>Masadaki QR kodu taratarak ilk fotoğrafı siz gönderin!</Text>
          </View>
        )}
      </View>

      {/* New Photo Celebration Banner */}
      {newPhotoAlert && (
        <View style={styles.alertBanner}>
          <Ionicons name="sparkles" size={20} color="#FBBF24" />
          <Text style={styles.alertText}>
            🎉 <Text style={{ fontWeight: '800' }}>{newPhotoAlert.uploaderName || 'Bir misafir'}</Text> yeni bir anı paylaştı!
          </Text>
        </View>
      )}

      {/* Bottom Floating QR Prompt Box for Salon Guests */}
      <View style={styles.qrPromptContainer}>
        <View style={styles.qrBox}>
          {/* Simulated aesthetic SVG/Image QR for the event */}
          <Image
            source={{
              uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qr-la.com/${event.slug}&color=1a1817&bgcolor=faf7f2`,
            }}
            style={styles.qrImage}
          />
        </View>
        <View style={styles.qrTextCol}>
          <Text style={styles.qrCallout}>MASANDAN FOTOĞRAF GÖNDER</Text>
          <Text style={styles.qrDesc}>Kameranı açıp QR kodu tara, dev ekranda görün!</Text>
          <Text style={styles.qrLink}>qr-la.com/{event.slug}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  ambientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
  darkWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 12, 0.75)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 24,
    zIndex: 10,
  },
  eventInfo: {},
  eventTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotDivider: {
    color: '#6B7280',
    marginHorizontal: 8,
  },
  photoCountText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  slideCard: {
    width: '100%',
    height: '85%',
    maxWidth: 960,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  captionBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  captionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captionUploader: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  captionTable: {
    backgroundColor: '#C5A059',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  captionTableText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  captionNote: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 6,
  },
  alertBanner: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  alertText: {
    color: '#1A1817',
    fontSize: 14,
    fontWeight: '600',
  },
  qrPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  qrBox: {
    width: 64,
    height: 64,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  qrTextCol: {},
  qrCallout: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  qrDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  qrLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
    marginTop: 2,
  },
});
