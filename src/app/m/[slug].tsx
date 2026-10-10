import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { menuService } from '@/services/menuService';
import { RestaurantData } from '@/types';
import { MenuDisplay } from '@/modules/menu/MenuDisplay';

export default function RestaurantMenuRouteScreen() {
  const { slug, table, masa } = useLocalSearchParams<{
    slug: string;
    table?: string;
    masa?: string;
  }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tableNumber = (table || masa || '').trim();

  useEffect(() => {
    async function loadRestaurant() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await menuService.getRestaurantBySlug(slug);
        setRestaurant(data);
        if (data) {
          menuService.recordView(slug);
        }
      } catch (err) {
        console.error('Error fetching restaurant menu:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [slug]);

  useEffect(() => {
    if (restaurant?.name && Platform.OS === 'web' && typeof document !== 'undefined') {
      const masaSuffix = tableNumber ? ` (Masa ${tableNumber})` : '';
      document.title = `${restaurant.name}${masaSuffix} | Masadan Karekod Dijital Menü - QR-la`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        `${restaurant.name} (${restaurant.cuisine}) dijital karekod menüsü. Fiyatlar, alerjen bilgileri, Wi-Fi şifresi ve garson çağırma.`
      );
    }
  }, [restaurant?.name, restaurant?.cuisine, tableNumber]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Menü yükleniyor...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.notFoundSafeArea}>
        <View style={styles.notFoundCard}>
          <View style={styles.notFoundIconCircle}>
            <Ionicons name="restaurant-outline" size={48} color="#D97706" />
          </View>
          <Text style={styles.notFoundTitle}>Menü Bulunamadı</Text>
          <Text style={styles.notFoundDesc}>
            Aradığınız restoran menüsü (<Text style={{ fontWeight: '700' }}>{slug}</Text>) henüz oluşturulmamış veya silinmiş olabilir.
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

  return <MenuDisplay restaurant={restaurant} tableNumber={tableNumber} />;
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
    color: '#D97706',
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
    backgroundColor: 'rgba(20, 22, 31, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    padding: 32,
    alignItems: 'center',
    maxWidth: 420,
    width: '100%',
  },
  notFoundIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
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
    backgroundColor: '#D97706',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  notFoundBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
