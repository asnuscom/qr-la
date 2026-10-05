import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PLAN_TIERS } from '@/services/mockData';

export default function PricingUpgradeScreen() {
  const router = useRouter();

  const handleSelectPlan = (name: string, price: number) => {
    Alert.alert(
      'Paket Seçildi',
      `${name} (${price} ₺) paketi seçildi. Güvenli ödeme adımına yönlendiriliyorsunuz.`,
      [{ text: 'Tamam', onPress: () => router.push('/panel' as any) }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1817" />
          </TouchableOpacity>
          <View style={styles.navTitleBox}>
            <Text style={styles.navTitle}>Depolama Paketleri</Text>
            <Text style={styles.navSub}>Kotanızı Yükseltin</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.headerTitle}>Düğün Anılarınız Asla Yarıda Kalmasın</Text>
          <Text style={styles.headerSubtitle}>
            Ücretsiz 500 MB kotanız dolmak üzereyse veya salonda canlı projeksiyon özelliğini açmak istiyorsanız uygun paketi seçin.
          </Text>

          <View style={styles.plansContainer}>
            {PLAN_TIERS.map((tier) => (
              <View
                key={tier.tier}
                style={[styles.planCard, tier.isPopular && styles.planCardPopular]}
              >
                {tier.isPopular && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>EN ÇOK TERCİH EDİLEN</Text>
                  </View>
                )}

                <Text style={styles.tierName}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    {tier.priceTL === 0 ? 'ÜCRETSİZ' : `${tier.priceTL} ₺`}
                  </Text>
                  {tier.priceTL > 0 && <Text style={styles.periodText}>/ tek seferlik</Text>}
                </View>

                <View style={styles.quotaBox}>
                  <Text style={styles.quotaText}>
                    📦 {tier.quotaMB >= 1024 ? `${tier.quotaMB / 1024} GB` : `${tier.quotaMB} MB`} Bulut Depolama
                  </Text>
                  <Text style={styles.retentionText}>⏳ {tier.retentionDays} Gün Arşiv Süresi</Text>
                </View>

                <View style={styles.features}>
                  {tier.features.map((feat, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.chooseBtn, tier.isPopular && styles.chooseBtnPopular]}
                  onPress={() => handleSelectPlan(tier.name, tier.priceTL)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chooseBtnText, tier.isPopular && styles.chooseBtnTextPopular]}>
                    {tier.priceTL === 0 ? 'Mevcut Paket' : 'Hemen Yükselt'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    paddingBottom: 40,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  navTitleBox: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  navSub: {
    fontSize: 11,
    color: '#8A6D3B',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 24,
    lineHeight: 18,
  },
  plansContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  planCardPopular: {
    borderColor: '#C5A059',
    borderWidth: 2,
    shadowColor: '#C5A059',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#C5A059',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tierName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#C5A059',
  },
  periodText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quotaBox: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 2,
  },
  quotaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
  retentionText: {
    fontSize: 11,
    color: '#6B7280',
  },
  features: {
    gap: 8,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  chooseBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  chooseBtnPopular: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  chooseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  chooseBtnTextPopular: {
    color: '#FFF',
  },
});
