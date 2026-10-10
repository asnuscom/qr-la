import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { vcardService } from '@/services/vcardService';
import { VCardData } from '@/types';
import { VCardDisplay } from '@/modules/vcard/VCardDisplay';

export default function VCardRouteScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [card, setCard] = useState<VCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await vcardService.getCardBySlug(slug);
        setCard(data);
      } catch (err) {
        console.error('Error fetching vCard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCard();
  }, [slug]);

  useEffect(() => {
    if (card?.fullName && Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = `${card.fullName} - ${card.jobTitle} | Dijital Kartvizit (vCard & NFC)`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        `${card.fullName} (${card.jobTitle} - ${card.company}) dijital kartviziti. Tek tıkla rehbere kaydedin veya iletişime geçin.`
      );
    }
  }, [card?.fullName, card?.jobTitle, card?.company]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>Dijital kartvizit yükleniyor...</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.notFoundSafeArea}>
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIconCircle}>
            <Ionicons name="card-outline" size={48} color="#C5A059" />
          </View>
          <Text style={styles.notFoundTitle}>Kartvizit Bulunamadı</Text>
          <Text style={styles.notFoundDesc}>
            Aradığınız kartvizit bağlantısı (<Text style={{ fontWeight: '700' }}>{slug}</Text>) henüz oluşturulmamış veya silinmiş olabilir.
          </Text>
          <TouchableOpacity
            style={styles.notFoundBtn}
            onPress={() => router.push('/')}
            activeOpacity={0.85}
          >
            <Ionicons name="home-outline" size={18} color="#FFF" />
            <Text style={styles.notFoundBtnText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <VCardDisplay card={card} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#C5A059',
    fontSize: 14,
    fontWeight: '600',
  },
  notFoundSafeArea: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundCard: {
    backgroundColor: 'rgba(20, 23, 31, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    padding: 32,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
  },
  notFoundIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  notFoundDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  notFoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C5A059',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  notFoundBtnText: {
    color: '#0A0B0E',
    fontSize: 14,
    fontWeight: '800',
  },
});
