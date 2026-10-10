import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function MarketingFooter() {
  const router = useRouter();
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.footerContainer,
        {
          backgroundColor: isDark ? '#07090E' : '#F3EFE6',
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.footerInner}>
        {/* Kolon 1: Marka & Açıklama */}
        <View style={styles.colBrand}>
          <View style={styles.brandRow}>
            <View style={[styles.logoBadge, { backgroundColor: colors.goldBg }]}>
              <Ionicons name="qr-code" size={18} color={colors.gold} />
            </View>
            <Text style={[styles.brandText, { color: colors.text }]}>
              QR<Text style={{ color: colors.gold }}>-la</Text>
            </Text>
          </View>
          <Text style={[styles.brandDesc, { color: colors.textSecondary }]}>
            Uygulama indirtmeden, tek bir dinamik QR kodla; anıları toplayın, araç camında numaranızı
            gizleyin, dijital kartvizitinizi rehbere kaydedin ve masadan menüyü açın.
          </Text>
          <View style={styles.trustBadges}>
            <View
              style={[
                styles.trustPill,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={13} color="#10B981" />
              <Text style={[styles.trustPillText, { color: colors.textSecondary }]}>
                256-Bit SSL & KVKK
              </Text>
            </View>
            <View
              style={[
                styles.trustPill,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="flash" size={13} color={colors.gold} />
              <Text style={[styles.trustPillText, { color: colors.textSecondary }]}>
                Işık Hızında Yönlendirme
              </Text>
            </View>
          </View>
        </View>

        {/* Kolon 2: Modüller */}
        <View style={styles.colLinks}>
          <Text style={[styles.colTitle, { color: colors.text }]}>QR-la Modülleri</Text>
          <TouchableOpacity onPress={() => router.push('/dugun' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>💍 Düğün & Etkinlik Fotoğraf</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/otomobil' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>🚗 Araç & Motosiklet Park Tagı</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/pati' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>🐾 Petguru Pati Künyesi & Kayıp</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/kartvizit' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>💼 Dijital Kartvizit & NFC</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/menu' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>🍽️ Restoran Menü & Garson Çağır</Text>
          </TouchableOpacity>
        </View>

        {/* Kolon 3: Araçlar & Hizmetler */}
        <View style={styles.colLinks}>
          <Text style={[styles.colTitle, { color: colors.text }]}>Platform Araçları</Text>
          <TouchableOpacity onPress={() => router.push('/panel/qr-studio' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>✨ QR Kod Tasarım Stüdyosu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/panel/tarifeler' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>💳 Fiyat Paketleri & Tarifeler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/panel/magaza' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>📦 Baskı & Matbaa Mağazası</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/panel/analitik' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>📊 Dinamik QR Analitiği</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/panel' as any)} style={styles.linkItem}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>🎛️ Merkezi Yönetim Paneli</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alt Çizgi & Telif */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
        <Text style={[styles.copyText, { color: colors.textMuted }]}>
          © 2026 QR-la Platformu • Asnus Teknoloji A.Ş. • Tüm hakları saklıdır.
        </Text>
        <Text style={[styles.subText, { color: colors.textMuted }]}>
          Fiziksel dünyayı dijital mikro-web deneyimlerine bağlayan All-in-One QR Ekosistemi.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    borderTopWidth: 1,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 36,
    justifyContent: 'space-between',
  },
  colBrand: {
    flex: 1.5,
    minWidth: 260,
    gap: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
  },
  brandDesc: {
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 380,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  trustPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  colLinks: {
    flex: 1,
    minWidth: 200,
    gap: 12,
  },
  colTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkItem: {
    paddingVertical: 3,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  subText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
