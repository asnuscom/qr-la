import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuestbookEntryModel } from '@/types';
import { eventService } from '@/services/eventService';

interface GuestbookListProps {
  slug: string;
  entries: GuestbookEntryModel[];
  onEntryAdded: () => void;
}

export const GuestbookList: React.FC<GuestbookListProps> = ({
  slug,
  entries,
  onEntryAdded,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [relationship, setRelationship] = useState('Dost & Misafir');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relationships = [
    'Dost & Misafir',
    'Gelin Tarafı',
    'Damat Tarafı',
    'Lise / Üni Arkadaşı',
    'İş Arkadaşı',
    'Kuzen & Aile',
  ];

  const handleSubmit = async () => {
    if (!authorName.trim() || !message.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen isminizi ve tebrik mesajınızı yazın.');
      return;
    }

    setIsSubmitting(true);
    try {
      await eventService.addGuestbookEntry(slug, {
        eventSlug: slug,
        authorName: authorName.trim(),
        tableNumber: tableNumber.trim() || undefined,
        relationship,
        message: message.trim(),
      });

      setIsSubmitting(false);
      setIsModalOpen(false);
      setAuthorName('');
      setTableNumber('');
      setMessage('');
      onEntryAdded();
      Alert.alert('Teşekkürler! ❤️', 'Tebrik mesajınız anı defterine eklendi.');
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      Alert.alert('Hata', 'Mesajınız gönderilemedi.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header and Add Button */}
      <View style={styles.topSection}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="book" size={22} color="#C5A059" />
            <Text style={styles.title}>Ziyaretçi Anı Defteri</Text>
          </View>
          <Text style={styles.subtitle}>
            Çiftimize en içten dileklerini ve hatıralarını yaz.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color="#FFF" />
          <Text style={styles.writeButtonText}>Not Bırak</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <View style={styles.list}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {entry.authorName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{entry.authorName}</Text>
                <View style={styles.tagGroup}>
                  {entry.relationship && (
                    <View style={styles.relBadge}>
                      <Text style={styles.relText}>{entry.relationship}</Text>
                    </View>
                  )}
                  {entry.tableNumber && (
                    <View style={styles.tableBadge}>
                      <Ionicons name="restaurant-outline" size={10} color="#6B7280" />
                      <Text style={styles.tableBadgeText}>{entry.tableNumber}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.messageText}>"{entry.message}"</Text>

            <View style={styles.entryFooter}>
              <Text style={styles.dateText}>
                {new Date(entry.createdAt).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.heartRow}>
                <Ionicons name="heart" size={14} color="#FF3366" />
                <Text style={styles.heartCount}>{entry.likes || 1}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Leave Note Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tebrik Notu Bırak 💌</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Şule & Samet çifti bu notları ömür boyu saklayacak.
            </Text>

            {/* Author Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adınız & Soyadınız</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Ayşenur Çelik"
                placeholderTextColor="#9CA3AF"
                value={authorName}
                onChangeText={setAuthorName}
              />
            </View>

            {/* Table Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Masa Numaranız (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Masa 5 veya Damat Arkadaşları"
                placeholderTextColor="#9CA3AF"
                value={tableNumber}
                onChangeText={setTableNumber}
              />
            </View>

            {/* Relationship Chips */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Yakınlık Dereceniz</Text>
              <View style={styles.relationshipChips}>
                {relationships.map((rel) => {
                  const isSelected = relationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      style={[styles.relChip, isSelected && styles.relChipActive]}
                      onPress={() => setRelationship(rel)}
                    >
                      <Text style={[styles.relChipText, isSelected && styles.relChipTextActive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tebrik & İyi Dilek Mesajınız</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Kalbinizden geçen en güzel dilekleri buraya yazın..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.sendButton, isSubmitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.sendButtonText}>
                {isSubmitting ? 'Kaydediliyor...' : 'Deftere Yaz & Gönder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  writeButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAD7BB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relBadge: {
    backgroundColor: '#FAF7F2',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  relText: {
    fontSize: 11,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  tableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  tableBadgeText: {
    fontSize: 11,
    color: '#4B5563',
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  heartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3366',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  relationshipChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  relChipActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  relChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  relChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  sendButton: {
    backgroundColor: '#C5A059',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
