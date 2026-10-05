import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AlbumModel } from '@/types';
import { compressImage, formatBytes } from '@/services/compression';
import { eventService } from '@/services/eventService';

interface SelectedImageItem {
  uri: string;
  originalSize: number;
  compressedUri?: string;
  compressedSize?: number;
  file?: File;
}

interface PhotoUploaderProps {
  slug: string;
  albums: AlbumModel[];
  onUploadSuccess: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  slug,
  albums,
  onUploadSuccess,
}) => {
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
  const [uploaderName, setUploaderName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [guestNote, setGuestNote] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(
    albums.find((a) => a.slug !== 'all')?.id || 'alb-1'
  );
  const [isCompressionEnabled, setIsCompressionEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pick images from gallery
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: SelectedImageItem[] = result.assets.map((asset) => ({
          uri: asset.uri,
          originalSize: asset.fileSize || 3500000,
        }));
        setSelectedImages((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Image pick error:', err);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir sorun oluştu.');
    }
  };

  // Remove single image from queue
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Perform upload
  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir fotoğraf seçin.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const total = selectedImages.length;

      for (let i = 0; i < total; i++) {
        const item = selectedImages[i];
        let finalUri = item.uri;
        let finalSize = item.originalSize;

        if (isCompressionEnabled) {
          const compResult = await compressImage(item.uri, {
            maxWidth: 1920,
            quality: 0.78,
          });
          finalUri = compResult.uri;
          finalSize = compResult.compressedSize;
        }

        // Add to event service
        await eventService.addPhoto(slug, {
          eventSlug: slug,
          albumId: selectedAlbumId,
          originalUrl: finalUri,
          thumbnailUrl: finalUri,
          uploaderName: uploaderName.trim() || 'Misafir',
          tableNumber: tableNumber.trim() || undefined,
          guestNote: guestNote.trim() || undefined,
          sizeBytes: finalSize,
        });

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      setIsUploading(false);
      setSelectedImages([]);
      setGuestNote('');
      Alert.alert('Harika! 🎉', 'Fotoğraflarınız başarıyla yüklendi ve canlı ekrana yansıtıldı.');
      onUploadSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      setIsUploading(false);
      Alert.alert('Hata', 'Yükleme sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="cloud-upload" size={24} color="#C5A059" />
        <Text style={styles.title}>Toplu Fotoğraf Yükle</Text>
      </View>
      <Text style={styles.subtitle}>
        Geceden yakaladığın en özel anları gelin ve damadın arşivine tek tıkla ekle.
      </Text>

      {/* Select Photo Trigger Box */}
      <TouchableOpacity
        style={styles.dropzone}
        onPress={pickImages}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="images" size={32} color="#C5A059" />
        </View>
        <Text style={styles.dropzoneTitle}>Fotoğrafları Seç (Çoklu Seçim)</Text>
        <Text style={styles.dropzoneHint}>Galerinden tek seferde dilediğin kadar fotoğraf ekleyebilirsin</Text>
      </TouchableOpacity>

      {/* Selected Photos Preview Scroll */}
      {selectedImages.length > 0 && (
        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewCount}>
              {selectedImages.length} Fotoğraf Seçildi
            </Text>
            <TouchableOpacity onPress={() => setSelectedImages([])}>
              <Text style={styles.clearAllText}>Hepsini Kaldır</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewScroll}>
            {selectedImages.map((img, idx) => (
              <View key={idx} style={styles.thumbWrapper}>
                <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                <TouchableOpacity
                  style={styles.thumbDeleteBtn}
                  onPress={() => removeImage(idx)}
                  disabled={isUploading}
                >
                  <Ionicons name="close" size={14} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.thumbSizeBadge}>
                  <Text style={styles.thumbSizeText}>{formatBytes(img.originalSize)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fast Compression Toggle */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={styles.switchTitleRow}>
            <Ionicons
              name={isCompressionEnabled ? "flash" : "image"}
              size={16}
              color={isCompressionEnabled ? "#EAB308" : "#F59E0B"}
            />
            <Text style={styles.switchLabel}>
              {isCompressionEnabled ? 'Akıllı Hızlı Sıkıştırma (Önerilen)' : 'Orijinal Kalitede Yükle'}
            </Text>
            {!isCompressionEnabled && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>Kota Hızlı Dolar</Text>
              </View>
            )}
          </View>
          <Text style={styles.switchDesc}>
            {isCompressionEnabled
              ? 'Fotoğrafları kalitesini bozmadan ~%80 küçültür, internet harcamaz ve anında yüklenir.'
              : 'Orijinal ham dosya boyutuyla (3-8 MB) yüklenir.'}
          </Text>
        </View>
        <Switch
          value={isCompressionEnabled}
          onValueChange={setIsCompressionEnabled}
          trackColor={{ false: '#F59E0B', true: '#C5A059' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {!isCompressionEnabled && (
        <View style={styles.quotaWarningBox}>
          <Ionicons name="warning" size={16} color="#D97706" />
          <Text style={styles.quotaWarningText}>
            Uyarı: Orijinal boyutta yüklerseniz etkinlik kotası daha çabuk dolar ve yükleme internet hızınıza bağlı olarak daha uzun sürebilir.
          </Text>
        </View>
      )}

      {/* Album Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Fotoğraf Hangi Albüme Gitsin?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumChoices}>
          {albums
            .filter((a) => a.slug !== 'all')
            .map((album) => {
              const isSelected = selectedAlbumId === album.id;
              return (
                <TouchableOpacity
                  key={album.id}
                  style={[styles.albumChoicePill, isSelected && styles.albumChoiceActive]}
                  onPress={() => setSelectedAlbumId(album.id)}
                >
                  <Text style={[styles.albumChoiceText, isSelected && styles.albumChoiceTextActive]}>
                    {album.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Guest Name & Table Number */}
      <View style={styles.nameTableRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>İsminiz (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Ayşe & Can"
            placeholderTextColor="#9CA3AF"
            value={uploaderName}
            onChangeText={setUploaderName}
            editable={!isUploading}
          />
        </View>

        <View style={[styles.inputGroup, { width: 120 }]}>
          <Text style={styles.fieldLabel}>Masa No</Text>
          <TextInput
            style={styles.input}
            placeholder="Masa 7"
            placeholderTextColor="#9CA3AF"
            value={tableNumber}
            onChangeText={setTableNumber}
            editable={!isUploading}
          />
        </View>
      </View>

      {/* Note to the couple */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Çifte Özel Kısa Bir Not (Opsiyonel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Örn: Bir ömür boyu mutluluklar dileriz! ❤️"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={2}
          value={guestNote}
          onChangeText={setGuestNote}
          editable={!isUploading}
        />
      </View>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>Yükleniyor... %{uploadProgress}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          selectedImages.length === 0 && styles.submitBtnDisabled,
          isUploading && styles.submitBtnLoading,
        ]}
        onPress={handleUpload}
        disabled={selectedImages.length === 0 || isUploading}
        activeOpacity={0.8}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
            <Text style={styles.submitBtnText}>
              {selectedImages.length > 0
                ? `${selectedImages.length} Fotoğrafı Yükle`
                : 'Fotoğraf Seçin'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 18,
  },
  dropzone: {
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    borderColor: '#EAD7BB',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropzoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  dropzoneHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  clearAllText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  previewScroll: {
    gap: 10,
  },
  thumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbSizeBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingVertical: 1,
    alignItems: 'center',
  },
  thumbSizeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  switchDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  quotaWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  quotaWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  nameTableRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1817',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  albumChoices: {
    gap: 8,
  },
  albumChoicePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  albumChoiceActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  albumChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  albumChoiceTextActive: {
    color: '#FFF',
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: '#C5A059',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnLoading: {
    opacity: 0.8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
