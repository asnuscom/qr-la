import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StorageInfo } from '@/types';
import { formatBytes } from '@/services/compression';

interface StorageMeterProps {
  storage: StorageInfo;
  onUpgradePress?: () => void;
}

export const StorageMeter: React.FC<StorageMeterProps> = ({ storage, onUpgradePress }) => {
  const router = useRouter();
  const percentage = Math.min(100, Math.round((storage.usedBytes / storage.quotaBytes) * 100));

  const isNearLimit = percentage >= 80;
  const isFull = percentage >= 95;

  const barColor = isFull ? '#EF4444' : isNearLimit ? '#F59E0B' : '#10B981';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>Depolama Durumu</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>
              {storage.tier === 'free' ? 'Ücretsiz Paket (500 MB)' : `${storage.tier.toUpperCase()} PAKET`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={onUpgradePress || (() => router.push('/panel/tarifeler' as any))}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={14} color="#FFF" />
          <Text style={styles.upgradeBtnText}>Yükselt</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>

      {/* Info Row */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          <Text style={{ fontWeight: '700', color: '#1A1817' }}>{formatBytes(storage.usedBytes)}</Text> kullanıldı ({percentage}%)
        </Text>
        <Text style={styles.statsText}>
          Toplam Kota: <Text style={{ fontWeight: '700', color: '#1A1817' }}>{formatBytes(storage.quotaBytes)}</Text>
        </Text>
      </View>

      {/* Sub stats */}
      <View style={styles.footerRow}>
        <View style={styles.badgeItem}>
          <Ionicons name="camera-outline" size={14} color="#C5A059" />
          <Text style={styles.badgeItemText}>{storage.photoCount} Fotoğraf</Text>
        </View>
        <View style={styles.badgeItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.badgeItemText}>
            Son Tarih: {new Date(storage.expiresAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleCol: {},
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  tierBadge: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  upgradeBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeItemText: {
    fontSize: 12,
    color: '#4B5563',
  },
});
