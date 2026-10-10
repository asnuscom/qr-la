import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { ecosystemService, EcosystemAsset } from '@/services/ecosystemService';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export default function EcosystemAssetsScreen() {
  const router = useRouter();
  const [currentUser] = useState(authService.getState().user);
  const [assets, setAssets] = useState<EcosystemAsset[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Tüm QR Varlıklarım & Ekosistem Hub | QR-la';
    }
  }, []);

  useEffect(() => {
    async function loadAssets() {
      setIsLoading(true);
      try {
        const data = await ecosystemService.getAllUserAssets(
          currentUser?.uid || 'demo-host-yavuz'
        );
        setAssets(data);
      } catch (err) {
        console.error('Error loading ecosystem assets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssets();
  }, [currentUser?.uid]);

  const copyLink = (liveUrl: string, assetId: string) => {
    const fullUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}${liveUrl}`
        : `https://qr-la.com${liveUrl}`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
    }
    setCopiedId(assetId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredAssets = assets.filter((a) => {
    if (selectedFilter === 'all') return true;
    return a.moduleType === selectedFilter;
  });

  const totalScans = assets.reduce((acc, a) => acc + (a.viewCount || 0), 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={styles.loadingText}>QR Varlıklarınız yükleniyor...</Text>
      </View>
    );
  }

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
            onPress={() => router.push('/panel/analitik' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="bar-chart-outline" size={17} color="#D97706" />
            <Text style={[styles.headerBtnText, { color: '#D97706' }]}>Analitik</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/panel/magaza' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={17} color="#10B981" />
            <Text style={[styles.headerBtnText, { color: '#10B981' }]}>Baskı Mağazası</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerBtn, { borderColor: '#D4AF37' }]}
            onPress={() => router.push('/panel/qr-studio' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles-outline" size={17} color="#D4AF37" />
            <Text style={[styles.headerBtnText, { color: '#D4AF37' }]}>QR Stüdyo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Yeni QR Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Title & Hub Overview */}
        <View style={styles.titleWrap}>
          <View style={styles.titleIconCircle}>
            <Ionicons name="apps" size={28} color="#C5A059" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Tüm QR Varlıklarım</Text>
            <Text style={styles.pageSubtitle}>
              Tek hesap üzerinden yönettiğiniz düğün albümleri, araç stickerları, pati künyeleri, kartvizitler ve restoran menüleri.
            </Text>
          </View>
        </View>

        {/* Overview Stats Bar */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{assets.length}</Text>
            <Text style={styles.statLabel}>Aktif Varlık</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{totalScans.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Toplam Tarama</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#10B981' }]}>%100</Text>
            <Text style={styles.statLabel}>Çalışma Durumu</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: 'all', label: `Tümü (${assets.length})` },
            { id: 'event', label: '💍 Düğün & Etkinlik' },
            { id: 'vehicle', label: '🚗 Araç & Park Tagı' },
            { id: 'pet', label: '🐾 Petguru Pati' },
            { id: 'vcard', label: '💼 Dijital Kartvizit' },
            { id: 'menu', label: '🍽️ Restoran Menü' },
          ].map((f) => {
            const isSel = selectedFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, isSel && styles.filterPillActive]}
                onPress={() => setSelectedFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSel && styles.filterPillTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Asset Cards List */}
        <View style={styles.assetCardsList}>
          {filteredAssets.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="qr-code-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyTitle}>Bu modülde henüz bir varlığınız yok.</Text>
              <TouchableOpacity
                style={styles.emptyCreateBtn}
                onPress={() => setCreateModalVisible(true)}
              >
                <Text style={styles.emptyCreateBtnText}>Hemen Oluştur</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredAssets.map((asset) => {
              const isCopied = copiedId === asset.id;

              return (
                <View key={asset.id} style={styles.assetCard}>
                  <View style={styles.assetCardTop}>
                    {/* Icon Circle */}
                    <View
                      style={[
                        styles.assetIconCircle,
                        { backgroundColor: `${asset.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={asset.icon as any}
                        size={22}
                        color={asset.color}
                      />
                    </View>

                    <View style={styles.assetInfoCol}>
                      <View style={styles.assetTitleRow}>
                        <Text style={styles.assetTitle}>{asset.title}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            asset.status === 'warning'
                              ? { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' }
                              : { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: asset.status === 'warning' ? '#EF4444' : '#10B981' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: asset.status === 'warning' ? '#EF4444' : '#10B981' },
                            ]}
                          >
                            {asset.statusLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.assetSubtitle}>{asset.subtitle}</Text>

                      {/* Slug & Copy Link */}
                      <View style={styles.slugRow}>
                        <View style={styles.slugBadge}>
                          <Text style={styles.slugPrefix}>qr-la.com/</Text>
                          <Text style={styles.slugMain}>{asset.slug}</Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.copyLinkBtn,
                            isCopied && { backgroundColor: '#10B981' },
                          ]}
                          onPress={() => copyLink(asset.liveUrl, asset.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isCopied ? 'checkmark' : 'copy-outline'}
                            size={14}
                            color={isCopied ? '#FFFFFF' : '#9CA3AF'}
                          />
                          <Text
                            style={[
                              styles.copyLinkBtnText,
                              isCopied && { color: '#FFFFFF' },
                            ]}
                          >
                            {isCopied ? 'Kopyalandı' : 'Kopyala'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Footer & Actions */}
                  <View style={styles.assetCardBottom}>
                    <View style={styles.scanCountBadge}>
                      <Ionicons name="eye-outline" size={14} color="#F59E0B" />
                      <Text style={styles.scanCountText}>
                        {asset.viewCount} Kez Okutuldu
                      </Text>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnLive}
                        onPress={() => router.push(asset.liveUrl as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="open-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.actionBtnLiveText}>Canlı Gör</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnEdit}
                        onPress={() => router.push(asset.editRoute as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="pencil" size={14} color="#D1D5DB" />
                        <Text style={styles.actionBtnEditText}>Yönet</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnShop}
                        onPress={() => router.push('/panel/magaza' as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cube-outline" size={14} color="#10B981" />
                        <Text style={styles.actionBtnShopText}>Baskı Al</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtnEdit, { borderColor: '#D4AF37' }]}
                        onPress={() =>
                          router.push({
                            pathname: '/panel/qr-studio',
                            params: { url: asset.liveUrl, title: asset.title, moduleType: asset.moduleType },
                          } as any)
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="sparkles" size={13} color="#D4AF37" />
                        <Text style={[styles.actionBtnEditText, { color: '#D4AF37' }]}>Stüdyo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* New Asset Selector Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="add-circle" size={24} color="#C5A059" />
                <Text style={styles.modalTitle}>Yeni QR Varlık Oluştur</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Oluşturmak istediğiniz QR çözümünü seçin, panelinizdeki ekosisteme anında eklensin:
            </Text>

            <View style={styles.moduleOptionsList}>
              <TouchableOpacity
                style={styles.moduleOptionCard}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/duzenle' as any);
                }}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                  <Ionicons name="heart" size={22} color="#C5A059" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>💍 Düğün & Etkinlik Albümü</Text>
                  <Text style={styles.optionDesc}>Masalardan misafir fotoğrafları, canlı projeksiyon & anı defteri.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleOptionCard}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/arac' as any);
                }}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Ionicons name="car-sport" size={22} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>🚗 Araç Camı / Park Tagı</Text>
                  <Text style={styles.optionDesc}>Numara gizleme, kaza kan grubu rozeti & WhatsApp hızlı park bildirimleri.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleOptionCard}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/pati' as any);
                }}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="paw" size={22} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>🐾 Petguru Pati Künyesi</Text>
                  <Text style={styles.optionDesc}>Tasma künyesi, taranınca GPS konum uyarısı & acil kayıp alarmı.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleOptionCard}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/kartvizit' as any);
                }}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="card" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>💼 Dijital Kartvizit (vCard & NFC)</Text>
                  <Text style={styles.optionDesc}>1 tıkla rehbere kaydet, portfolyo, IBAN ve sosyal bağlantılar.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moduleOptionCard}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/menu' as any);
                }}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                  <Ionicons name="restaurant" size={22} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>🍽️ Restoran Menü QR</Text>
                  <Text style={styles.optionDesc}>Masa standları, fotoğraflı menü, Wi-Fi kopyalama & garson çağırma.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      color: colors.gold,
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
      flexWrap: 'wrap',
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
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.gold,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    createBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
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
    titleIconCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.15)' : 'rgba(197, 160, 89, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
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
    statsStrip: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    statBox: {
      alignItems: 'center',
    },
    statVal: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 2,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    filterScroll: {
      gap: 8,
      paddingBottom: 16,
    },
    filterPill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? 'rgba(197, 160, 89, 0.15)' : '#FAF7F2',
    },
    filterPillText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    filterPillTextActive: {
      color: colors.gold,
      fontWeight: '800',
    },
    assetCardsList: {
      gap: 14,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 48,
      gap: 10,
    },
    emptyTitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    emptyCreateBtn: {
      backgroundColor: colors.gold,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
    },
    emptyCreateBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    assetCard: {
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    assetCardTop: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'flex-start',
    },
    assetIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    assetInfoCol: {
      flex: 1,
    },
    assetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
      flexWrap: 'wrap',
      gap: 8,
    },
    assetTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 10,
      borderWidth: 1,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    assetSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 8,
    },
    slugRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    slugBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    slugPrefix: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    slugMain: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '700',
    },
    copyLinkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
    },
    copyLinkBtnText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
    },
    assetCardBottom: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
    },
    scanCountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    scanCountText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionBtnLive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: isDark ? '#1E2230' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    actionBtnLiveText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    actionBtnEdit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    actionBtnEditText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    actionBtnShop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    actionBtnShopText: {
      color: '#10B981',
      fontSize: 12,
      fontWeight: '700',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalCard: {
      width: '100%',
      maxWidth: 540,
      backgroundColor: isDark ? '#141622' : '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
    },
    modalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    modalSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 18,
    },
    moduleOptionsList: {
      gap: 10,
    },
    moduleOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: isDark ? '#1B1E2E' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
      marginBottom: 2,
    },
    optionDesc: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
  });
}
