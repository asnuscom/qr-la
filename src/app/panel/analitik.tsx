import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { ecosystemService, ScanAnalyticsData } from '@/services/ecosystemService';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [currentUser] = useState(authService.getState().user);
  const [analytics, setAnalytics] = useState<ScanAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Dinamik QR Analitiği & Tarama İstatistikleri | QR-la';
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await ecosystemService.getScanAnalytics(
          currentUser?.uid || 'demo-host-yavuz'
        );
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser?.uid]);

  if (isLoading || !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Analitik verileri hesaplanıyor...</Text>
      </View>
    );
  }

  const maxDaily = Math.max(...analytics.dailyTrends.map((d) => d.count), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/panel' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : colors.text} />
          <Text style={styles.backBtnText}>Panele Dön</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <ThemeToggleBtn size="sm" />
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/panel' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="apps-outline" size={17} color="#C5A059" />
            <Text style={[styles.headerBtnText, { color: '#C5A059' }]}>Varlıklarım</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/panel/magaza' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={17} color="#10B981" />
            <Text style={[styles.headerBtnText, { color: '#10B981' }]}>Baskı Mağazası</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Title */}
        <View style={styles.titleWrap}>
          <View style={styles.titleIconBadge}>
            <Ionicons name="bar-chart" size={26} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Dinamik QR Analitiği</Text>
            <Text style={styles.pageSubtitle}>
              Karekodlarınızın ne zaman, hangi cihazlardan ve kaç kez tarandığını anlık olarak takip edin.
            </Text>
          </View>
        </View>

        {/* 4 KPI Metric Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>TOPLAM TARAMA</Text>
              <View style={styles.kpiBadgeGreen}>
                <Ionicons name="trending-up" size={12} color="#10B981" />
                <Text style={styles.kpiBadgeGreenText}>+28%</Text>
              </View>
            </View>
            <Text style={styles.kpiVal}>{analytics.totalScans.toLocaleString()}</Text>
            <Text style={styles.kpiSub}>Tüm aktif QR kodlarınızda</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>BENZERSİZ KİŞİ</Text>
              <Ionicons name="people-outline" size={16} color="#38BDF8" />
            </View>
            <Text style={[styles.kpiVal, { color: '#38BDF8' }]}>
              {analytics.uniqueScans.toLocaleString()}
            </Text>
            <Text style={styles.kpiSub}>Tekil cihaz etkileşimi</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>BUGÜNÜN TARAMALARI</Text>
              <Ionicons name="today-outline" size={16} color="#FBBF24" />
            </View>
            <Text style={[styles.kpiVal, { color: '#FBBF24' }]}>
              {analytics.todayScans.toLocaleString()}
            </Text>
            <Text style={styles.kpiSub}>Son 24 saat içinde</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiLabel}>EN ÇOK ETKİLEŞİM</Text>
              <Ionicons name="restaurant-outline" size={16} color="#D97706" />
            </View>
            <Text style={[styles.kpiVal, { color: '#D97706', fontSize: 20 }]} numberOfLines={1}>
              Lucca Bistrot
            </Text>
            <Text style={styles.kpiSub}>780 tarama ile lider</Text>
          </View>
        </View>

        {/* 7-Day Trend Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Haftalık Tarama Trendi (Son 7 Gün)</Text>
              <Text style={styles.cardSub}>Günlük taranma yoğunluğu</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.chartLegendDot} />
              <Text style={styles.chartLegendText}>Tarama Sayısı</Text>
            </View>
          </View>

          <View style={styles.barChartContainer}>
            {analytics.dailyTrends.map((d, idx) => {
              const heightPercent = Math.round((d.count / maxDaily) * 100);

              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barValText}>{d.count}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(heightPercent, 12)}%`,
                          backgroundColor:
                            idx >= 4 ? '#D97706' : 'rgba(217, 119, 6, 0.45)',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barDayText}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2-Column: Modül Dağılımı & Cihaz Dağılımı */}
        <View style={styles.grid2Col}>
          {/* Modül Dağılımı */}
          <View style={[styles.card, { flex: 1, minWidth: 300 }]}>
            <Text style={styles.cardTitle}>Modül Bazlı Dağılım</Text>
            <Text style={[styles.cardSub, { marginBottom: 16 }]}>Hangi QR çözümünüz ne kadar ilgi görüyor?</Text>

            <View style={styles.breakdownList}>
              {analytics.moduleBreakdown.map((m) => (
                <View key={m.moduleType} style={styles.breakdownItem}>
                  <View style={styles.breakdownHeaderRow}>
                    <View style={styles.breakdownDotLabelRow}>
                      <View style={[styles.breakdownDot, { backgroundColor: m.color }]} />
                      <Text style={styles.breakdownLabel}>{m.label}</Text>
                    </View>
                    <Text style={styles.breakdownCount}>
                      {m.count} ({m.percent}%)
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.max(m.percent, 4)}%`, backgroundColor: m.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Cihaz Dağılımı */}
          <View style={[styles.card, { flex: 1, minWidth: 300 }]}>
            <Text style={styles.cardTitle}>Cihaz & Kamera Dağılımı</Text>
            <Text style={[styles.cardSub, { marginBottom: 16 }]}>Ziyaretçilerinizin kullandığı işletim sistemleri</Text>

            <View style={styles.breakdownList}>
              {analytics.deviceBreakdown.map((dev, idx) => (
                <View key={idx} style={styles.breakdownItem}>
                  <View style={styles.breakdownHeaderRow}>
                    <View style={styles.breakdownDotLabelRow}>
                      <Ionicons
                        name={
                          dev.device.includes('Apple')
                            ? 'logo-apple'
                            : dev.device.includes('Android')
                            ? 'logo-android'
                            : 'globe-outline'
                        }
                        size={15}
                        color={dev.color}
                      />
                      <Text style={styles.breakdownLabel}>{dev.device}</Text>
                    </View>
                    <Text style={[styles.breakdownCount, { color: dev.color }]}>
                      %{dev.percent}
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${dev.percent}%`, backgroundColor: dev.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.qrInsightBox}>
              <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
              <Text style={styles.qrInsightText}>
                Taramaların %96'sı akıllı telefon kamerasından anında açılıyor. Uygulama indirtmeme stratejimiz dönüşüm oranını 4.8 kat artırıyor.
              </Text>
            </View>
          </View>
        </View>

        {/* Live Activity Stream (Son Taranan QR Akışı) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View>
              <Text style={styles.cardTitle}>Canlı Tarama Akışı</Text>
              <Text style={styles.cardSub}>Karekodlarınızın son okutulma hareketleri</Text>
            </View>
            <View style={styles.livePulseBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.livePulseText}>Canlı</Text>
            </View>
          </View>

          <View style={styles.activityList}>
            {analytics.recentScans.map((scan) => (
              <View key={scan.id} style={styles.activityRow}>
                <View style={styles.activityIconCircle}>
                  <Ionicons
                    name={
                      scan.moduleType === 'menu'
                        ? 'restaurant'
                        : scan.moduleType === 'pet'
                        ? 'paw'
                        : scan.moduleType === 'vcard'
                        ? 'card'
                        : scan.moduleType === 'vehicle'
                        ? 'car-sport'
                        : 'heart'
                    }
                    size={16}
                    color="#D97706"
                  />
                </View>

                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{scan.assetTitle}</Text>
                  <Text style={styles.activityMeta}>
                    📍 {scan.location} • 📱 {scan.device}
                  </Text>
                </View>

                <Text style={styles.activityTime}>{scan.timeAgo}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.bg,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      color: '#D97706',
      fontSize: 14,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? '#10121A' : '#FFFFFF',
      flexWrap: 'wrap',
      gap: 10,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backBtnText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    scrollContainer: {
      padding: 20,
      maxWidth: 960,
      alignSelf: 'center',
      width: '100%',
      paddingBottom: 60,
    },
    titleWrap: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    titleIconBadge: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(217, 119, 6, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(217, 119, 6, 0.3)',
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 4,
    },
    pageSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginBottom: 20,
    },
    kpiCard: {
      flex: 1,
      minWidth: 180,
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    kpiHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    kpiLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    kpiBadgeGreen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 8,
    },
    kpiBadgeGreenText: {
      color: '#10B981',
      fontSize: 10,
      fontWeight: '800',
    },
    kpiVal: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      marginBottom: 4,
    },
    kpiSub: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    card: {
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 20,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    cardHeaderBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 2,
    },
    cardSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    chartLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    chartLegendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#D97706',
    },
    chartLegendText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    barChartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 180,
      paddingTop: 20,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    barValText: {
      color: '#FBBF24',
      fontSize: 10,
      fontWeight: '700',
      marginBottom: 6,
    },
    barTrack: {
      width: 24,
      height: 120,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderRadius: 8,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    barFill: {
      width: '100%',
      borderRadius: 8,
    },
    barDayText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      marginTop: 8,
    },
    grid2Col: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    breakdownList: {
      gap: 14,
    },
    breakdownItem: {
      gap: 6,
    },
    breakdownHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    breakdownDotLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    breakdownDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    breakdownLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    breakdownCount: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    progressBarTrack: {
      width: '100%',
      height: 6,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    qrInsightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderRadius: 14,
      padding: 12,
      marginTop: 18,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    qrInsightText: {
      flex: 1,
      color: isDark ? '#FCD34D' : '#92400E',
      fontSize: 11,
      lineHeight: 16,
    },
    livePulseBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    livePulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#EF4444',
    },
    livePulseText: {
      color: '#EF4444',
      fontSize: 11,
      fontWeight: '800',
    },
    activityList: {
      gap: 12,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderRadius: 14,
      padding: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(217, 119, 6, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityDetails: {
      flex: 1,
    },
    activityTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    activityMeta: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    activityTime: {
      color: '#FBBF24',
      fontSize: 11,
      fontWeight: '600',
    },
  });
}
