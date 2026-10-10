import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { petService } from '@/services/petService';
import { PetData } from '@/types';
import { PetTagDisplay } from '@/modules/pet/PetTagDisplay';

export default function PetTagRouteScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: 'normal' | 'lost' }>();
  const router = useRouter();
  const [pet, setPet] = useState<PetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPet() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await petService.getPetBySlug(id);
        setPet(data);
      } catch (err) {
        console.error('Error fetching pet:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPet();
  }, [id]);

  useEffect(() => {
    if (pet?.name && Platform.OS === 'web' && typeof document !== 'undefined') {
      const isLost = pet.lostInfo?.isLost || mode === 'lost';
      document.title = isLost
        ? `🚨 KAYIP ALARMI: ${pet.name} (${pet.breed}) | Petguru x QR-la`
        : `${pet.name} - ${pet.breed} | Petguru Akıllı Tasma Künyesi`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        isLost
          ? `🚨 ACİL: ${pet.name} isimli ${pet.breed} kayıptır. Görenlerin hemen aramasını rica ederiz.`
          : `${pet.name} isimli evcil hayvanımızın Petguru akıllı paslanmaz çelik tasma künyesi ve dijital sağlık kartı.`
      );
    }
  }, [pet?.name, pet?.breed, pet?.lostInfo?.isLost, mode]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Pati künyesi yükleniyor...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.notFoundSafeArea}>
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIconCircle}>
            <Ionicons name="paw-outline" size={48} color="#10B981" />
          </View>
          <Text style={styles.notFoundTitle}>Pati Künyesi Bulunamadı</Text>
          <Text style={styles.notFoundDesc}>
            Aradığınız künye kodu (<Text style={{ fontWeight: '700' }}>{id}</Text>) henüz kaydedilmemiş veya silinmiş olabilir.
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

  return <PetTagDisplay pet={pet} initialMode={mode} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#03120B',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6EE7B7',
    fontSize: 14,
    fontWeight: '600',
  },
  notFoundSafeArea: {
    flex: 1,
    backgroundColor: '#03120B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundCard: {
    backgroundColor: 'rgba(6, 40, 26, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 32,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
  },
  notFoundIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  notFoundBtnText: {
    color: '#03120B',
    fontSize: 14,
    fontWeight: '800',
  },
});
