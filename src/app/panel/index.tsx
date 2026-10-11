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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { ecosystemService, EcosystemAsset } from '@/services/ecosystemService';
import { notificationService } from '@/services/notificationService';
import NotificationCenterModal from '@/components/NotificationCenterModal';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export default function MasterDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWide = width >= 1100;

  const [currentUser, setCurrentUser] = useState(authService.getState().user);
  const [assets, setAssets] = useState<EcosystemAsset[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors, isMobile, isWide);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'QR-la Workspace | Ortak Yönetim Paneli';
    }
  }, []);

  useEffect(() => {
    async function loadAssets() {
      setIsLoading(true);
      try {
        const u = authService.getState().user;
        setCurrentUser(u);
        const data = await ecosystemService.getAllUserAssets(
          u?.uid || 'demo-host-yavuz'
        );
        setAssets(data);
      } catch (err) {
        console.error('Error loading ecosystem assets:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    setUnreadNotifCount(notificationService.getUnreadCount());
    const unsub = notificationService.subscribe((list) => {
      setUnreadNotifCount(list.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, []);

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

  const getModuleBadge = (type: EcosystemAsset['moduleType']) => {
    switch (type) {
      case 'event':
        return { label: 'Düğün & Etkinlik', icon: 'heart', color: '#C5A059' };
      case 'vehicle':
        return { label: 'Araç & Park Tagı', icon: 'car-sport', color: '#0284C7' };
      case 'pet':
        return { label: 'Pati Künyesi', icon: 'paw', color: '#10B981' };
      case 'vcard':
        return { label: 'Dijital Kartvizit', icon: 'card', color: '#F59E0B' };
      case 'menu':
        return { label: 'Restoran Menüsü', icon: 'restaurant', color: '#8B5CF6' };
      default:
        return { label: 'QR Kod', icon: 'qr-code', color: '#6B7280' };
    }
  };

  const filterOptions = [
    { id: 'all', label: 'Tüm Varlıklar', icon: 'apps-outline', count: assets.length },
    {
      id: 'event',
      label: 'Düğün & Etkinlik',
      icon: 'heart-outline',
      count: assets.filter((a) => a.moduleType === 'event').length,
    },
    {
      id: 'vehicle',
      label: 'Araç Park',
      icon: 'car-outline',
      count: assets.filter((a) => a.moduleType === 'vehicle').length,
    },
    {
      id: 'pet',
      label: 'Pati Künyesi',
      icon: 'paw-outline',
      count: assets.filter((a) => a.moduleType === 'pet').length,
    },
    {
      id: 'vcard',
      label: 'Kartvizit & NFC',
      icon: 'card-outline',
      count: assets.filter((a) => a.moduleType === 'vcard').length,
    },
    {
      id: 'menu',
      label: 'Menü & Cafe',
      icon: 'restaurant-outline',
      count: assets.filter((a) => a.moduleType === 'menu').length,
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#C5A059" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Ortak panel ve QR varlıklarınız yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      {/* 1. Global Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.navBg, borderBottomColor: colors.border }]}>
        <View style={styles.navLeft}>
          <TouchableOpacity
            style={styles.logoBtn}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.brandIconBox}>
              <Ionicons name="qr-code" size={20} color="#FFFFFF" />
            </View>
            <View>
              <View style={styles.logoRow}>
                <Text style={[styles.brandTitle, { color: colors.text }]}>QR-la</Text>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>WORKSPACE</Text>
                </View>
              </View>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Ortak Yönetim Paneli
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity
            style={[styles.headerToolBtn, styles.notifBellBtn, { borderColor: colors.border }]}
            onPress={() => setNotifModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={unreadNotifCount > 0 ? 'notifications' : 'notifications-outline'}
              size={17}
              color={unreadNotifCount > 0 ? '#C5A059' : colors.text}
            />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <ThemeToggleBtn size="sm" />

          {!isMobile && (
            <>
              <TouchableOpacity
                style={[styles.headerToolBtn, { borderColor: colors.border }]}
                onPress={() => router.push('/panel/analitik' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="bar-chart-outline" size={16} color="#D97706" />
                <Text style={[styles.headerToolText, { color: colors.text }]}>Analitik</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerToolBtn, { borderColor: colors.border }]}
                onPress={() => router.push('/panel/qr-studio' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles-outline" size={16} color="#C5A059" />
                <Text style={[styles.headerToolText, { color: colors.text }]}>QR Stüdyo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerToolBtn, { borderColor: colors.border }]}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="bag-handle-outline" size={16} color="#10B981" />
                <Text style={[styles.headerToolText, { color: colors.text }]}>Mağaza</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerToolBtn, { borderColor: colors.border }]}
                onPress={() => router.push('/panel/tarifeler' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#8B5CF6" />
                <Text style={[styles.headerToolText, { color: colors.text }]}>Tarifeler</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.primaryCreateBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.primaryCreateBtnText}>
              {isMobile ? 'Yeni QR' : '+ Yeni QR Varlık'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Hero Workspace Aggregator Banner */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.heroGlowAccent} />
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.heroTagRow}>
                <View style={styles.heroTagBadge}>
                  <Ionicons name="layers" size={12} color="#C5A059" />
                  <Text style={styles.heroTagText}>ÇOKLU MODÜL MERKEZİ</Text>
                </View>
                <View style={styles.heroLiveBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.heroLiveText}>Tüm Sistemler Çevrimiçi</Text>
                </View>
              </View>

              <Text style={[styles.heroHeading, { color: colors.text }]}>
                {currentUser?.displayName
                  ? `Hoş Geldiniz, ${currentUser.displayName}`
                  : 'QR-la Varlık & Etkinlik Hub'}
              </Text>
              <Text style={[styles.heroSubheading, { color: colors.textSecondary }]}>
                Farklı amaçlara yönelik tüm QR kodlarınızı tek bir ortak panelden yönetin.
                İlgili varlığın özel modül paneline giderek ayarları ve verileri doğrudan denetleyebilirsiniz.
              </Text>
            </View>

            {!isMobile && (
              <TouchableOpacity
                style={styles.heroCtaBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.heroCtaBtnText}>Yeni QR Ekle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats Grid */}
          <View style={[styles.heroStatsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(197, 160, 89, 0.12)' }]}>
                <Ionicons name="qr-code-outline" size={18} color="#C5A059" />
              </View>
              <View>
                <Text style={[styles.statNum, { color: colors.text }]}>{assets.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aktif QR Varlık</Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
                <Ionicons name="eye-outline" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={[styles.statNum, { color: colors.text }]}>
                  {totalScans.toLocaleString('tr-TR')}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Toplam Okutma</Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="flash-outline" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.statNum, { color: colors.text }]}>Dinamik</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sınırsız Yönlendirme</Text>
              </View>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Ionicons name="layers-outline" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.statNum, { color: colors.text }]}>Modüler</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Varlık Başına Tarife</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mobile Quick Bar for Suite Tools */}
        {isMobile && (
          <View style={styles.mobileToolsBar}>
            <TouchableOpacity
              style={[styles.mobileToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/analitik' as any)}
            >
              <Ionicons name="bar-chart-outline" size={18} color="#D97706" />
              <Text style={[styles.mobileToolText, { color: colors.text }]}>Analitik</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mobileToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/qr-studio' as any)}
            >
              <Ionicons name="sparkles-outline" size={18} color="#C5A059" />
              <Text style={[styles.mobileToolText, { color: colors.text }]}>Stüdyo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mobileToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/magaza' as any)}
            >
              <Ionicons name="bag-handle-outline" size={18} color="#10B981" />
              <Text style={[styles.mobileToolText, { color: colors.text }]}>Mağaza</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mobileToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/tarifeler' as any)}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#8B5CF6" />
              <Text style={[styles.mobileToolText, { color: colors.text }]}>Tarifeler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Filter Tabs (Pills) */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterOptions.map((opt) => {
              const isActive = selectedFilter === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive
                        ? isDark
                          ? '#C5A059'
                          : '#1A1817'
                        : colors.card,
                      borderColor: isActive
                        ? isDark
                          ? '#C5A059'
                          : '#1A1817'
                        : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedFilter(opt.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={14}
                    color={
                      isActive
                        ? isDark
                          ? '#1A1817'
                          : '#FFFFFF'
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive
                          ? isDark
                            ? '#1A1817'
                            : '#FFFFFF'
                          : colors.text,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <View
                    style={[
                      styles.filterBadge,
                      {
                        backgroundColor: isActive
                          ? isDark
                            ? 'rgba(26, 24, 23, 0.2)'
                            : 'rgba(255, 255, 255, 0.2)'
                          : colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        {
                          color: isActive
                            ? isDark
                              ? '#1A1817'
                              : '#FFFFFF'
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      {opt.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Active QR Asset Cards Grid */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              {selectedFilter === 'all'
                ? 'Tüm QR Varlıklarınız'
                : `${filterOptions.find((f) => f.id === selectedFilter)?.label} Varlıklarınız`}
            </Text>
            <Text style={[styles.sectionSubheading, { color: colors.textSecondary }]}>
              {filteredAssets.length} adet QR sistemi listeleniyor
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.inlineAddBtn, { borderColor: colors.border }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={16} color="#C5A059" />
            <Text style={[styles.inlineAddBtnText, { color: colors.text }]}>Yeni Varlık</Text>
          </TouchableOpacity>
        </View>

        {filteredAssets.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="qr-code-outline" size={36} color="#C5A059" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Bu kategoride henüz QR varlığınız bulunmuyor
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Birkaç adımda yeni bir QR oluşturun ve anında canlıya alın.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={styles.emptyCtaText}>Hemen Oluştur</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.assetsGrid}>
            {filteredAssets.map((asset) => {
              const badge = getModuleBadge(asset.moduleType);
              const isCopied = copiedId === asset.id;

              return (
                <View
                  key={asset.id}
                  style={[
                    styles.assetCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.cardIconCircle,
                          { backgroundColor: `${badge.color}15` },
                        ]}
                      >
                        <Ionicons name={badge.icon as any} size={20} color={badge.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.moduleBadgeLine}>
                          <Text style={[styles.moduleBadgeLabel, { color: badge.color }]}>
                            {badge.label.toUpperCase()}
                          </Text>
                          {asset.badge && (
                            <View style={[styles.attrBadge, { backgroundColor: colors.surface }]}>
                              <Text style={[styles.attrBadgeText, { color: colors.textSecondary }]}>
                                {asset.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[styles.cardTitle, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {asset.title}
                        </Text>
                        <Text
                          style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {asset.subtitle}
                        </Text>
                      </View>
                    </View>

                    {/* Status Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor:
                            asset.status === 'warning'
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(16, 185, 129, 0.12)',
                          borderColor:
                            asset.status === 'warning'
                              ? 'rgba(239, 68, 68, 0.3)'
                              : 'rgba(16, 185, 129, 0.3)',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              asset.status === 'warning' ? '#EF4444' : '#10B981',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              asset.status === 'warning' ? '#EF4444' : '#10B981',
                          },
                        ]}
                      >
                        {asset.statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Card Mid: URL & Stats */}
                  <View
                    style={[
                      styles.cardMidRow,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.urlBox}>
                      <Ionicons name="link-outline" size={14} color={colors.textSecondary} />
                      <Text
                        style={[styles.urlText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        qr-la.com{asset.liveUrl}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.copyBtn,
                        isCopied && { backgroundColor: '#10B981', borderColor: '#10B981' },
                      ]}
                      onPress={() => copyLink(asset.liveUrl, asset.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isCopied ? 'checkmark' : 'copy-outline'}
                        size={12}
                        color={isCopied ? '#FFFFFF' : colors.text}
                      />
                      <Text
                        style={[
                          styles.copyBtnText,
                          { color: isCopied ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {isCopied ? 'Kopyalandı' : 'Kopyala'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Card Stats Bar */}
                  <View style={styles.cardStatsRow}>
                    <View style={styles.cardStat}>
                      <Ionicons name="eye-outline" size={13} color="#F59E0B" />
                      <Text style={[styles.cardStatText, { color: colors.textSecondary }]}>
                        <Text style={{ fontWeight: '700', color: colors.text }}>
                          {asset.viewCount}
                        </Text>{' '}
                        tarama
                      </Text>
                    </View>

                    <View style={styles.cardStat}>
                      <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                      <Text style={[styles.cardStatText, { color: colors.textSecondary }]}>
                        {new Date(asset.createdAt).toLocaleDateString('tr-TR', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Card Bottom: Primary Dedicated Panel CTA & Tool Actions */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    {/* Primary Dedicated Panel Button */}
                    <TouchableOpacity
                      style={[
                        styles.openDedicatedPanelBtn,
                        {
                          backgroundColor:
                            badge.color === '#C5A059'
                              ? isDark
                                ? '#C5A059'
                                : '#1A1817'
                              : badge.color,
                        },
                      ]}
                      onPress={() => router.push(asset.editRoute as any)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={15}
                        color={badge.color === '#C5A059' && isDark ? '#1A1817' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          styles.openDedicatedPanelBtnText,
                          {
                            color:
                              badge.color === '#C5A059' && isDark
                                ? '#1A1817'
                                : '#FFFFFF',
                          },
                        ]}
                      >
                        {badge.label} Panelini Aç
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={badge.color === '#C5A059' && isDark ? '#1A1817' : '#FFFFFF'}
                      />
                    </TouchableOpacity>

                    {/* Secondary Row: Live Preview, QR Studio, Shop */}
                    <View style={styles.cardSubActionRow}>
                      <TouchableOpacity
                        style={[styles.subActionBtn, { borderColor: colors.border }]}
                        onPress={() => router.push(asset.liveUrl as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye-outline" size={13} color={colors.text} />
                        <Text style={[styles.subActionText, { color: colors.text }]}>
                          Canlı Gör
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.subActionBtn, { borderColor: colors.border }]}
                        onPress={() =>
                          router.push({
                            pathname: '/panel/qr-studio',
                            params: {
                              url: asset.liveUrl,
                              title: asset.title,
                              moduleType: asset.moduleType,
                            },
                          } as any)
                        }
                        activeOpacity={0.8}
                      >
                        <Ionicons name="sparkles-outline" size={13} color="#C5A059" />
                        <Text style={[styles.subActionText, { color: '#C5A059' }]}>
                          QR Stüdyo
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.subActionBtn, { borderColor: colors.border }]}
                        onPress={() => router.push('/panel/magaza' as any)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cube-outline" size={13} color="#10B981" />
                        <Text style={[styles.subActionText, { color: '#10B981' }]}>
                          Baskı Al
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 5. Ecosystem Suite Quick Grid (Bottom Tools) */}
        <View style={styles.ecosystemToolsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text, marginBottom: 4 }]}>
            Ekosistem ve Entegre Araçlar
          </Text>
          <Text style={[styles.sectionSubheading, { color: colors.textSecondary, marginBottom: 16 }]}>
            QR kodlarınızı profesyonel araçlarla zenginleştirin ve fiziksel ürünlere dönüştürün.
          </Text>

          <View style={styles.suiteToolsGrid}>
            <TouchableOpacity
              style={[styles.suiteToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/analitik' as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.suiteIconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}>
                <Ionicons name="bar-chart" size={22} color="#D97706" />
              </View>
              <Text style={[styles.suiteToolTitle, { color: colors.text }]}>
                Dinamik QR Analitiği
              </Text>
              <Text style={[styles.suiteToolDesc, { color: colors.textSecondary }]}>
                Ziyaretçi coğrafyası, cihaz türleri, saatlik pikler ve tarama trendleri.
              </Text>
              <View style={styles.suiteToolLinkRow}>
                <Text style={styles.suiteToolLinkText}>Raporları İncele</Text>
                <Ionicons name="arrow-forward" size={14} color="#C5A059" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.suiteToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/qr-studio' as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.suiteIconCircle, { backgroundColor: 'rgba(197, 160, 89, 0.12)' }]}>
                <Ionicons name="sparkles" size={22} color="#C5A059" />
              </View>
              <Text style={[styles.suiteToolTitle, { color: colors.text }]}>
                QR Kod Tasarım Stüdyosu
              </Text>
              <Text style={[styles.suiteToolDesc, { color: colors.textSecondary }]}>
                Logo entegrasyonu, degrade renkler, yuvarlatılmış köşeler ve SVG indirme.
              </Text>
              <View style={styles.suiteToolLinkRow}>
                <Text style={styles.suiteToolLinkText}>Stüdyoya Git</Text>
                <Ionicons name="arrow-forward" size={14} color="#C5A059" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.suiteToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/magaza' as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.suiteIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="cube" size={22} color="#10B981" />
              </View>
              <Text style={[styles.suiteToolTitle, { color: colors.text }]}>
                Baskı & NFC Mağazası
              </Text>
              <Text style={[styles.suiteToolDesc, { color: colors.textSecondary }]}>
                Ön cam UV sticker, pleksi masa kartı, metal pati künyesi ve ahşap menü standı.
              </Text>
              <View style={styles.suiteToolLinkRow}>
                <Text style={styles.suiteToolLinkText}>Ürünleri Gör</Text>
                <Ionicons name="arrow-forward" size={14} color="#C5A059" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.suiteToolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/panel/tarifeler' as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.suiteIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                <Ionicons name="shield-checkmark" size={22} color="#8B5CF6" />
              </View>
              <Text style={[styles.suiteToolTitle, { color: colors.text }]}>
                Planlar ve Tarifeler
              </Text>
              <Text style={[styles.suiteToolDesc, { color: colors.textSecondary }]}>
                Sınırsız bulut depolama, yüksek çözünürlüklü medya ve VIP öncelikli destek.
              </Text>
              <View style={styles.suiteToolLinkRow}>
                <Text style={styles.suiteToolLinkText}>Paketleri İncele</Text>
                <Ionicons name="arrow-forward" size={14} color="#C5A059" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 6. "+ Yeni QR Varlık Ekle" Multi-Product Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Yeni QR Varlık Oluştur
                </Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  Kullanmak istediğiniz QR modülünü seçerek başlayın
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.surface }]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Module Selection Options */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Option 1: Düğün & Etkinlik */}
              <TouchableOpacity
                style={[styles.modalOptionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/duzenle' as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                  <Ionicons name="heart" size={24} color="#C5A059" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modalOptTitleRow}>
                    <Text style={[styles.modalOptTitle, { color: colors.text }]}>
                      💍 Düğün & Özel Etkinlik QR
                    </Text>
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Popüler</Text>
                    </View>
                  </View>
                  <Text style={[styles.modalOptDesc, { color: colors.textSecondary }]}>
                    Misafirlerden anlık fotoğraf & video toplama, dijital anı defteri, canlı projeksiyon ve müzik istekleri.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C5A059" />
              </TouchableOpacity>

              {/* Option 2: Araç & Park Tagı */}
              <TouchableOpacity
                style={[styles.modalOptionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/arac' as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Ionicons name="car-sport" size={24} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalOptTitle, { color: colors.text }]}>
                    🚗 Araç & Park Tagı
                  </Text>
                  <Text style={[styles.modalOptDesc, { color: colors.textSecondary }]}>
                    Ön camda numara gizleme, maskeli WhatsApp mesajı, acil durum kan grubu ve çekici uyarısı.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#0284C7" />
              </TouchableOpacity>

              {/* Option 3: Pati Künyesi */}
              <TouchableOpacity
                style={[styles.modalOptionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/pati' as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="paw" size={24} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalOptTitle, { color: colors.text }]}>
                    🐾 Pati Künyesi (Akıllı Tasma)
                  </Text>
                  <Text style={[styles.modalOptDesc, { color: colors.textSecondary }]}>
                    Kayıp alarmı, anlık GPS konum bildirimi, aşı karnesi ve bulan kişiyle tek tuşla iletişim.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#10B981" />
              </TouchableOpacity>

              {/* Option 4: Dijital Kartvizit */}
              <TouchableOpacity
                style={[styles.modalOptionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/kartvizit' as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="card" size={24} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalOptTitle, { color: colors.text }]}>
                    💼 Dijital Kartvizit (vCard & NFC)
                  </Text>
                  <Text style={[styles.modalOptDesc, { color: colors.textSecondary }]}>
                    Tek dokunuşla rehbere .vcf kaydetme, LinkedIn / Instagram profilleri ve kurumsal şirket bilgileri.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
              </TouchableOpacity>

              {/* Option 5: Restoran Menüsü */}
              <TouchableOpacity
                style={[styles.modalOptionCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  setCreateModalVisible(false);
                  router.push('/panel/menu' as any);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Ionicons name="restaurant" size={24} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalOptTitle, { color: colors.text }]}>
                    🍽️ Restoran & Kafe Menüsü
                  </Text>
                  <Text style={[styles.modalOptDesc, { color: colors.textSecondary }]}>
                    Masa bazlı temassız dijital menü, alerjen filtreleri, garson çağırma ve Wi-Fi bağlantısı.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Bildirim Merkezi Modalı */}
      <NotificationCenterModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function getStyles(
  isDark: boolean,
  colors: ThemeColors,
  isMobile: boolean,
  isWide: boolean
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // 1. Navbar
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: isMobile ? 16 : 28,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    navLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandIconBox: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: '#C5A059',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    brandTitle: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    brandBadge: {
      backgroundColor: 'rgba(197, 160, 89, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    brandBadgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#C5A059',
      letterSpacing: 0.5,
    },
    brandSubtitle: {
      fontSize: 11,
      fontWeight: '500',
    },
    navRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerToolBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      borderWidth: 1,
    },
    notifBellBtn: {
      position: 'relative',
      paddingHorizontal: 9,
      paddingVertical: 7,
    },
    notifBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#EF4444',
      borderRadius: 9,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: isDark ? '#090D16' : '#FFFFFF',
    },
    notifBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '800',
    },
    headerToolText: {
      fontSize: 13,
      fontWeight: '600',
    },
    primaryCreateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#C5A059',
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
      shadowColor: '#C5A059',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    primaryCreateBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    scrollContent: {
      paddingHorizontal: isMobile ? 16 : 28,
      paddingTop: 20,
      paddingBottom: 60,
      maxWidth: 1320,
      width: '100%',
      alignSelf: 'center',
    },

    // 2. Hero Banner
    heroCard: {
      borderRadius: 20,
      padding: isMobile ? 18 : 26,
      borderWidth: 1,
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
    },
    heroGlowAccent: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(197, 160, 89, 0.08)',
    },
    heroTopRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 16,
    },
    heroTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    heroTagBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    heroTagText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#C5A059',
      letterSpacing: 0.5,
    },
    heroLiveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
    },
    heroLiveText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#10B981',
    },
    heroHeading: {
      fontSize: isMobile ? 22 : 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    heroSubheading: {
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 720,
    },
    heroCtaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#C5A059',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: '#C5A059',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    heroCtaBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    heroStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      paddingTop: 18,
      borderTopWidth: 1,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? 14 : 0,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minWidth: isMobile ? '45%' : 'auto',
    },
    statIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statNum: {
      fontSize: 17,
      fontWeight: '800',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    statDivider: {
      width: 1,
      height: 32,
      opacity: 0.6,
    },

    // Mobile Quick Tools
    mobileToolsBar: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    mobileToolCard: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      gap: 4,
    },
    mobileToolText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // 3. Filter Section
    filterSection: {
      marginBottom: 20,
    },
    filterScroll: {
      gap: 10,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: 13,
    },
    filterBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    filterBadgeText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // 4. Section Header
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sectionHeading: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    sectionSubheading: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
    inlineAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
    },
    inlineAddBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },

    // Empty state
    emptyBox: {
      borderRadius: 18,
      padding: 36,
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: 24,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(197, 160, 89, 0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: 13,
      textAlign: 'center',
      maxWidth: 380,
      marginBottom: 18,
    },
    emptyCtaBtn: {
      backgroundColor: '#C5A059',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
    },
    emptyCtaText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Asset Cards Grid
    assetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 36,
    },
    assetCard: {
      borderRadius: 18,
      borderWidth: 1,
      width: isWide ? '32%' : isMobile ? '100%' : '48.5%',
      flexGrow: 1,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: 16,
      gap: 10,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      gap: 12,
      flex: 1,
    },
    cardIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moduleBadgeLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    moduleBadgeLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    attrBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    attrBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 12,
    },

    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Card Mid
    cardMidRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      gap: 8,
    },
    urlBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    urlText: {
      fontSize: 12,
      fontWeight: '600',
      fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(150, 150, 150, 0.3)',
    },
    copyBtnText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Card Stats
    cardStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      gap: 16,
    },
    cardStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    cardStatText: {
      fontSize: 12,
    },

    // Card Footer Actions
    cardFooter: {
      padding: 14,
      borderTopWidth: 1,
      gap: 8,
    },
    openDedicatedPanelBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      borderRadius: 10,
    },
    openDedicatedPanelBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
    cardSubActionRow: {
      flexDirection: 'row',
      gap: 6,
    },
    subActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
    },
    subActionText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // 5. Suite Tools Bottom Grid
    ecosystemToolsSection: {
      marginTop: 10,
      marginBottom: 20,
    },
    suiteToolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    suiteToolCard: {
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      width: isWide ? '23.8%' : isMobile ? '100%' : '48.5%',
      flexGrow: 1,
    },
    suiteIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    suiteToolTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 6,
    },
    suiteToolDesc: {
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 14,
    },
    suiteToolLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    suiteToolLinkText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#C5A059',
    },

    // 6. Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalDialog: {
      width: '100%',
      maxWidth: 620,
      borderRadius: 20,
      borderWidth: 1,
      maxHeight: '90%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
    },
    modalSub: {
      fontSize: 12,
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalScroll: {
      padding: 16,
    },
    modalOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 12,
      gap: 14,
    },
    modalOptIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOptTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    modalOptTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    popularBadge: {
      backgroundColor: 'rgba(197, 160, 89, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    popularBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#C5A059',
    },
    modalOptDesc: {
      fontSize: 12,
      lineHeight: 17,
    },
  });
}
