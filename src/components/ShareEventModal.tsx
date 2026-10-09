import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { EventModel } from '@/types';

interface ShareEventModalProps {
  visible: boolean;
  event: EventModel | null;
  onClose: () => void;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({
  visible,
  event,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!event) return null;

  const slug = event.slug;
  const baseUrl = 'https://qr-la.com';
  const eventUrl = `${baseUrl}/${slug}`;
  const isPrivate = Boolean(event.settings?.isPrivate && event.settings?.pinCode);
  const pinCode = event.settings?.pinCode || '';

  // Formatted invitation and sharing text
  const hostNames =
    event.hosts?.brideOrPrimary && event.hosts?.groomOrSecondary
      ? `${event.hosts.brideOrPrimary} & ${event.hosts.groomOrSecondary}`
      : event.title;

  const shareMessage = `Merhaba! 📸\n${hostNames} etkinliğimizde çektiğiniz tüm güzel fotoğraf ve videoları bu bağlantıdan hemen yükleyebilir, anılarımızı birlikte paylaşabilirsiniz:\n\n👉 ${eventUrl}${
    isPrivate ? `\n🔒 Galeri PIN Kodu: ${pinCode}` : ''
  }\n\nMasanızdaki QR kodu okutarak veya doğrudan bu bağlantıdan katılabilirsiniz. Görüşmek üzere! 🎉`;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(eventUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      Alert.alert('Bağlantı', eventUrl);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await Clipboard.setStringAsync(shareMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      Alert.alert('Mesaj', shareMessage);
    }
  };

  const handleShareWhatsApp = async () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    try {
      const supported = await Linking.canOpenURL(waUrl);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(waUrl);
      } else {
        await Share.share({ message: shareMessage, url: eventUrl });
      }
    } catch {
      await Share.share({ message: shareMessage, url: eventUrl });
    }
  };

  const handleNativeShare = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({
          title: event.title,
          text: shareMessage,
          url: eventUrl,
        });
      } else {
        await Share.share({
          title: event.title,
          message: shareMessage,
          url: eventUrl,
        });
      }
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        handleCopyLink();
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.titleRow}>
                <View style={styles.shareIconCircle}>
                  <Ionicons name="share-social" size={18} color="#C5A059" />
                </View>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Etkinliği Paylaş
                </Text>
              </View>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {event.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Quick WhatsApp Action Button */}
            <TouchableOpacity
              style={styles.whatsAppCard}
              onPress={handleShareWhatsApp}
              activeOpacity={0.85}
            >
              <View style={styles.whatsAppIconWrap}>
                <Ionicons name="logo-whatsapp" size={26} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.whatsAppHeaderRow}>
                  <Text style={styles.whatsAppTitle}>WhatsApp ile Paylaş</Text>
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>Hızlı</Text>
                  </View>
                </View>
                <Text style={styles.whatsAppSub}>
                  Hazır davet ve fotoğraf yükleme mesajını gruplara gönderin.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#25D366" />
            </TouchableOpacity>

            {/* Direct Link Card */}
            <View style={styles.linkCard}>
              <View style={styles.linkLabelRow}>
                <Text style={styles.sectionLabel}>ETKİNLİK WEB BAĞLANTISI</Text>
                {isPrivate && (
                  <View style={styles.pinTag}>
                    <Ionicons name="lock-closed" size={10} color="#B45309" />
                    <Text style={styles.pinTagText}>PIN: {pinCode}</Text>
                  </View>
                )}
              </View>

              <View style={styles.linkBox}>
                <Text style={styles.linkText} numberOfLines={1} selectable>
                  {eventUrl}
                </Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedLink && styles.copyBtnSuccess]}
                  onPress={handleCopyLink}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copiedLink ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={copiedLink ? '#FFF' : '#8A6D3B'}
                  />
                  <Text style={[styles.copyBtnText, copiedLink && styles.copyBtnTextSuccess]}>
                    {copiedLink ? 'Kopyalandı' : 'Kopyala'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ready Message Preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.sectionLabel}>HAZIR PAYLAŞIM MESAJI</Text>
                <TouchableOpacity
                  style={styles.copyMessageAction}
                  onPress={handleCopyMessage}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={copiedMessage ? 'checkmark-circle' : 'copy-outline'}
                    size={13}
                    color={copiedMessage ? '#10B981' : '#8A6D3B'}
                  />
                  <Text style={[styles.copyMessageActionText, copiedMessage && { color: '#10B981' }]}>
                    {copiedMessage ? 'Metin Kopyalandı' : 'Metni Kopyala'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.previewText}>{shareMessage}</Text>
            </View>

            {/* Secondary Native Device Share Button */}
            <TouchableOpacity
              style={styles.nativeShareBtn}
              onPress={handleNativeShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={18} color="#1A1817" />
              <Text style={styles.nativeShareBtnText}>Diğer Uygulamalar ile Paylaş</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1817',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8A6D3B',
    fontWeight: '600',
    marginTop: 2,
    marginLeft: 40,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 8,
  },
  whatsAppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  whatsAppIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsAppHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  whatsAppTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  recommendedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  whatsAppSub: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
  },
  linkCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    gap: 8,
  },
  linkLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  pinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  copyBtnTextSuccess: {
    color: '#FFF',
  },
  previewBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyMessageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  copyMessageActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  previewText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
  },
  nativeShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 14,
  },
  nativeShareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
});
