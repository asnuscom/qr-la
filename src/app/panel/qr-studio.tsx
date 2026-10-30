import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { QRStudioConfig, QRDotStyle, QREyeFrameStyle, QREyePupilStyle, QRGradientType, QRFrameStyle } from '../../modules/qr-studio/types';
import { QR_PRESETS } from '../../modules/qr-studio/presets';
import { generateCustomQRSvg, downloadSvgFile, downloadHighResPng } from '../../modules/qr-studio/qrEngine';
import { ecosystemService, EcosystemAsset } from '../../services/ecosystemService';
import { authService } from '../../services/authService';
import { useTheme, ThemeColors } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

type StudioTab = 'content' | 'colors' | 'shapes' | 'logo' | 'frame';

export default function QRStudioScreen() {
  const params = useLocalSearchParams<{ url?: string; title?: string; moduleType?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { isDark, colors } = useTheme();
  const styles = getStyles(isDark, colors);

  // Kullanıcı Varlıkları
  const [assets, setAssets] = useState<EcosystemAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('custom');

  // Aktif Sekme
  const [activeTab, setActiveTab] = useState<StudioTab>('content');

  // Toast / Bildirim
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // QR Yapılandırma State'i
  const [config, setConfig] = useState<QRStudioConfig>({
    text: params.url || 'https://qr-la.com/samet-sule',
    dotStyle: 'square',
    eyeFrameStyle: 'square',
    eyePupilStyle: 'square',
    colorMode: 'solid',
    primaryColor: '#000000',
    gradientSecondaryColor: '#000000',
    gradientType: 'linear_vert',
    eyeColor: '#000000',
    eyeFrameColor: '#000000',
    eyePupilColor: '#000000',
    backgroundColor: '#FFFFFF',
    logoType: 'none',
    logoEmoji: '',
    logoUrl: '',
    logoSizePercent: 22,
    logoBgColor: '#FFFFFF',
    frameStyle: 'none',
    frameText: '',
    frameColor: '#000000',
    frameTextColor: '#FFFFFF',
    margin: 2,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Varlık Seçildiğinde
  const handleSelectAsset = (asset: EcosystemAsset) => {
    setSelectedAssetId(asset.id);
    const domain = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://qr-la.com';
    const fullUrl = `${domain}${asset.liveUrl}`;

    let defaultEmoji = '⚡';
    let defaultFrame = 'TARAYIN';

    if (asset.moduleType === 'event') {
      defaultEmoji = '💍';
      defaultFrame = 'ANILARI PAYLAŞ 📸';
    } else if (asset.moduleType === 'vehicle') {
      defaultEmoji = '🚗';
      defaultFrame = 'İLETİŞİME GEÇ';
    } else if (asset.moduleType === 'pet') {
      defaultEmoji = '🐾';
      defaultFrame = 'KÜNYEYİ TARA 🐾';
    } else if (asset.moduleType === 'vcard') {
      defaultEmoji = '💼';
      defaultFrame = 'REHBERE EKLE';
    } else if (asset.moduleType === 'menu') {
      defaultEmoji = '🍽️';
      defaultFrame = 'MENÜYÜ GÖRÜN 🍽️';
    }

    setConfig((prev) => ({
      ...prev,
      text: fullUrl,
      logoEmoji: defaultEmoji,
      frameText: defaultFrame,
    }));
    showToast(`"${asset.title}" varlığı yüklendi`);
  };

  // Varlıkları yükle
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const currentUser = authService.getState().user;
        const userAssets = await ecosystemService.getAllUserAssets(currentUser?.uid);
        setAssets(userAssets);

        if (params.url) {
          const matched = userAssets.find(
            (a) => a.liveUrl === params.url || `https://qr-la.com${a.liveUrl}` === params.url
          );
          if (matched) {
            handleSelectAsset(matched);
          }
        } else if (userAssets.length > 0 && !selectedAssetId) {
          handleSelectAsset(userAssets[0]);
        }
      } catch (err) {
        console.warn('Varlıklar yüklenemedi:', err);
      }
    };
    loadAssets();
  }, [params.url]);

  // Hazır Şablon (Preset) Uygula
  const applyPreset = (presetId: string) => {
    const found = QR_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setConfig((prev) => ({
      ...prev,
      ...found.config,
    }));
    showToast(`"${found.name}" şablonu uygulandı`);
  };

  // SVG Çıktısını Dinamik Üret
  const svgOutput = useMemo(() => {
    return generateCustomQRSvg(config, 600);
  }, [config]);

  // Vektörel SVG İndir
  const handleDownloadSvg = () => {
    downloadSvgFile(svgOutput, 'qr-la-vektorel.svg');
    showToast('Vektörel SVG başarıyla indirildi!');
  };

  // Yüksek Çözünürlüklü HD PNG İndir (2048px)
  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      await downloadHighResPng(svgOutput, 2048, 'qr-la-ultra-hd.png');
      showToast('2048x2048 Ultra HD PNG başarıyla indirildi!');
    } catch (err) {
      console.error('PNG export hatası:', err);
      showToast('PNG dışa aktarma hatası oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  // SVG Kodunu Panoya Kopyala
  const handleCopySvg = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(svgOutput);
      showToast('SVG kodu panoya kopyalandı!');
    }
  };

  // Yazdırma (Print)
  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR-la Yazdırma Şablonu</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  background: #F8FAFC;
                }
                .card {
                  padding: 40px;
                  background: white;
                  border-radius: 20px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                  text-align: center;
                  max-width: 480px;
                }
                svg {
                  width: 360px;
                  height: auto;
                }
                .brand {
                  margin-top: 24px;
                  font-weight: 700;
                  font-size: 18px;
                  color: #0F172A;
                  letter-spacing: 2px;
                }
                .url {
                  font-size: 13px;
                  color: #64748B;
                  margin-top: 6px;
                  word-break: break-all;
                }
                @media print {
                  body { background: white; }
                  .card { box-shadow: none; padding: 20px; }
                }
              </style>
            </head>
            <body>
              <div class="card">
                ${svgOutput}
                <div class="brand">QR-LA DİNAMİK QR</div>
                <div class="url">${config.text}</div>
              </div>
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 400);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Üst Navigasyon Barı */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.canGoBack() ? router.back() : router.push('/' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? '#FFFFFF' : colors.text} />
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>

          <View style={styles.titleGroup}>
            <Text style={styles.topBarTitle}>✨ QR Tasarım Stüdyosu</Text>
            <Text style={styles.topBarSub}>Vektörel SVG & HD Matbaa Baskı Çıktısı</Text>
          </View>
        </View>

        {/* Hızlı Aksiyon Butonları */}
        <View style={styles.topBarRight}>
          <ThemeToggleBtn size="sm" />
          <TouchableOpacity
            style={[styles.actionBtn, styles.svgActionBtn]}
            onPress={handleDownloadSvg}
            activeOpacity={0.8}
          >
            <Ionicons name="code-download-outline" size={17} color={isDark ? '#FFFFFF' : colors.text} />
            <Text style={styles.actionBtnText}>SVG İndir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.hdActionBtn]}
            onPress={handleDownloadPng}
            disabled={isExporting}
            activeOpacity={0.8}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <Ionicons name="sparkles" size={17} color="#0F172A" />
            )}
            <Text style={[styles.actionBtnText, { color: '#0F172A', fontWeight: '700' }]}>
              {isExporting ? 'Hazırlanıyor...' : '2048px HD PNG'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.printActionBtn]}
            onPress={handlePrint}
            activeOpacity={0.8}
          >
            <Ionicons name="print-outline" size={17} color="#E2E8F0" />
            <Text style={styles.actionBtnText}>Yazdır</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Bildirimi */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 2 Sütunlu Çalışma Alanı (Masaüstünde Yan Yana, Mobilde Alt Alta) */}
      <View style={[styles.workspace, isDesktop ? styles.workspaceRow : styles.workspaceCol]}>
        {/* SOL SÜTUN: CANLI ÖNİZLEME & PRESETLER */}
        <View style={[styles.previewColumn, isDesktop && styles.previewColumnDesktop]}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.scoreBadge}>
                <View style={styles.scoreDot} />
                <Text style={styles.scoreText}>%99 Mükemmel Taranabilirlik</Text>
              </View>
              <Text style={styles.formatBadge}>Hata Düzeltme H Seviyesi</Text>
            </View>

            {/* SVG Canvas Görünümü */}
            <View style={styles.canvasContainer}>
              {Platform.OS === 'web' ? (
                <div
                  dangerouslySetInnerHTML={{ __html: svgOutput }}
                  style={{
                    width: '100%',
                    maxWidth: 340,
                    height: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.25))',
                  }}
                />
              ) : (
                <Text style={styles.mobileFallbackText}>Önizleme web üzerinde etkindir</Text>
              )}
            </View>

            {/* Önizleme Altı Hızlı Butonlar */}
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewSubBtn}
                onPress={handleCopySvg}
                activeOpacity={0.8}
              >
                <Ionicons name="copy-outline" size={16} color="#CBD5E1" />
                <Text style={styles.previewSubBtnText}>SVG Kopyala</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewSubBtn}
                onPress={handleDownloadSvg}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={16} color="#CBD5E1" />
                <Text style={styles.previewSubBtnText}>Vektörel (.svg)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewSubBtn}
                onPress={handlePrint}
                activeOpacity={0.8}
              >
                <Ionicons name="print-outline" size={16} color="#CBD5E1" />
                <Text style={styles.previewSubBtnText}>Masa Kartı Çıktısı</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lüks Hazır Şablonlar (Presets) Karuseli */}
          <View style={styles.presetsSection}>
            <Text style={styles.presetsSectionTitle}>🎨 Lüks Hazır Şablonlar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
              {QR_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetCard}
                  onPress={() => applyPreset(preset.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetBadge}>{preset.badge}</Text>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDesc} numberOfLines={2}>
                    {preset.description}
                  </Text>
                  <View style={styles.presetColorPreview}>
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: preset.config.primaryColor || '#000' },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: preset.config.gradientSecondaryColor || '#444' },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: preset.config.backgroundColor || '#FFF',
                          borderWidth: 1,
                          borderColor: '#334155',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* SAĞ SÜTUN: TASARIM KONTROL SEKMELERİ */}
        <View style={[styles.controlsColumn, isDesktop && styles.controlsColumnDesktop]}>
          {/* Sekme Butonları */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'content' && styles.tabItemActive]}
              onPress={() => setActiveTab('content')}
            >
              <Ionicons
                name="link-outline"
                size={18}
                color={activeTab === 'content' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabItemText, activeTab === 'content' && styles.tabItemTextActive]}>
                İçerik
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'colors' && styles.tabItemActive]}
              onPress={() => setActiveTab('colors')}
            >
              <Ionicons
                name="color-palette-outline"
                size={18}
                color={activeTab === 'colors' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabItemText, activeTab === 'colors' && styles.tabItemTextActive]}>
                Renkler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'shapes' && styles.tabItemActive]}
              onPress={() => setActiveTab('shapes')}
            >
              <Ionicons
                name="shapes-outline"
                size={18}
                color={activeTab === 'shapes' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabItemText, activeTab === 'shapes' && styles.tabItemTextActive]}>
                Şekiller
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'logo' && styles.tabItemActive]}
              onPress={() => setActiveTab('logo')}
            >
              <Ionicons
                name="image-outline"
                size={18}
                color={activeTab === 'logo' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabItemText, activeTab === 'logo' && styles.tabItemTextActive]}>
                Logo/İkon
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'frame' && styles.tabItemActive]}
              onPress={() => setActiveTab('frame')}
            >
              <Ionicons
                name="scan-outline"
                size={18}
                color={activeTab === 'frame' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabItemText, activeTab === 'frame' && styles.tabItemTextActive]}>
                Çerçeve
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sekme İçerikleri */}
          <ScrollView style={styles.tabContentScroll} contentContainerStyle={styles.tabContentContainer}>
            {/* 1. SEKME: İÇERİK & VARLIK SEÇİCİ */}
            {activeTab === 'content' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>🔗 QR Hedef Bağlantısı & Varlık</Text>
                <Text style={styles.blockSubtitle}>
                  Mevcut QR-la varlıklarınızdan birini seçin veya serbest bir web linki girin.
                </Text>

                {/* Kullanıcı Varlıkları Listesi */}
                {assets.length > 0 && (
                  <View style={styles.assetSelectorContainer}>
                    <Text style={styles.fieldLabel}>QR-la Varlıklarım ({assets.length}):</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll}>
                      {assets.map((a) => {
                        const isSelected = selectedAssetId === a.id;
                        return (
                          <TouchableOpacity
                            key={a.id}
                            style={[styles.assetChip, isSelected && styles.assetChipActive]}
                            onPress={() => handleSelectAsset(a)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.assetChipIcon}>
                              {a.moduleType === 'event'
                                ? '💍'
                                : a.moduleType === 'vehicle'
                                ? '🚗'
                                : a.moduleType === 'pet'
                                ? '🐾'
                                : a.moduleType === 'vcard'
                                ? '💼'
                                : '🍽️'}
                            </Text>
                            <View>
                              <Text
                                style={[styles.assetChipTitle, isSelected && styles.assetChipTitleActive]}
                                numberOfLines={1}
                              >
                                {a.title}
                              </Text>
                              <Text style={styles.assetChipUrl}>{a.liveUrl}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Serbest URL Girişi */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>Özel Bağlantı / Hedef URL:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={config.text}
                    onChangeText={(val) => {
                      setSelectedAssetId('custom');
                      setConfig((prev) => ({ ...prev, text: val }));
                    }}
                    placeholder="https://qr-la.com/..."
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.inputHelper}>
                    QR kod tarandığında kullanıcı bu adrese yönlendirilir.
                  </Text>
                </View>
              </View>
            )}

            {/* 2. SEKME: RENKLER & GRADYAN */}
            {activeTab === 'colors' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>🎨 Renk Paleti & Gradyan</Text>
                <Text style={styles.blockSubtitle}>
                  Zengin geçişli gradyanlar veya keskin düz renkler belirleyin.
                </Text>

                {/* Renk Modu (Solid / Gradient) */}
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, config.colorMode === 'gradient' && styles.toggleBtnActive]}
                    onPress={() => setConfig((prev) => ({ ...prev, colorMode: 'gradient' }))}
                  >
                    <Ionicons name="color-filter-outline" size={17} color={config.colorMode === 'gradient' ? '#6366F1' : '#94A3B8'} />
                    <Text style={[styles.toggleBtnText, config.colorMode === 'gradient' && styles.toggleBtnTextActive]}>
                      Çift Renk Gradyan
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, config.colorMode === 'solid' && styles.toggleBtnActive]}
                    onPress={() => setConfig((prev) => ({ ...prev, colorMode: 'solid' }))}
                  >
                    <Ionicons name="ellipse" size={17} color={config.colorMode === 'solid' ? '#6366F1' : '#94A3B8'} />
                    <Text style={[styles.toggleBtnText, config.colorMode === 'solid' && styles.toggleBtnTextActive]}>
                      Düz Tek Renk
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Birincil Renk Paleti */}
                <Text style={styles.fieldLabel}>Birincil Renk (Ana Ton / Gövde):</Text>
                <View style={styles.paletteGrid}>
                  {[
                    '#000000', '#0F172A', '#6366F1', '#0284C7', '#10B981', '#EC4899', '#F59E0B',
                    '#EC4899', '#EA580C', '#0F172A', '#E11D48',
                  ].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.paletteCircle,
                        { backgroundColor: color },
                        config.primaryColor.toLowerCase() === color.toLowerCase() && styles.paletteCircleActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, primaryColor: color }))}
                    />
                  ))}
                </View>
                <View style={[styles.hexInputRow, { marginTop: 8 }]}>
                  <View style={[styles.hexPreviewSwatch, { backgroundColor: config.primaryColor }]} />
                  <TextInput
                    style={styles.hexTextInput}
                    value={config.primaryColor}
                    placeholder="#000000"
                    placeholderTextColor="#64748B"
                    onChangeText={(val) => setConfig((prev) => ({ ...prev, primaryColor: val }))}
                    autoCapitalize="none"
                    maxLength={9}
                  />
                </View>

                {/* Gradyan İkincil Renk (Eğer gradyan açıksa) */}
                {config.colorMode === 'gradient' && (
                  <View style={[styles.inputGroup, { marginTop: 14 }]}>
                    <Text style={styles.fieldLabel}>İkincil Renk (Geçiş Tonu):</Text>
                    <View style={styles.paletteGrid}>
                      {[
                        '#000000', '#334155', '#996515', '#047857', '#1D4ED8', '#6D28D9',
                        '#BE185D', '#9A3412', '#9F1239',
                      ].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.paletteCircle,
                            { backgroundColor: color },
                            config.gradientSecondaryColor.toLowerCase() === color.toLowerCase() && styles.paletteCircleActive,
                          ]}
                          onPress={() => setConfig((prev) => ({ ...prev, gradientSecondaryColor: color }))}
                        />
                      ))}
                    </View>

                    <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Gradyan Yönü:</Text>
                    <View style={styles.toggleRow}>
                      {[
                        { id: 'linear_diag', label: 'Çapraz ↗' },
                        { id: 'linear_vert', label: 'Dikey ↓' },
                        { id: 'linear_horiz', label: 'Yatay →' },
                      ].map((dir) => (
                        <TouchableOpacity
                          key={dir.id}
                          style={[
                            styles.miniOptionBtn,
                            config.gradientType === dir.id && styles.miniOptionBtnActive,
                          ]}
                          onPress={() => setConfig((prev) => ({ ...prev, gradientType: dir.id as QRGradientType }))}
                        >
                          <Text
                            style={[
                              styles.miniOptionText,
                              config.gradientType === dir.id && styles.miniOptionTextActive,
                            ]}
                          >
                            {dir.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 👁️ Köşe Göz Rengi (Bulucu Desenler) */}
                <View style={{ marginTop: 20 }}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.fieldLabel}>👁️ Köşe Göz Rengi (Bulucu Desenler):</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() =>
                          setConfig((prev) => ({
                            ...prev,
                            eyeColor: '#000000',
                            eyeFrameColor: '#000000',
                            eyePupilColor: '#000000',
                          }))
                        }
                        style={styles.quickActionPill}
                      >
                        <Ionicons name="ellipse" size={12} color="#000000" />
                        <Text style={styles.quickActionText}>Siyah Yap</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setConfig((prev) => ({
                            ...prev,
                            eyeColor: undefined,
                            eyeFrameColor: undefined,
                            eyePupilColor: undefined,
                          }))
                        }
                        style={styles.quickActionPill}
                      >
                        <Ionicons name="sync-outline" size={12} color="#94A3B8" />
                        <Text style={[styles.quickActionText, { color: '#94A3B8' }]}>Gövdeyle Eşitle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.inputHelper, { marginBottom: 10 }]}>
                    Köşelerdeki 3 adet kare/daire gözün çerçeve ve göz bebeği rengini ayarlayın.
                  </Text>

                  {/* Göz Renk Paleti */}
                  <View style={styles.paletteGrid}>
                    {[
                      '#000000', '#1E293B', '#6366F1', '#10B981',
                      '#3B82F6', '#8B5CF6', '#EC4899', '#EA580C', '#E11D48',
                    ].map((color) => {
                      const activeEyeColor = config.eyeColor || (config.colorMode === 'solid' ? config.primaryColor : '#000000');
                      const isSelected = activeEyeColor.toLowerCase() === color.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.paletteCircle,
                            { backgroundColor: color },
                            isSelected && styles.paletteCircleActive,
                          ]}
                          onPress={() =>
                            setConfig((prev) => ({
                              ...prev,
                              eyeColor: color,
                              eyeFrameColor: color,
                              eyePupilColor: color,
                            }))
                          }
                        />
                      );
                    })}
                  </View>

                  {/* Özel Hex Girişi */}
                  <View style={[styles.hexInputRow, { marginTop: 10 }]}>
                    <View
                      style={[
                        styles.hexPreviewSwatch,
                        {
                          backgroundColor:
                            config.eyeColor || (config.colorMode === 'solid' ? config.primaryColor : '#000000'),
                        },
                      ]}
                    />
                    <TextInput
                      style={styles.hexTextInput}
                      value={config.eyeColor || ''}
                      placeholder="#000000 (Boş bırakılırsa gövdeyle aynı olur)"
                      placeholderTextColor="#64748B"
                      onChangeText={(val) => {
                        const clean = val.trim();
                        setConfig((prev) => ({
                          ...prev,
                          eyeColor: clean || undefined,
                          eyeFrameColor: clean || undefined,
                          eyePupilColor: clean || undefined,
                        }));
                      }}
                      autoCapitalize="none"
                      maxLength={9}
                    />
                  </View>
                </View>

                {/* Arka Plan Rengi */}
                <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Arka Plan Rengi:</Text>
                <View style={styles.bgOptionsRow}>
                  {[
                    { id: '#FFFFFF', label: 'Saf Beyaz (Varsayılan)', isDark: false },
                    { id: '#F8FAFC', label: 'Fildişi Lüks', isDark: false },
                    { id: '#0F172A', label: 'Karbon (#0F172A)', isDark: true },
                    { id: '#000000', label: 'Saf Siyah', isDark: true },
                    { id: 'transparent', label: 'Şeffaf (PNG)', isDark: false },
                  ].map((bg) => (
                    <TouchableOpacity
                      key={bg.id}
                      style={[
                        styles.bgOptionCard,
                        config.backgroundColor === bg.id && styles.bgOptionCardActive,
                      ]}
                      onPress={() =>
                        setConfig((prev) => ({
                          ...prev,
                          backgroundColor: bg.id,
                          logoBgColor: bg.isDark ? '#0F172A' : '#FFFFFF',
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.bgSwatch,
                          {
                            backgroundColor: bg.id === 'transparent' ? '#E2E8F0' : bg.id,
                            borderColor: '#475569',
                            borderWidth: 1,
                          },
                        ]}
                      />
                      <Text style={styles.bgOptionLabel}>{bg.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 3. SEKME: ŞEKİLLER & NOKTALAR */}
            {activeTab === 'shapes' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>💠 Nokta & Köşe Şekilleri</Text>
                <Text style={styles.blockSubtitle}>
                  Veri noktalarının ve köşe bulucu gözlerin geometrisini özelleştirin.
                </Text>

                {/* Nokta / Piksel Stili */}
                <Text style={styles.fieldLabel}>Nokta Stili (Data Dots):</Text>
                <View style={styles.shapeGrid}>
                  {[
                    { id: 'rounded', label: 'Yumuşak Kare', desc: 'Modern & Estetik' },
                    { id: 'dots', label: 'Yuvarlak Daireler', desc: 'Minimal & Taze' },
                    { id: 'diamond', label: 'Elmas Kristal', desc: 'Siber & Lüks' },
                    { id: 'square', label: 'Klasik Kare', desc: 'Standart Keskin' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.shapeCard,
                        config.dotStyle === s.id && styles.shapeCardActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, dotStyle: s.id as QRDotStyle }))}
                    >
                      <Text style={styles.shapeCardTitle}>{s.label}</Text>
                      <Text style={styles.shapeCardDesc}>{s.desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Köşe Göz Çerçevesi */}
                <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Köşe Göz Çerçevesi (Eye Frame):</Text>
                <View style={styles.shapeGrid}>
                  {[
                    { id: 'rounded', label: 'Yumuşak Köşeli' },
                    { id: 'circle', label: 'Daire Halka' },
                    { id: 'square', label: 'Klasik Kare' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        styles.shapeCard,
                        config.eyeFrameStyle === f.id && styles.shapeCardActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, eyeFrameStyle: f.id as QREyeFrameStyle }))}
                    >
                      <Text style={styles.shapeCardTitle}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Köşe Göz Bebeği */}
                <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Köşe Göz Bebeği (Eye Pupil):</Text>
                <View style={styles.shapeGrid}>
                  {[
                    { id: 'circle', label: 'Yuvarlak Daire' },
                    { id: 'rounded', label: 'Yumuşak Köşe' },
                    { id: 'diamond', label: 'Elmas' },
                    { id: 'square', label: 'Kare' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.shapeCard,
                        config.eyePupilStyle === p.id && styles.shapeCardActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, eyePupilStyle: p.id as QREyePupilStyle }))}
                    >
                      <Text style={styles.shapeCardTitle}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Köşe Göz Rengi Hızlı Seçimi */}
                <View style={{ marginTop: 20 }}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.fieldLabel}>👁️ Köşe Göz Rengi (Eye Color):</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() =>
                          setConfig((prev) => ({
                            ...prev,
                            eyeColor: '#000000',
                            eyeFrameColor: '#000000',
                            eyePupilColor: '#000000',
                          }))
                        }
                        style={styles.quickActionPill}
                      >
                        <Ionicons name="ellipse" size={12} color="#000000" />
                        <Text style={styles.quickActionText}>Siyah</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setConfig((prev) => ({
                            ...prev,
                            eyeColor: undefined,
                            eyeFrameColor: undefined,
                            eyePupilColor: undefined,
                          }))
                        }
                        style={styles.quickActionPill}
                      >
                        <Ionicons name="sync-outline" size={12} color="#94A3B8" />
                        <Text style={[styles.quickActionText, { color: '#94A3B8' }]}>Gövdeyle Eşitle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.paletteGrid, { marginTop: 6 }]}>
                    {[
                      '#000000', '#1E293B', '#6366F1', '#10B981',
                      '#3B82F6', '#8B5CF6', '#EC4899', '#EA580C', '#E11D48',
                    ].map((color) => {
                      const activeEyeColor = config.eyeColor || (config.colorMode === 'solid' ? config.primaryColor : '#000000');
                      const isSelected = activeEyeColor.toLowerCase() === color.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.paletteCircle,
                            { backgroundColor: color },
                            isSelected && styles.paletteCircleActive,
                          ]}
                          onPress={() =>
                            setConfig((prev) => ({
                              ...prev,
                              eyeColor: color,
                              eyeFrameColor: color,
                              eyePupilColor: color,
                            }))
                          }
                        />
                      );
                    })}
                  </View>
                </View>

                {/* Kenar Boşluğu (Margin) */}
                <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Kenar Boşluğu (Quiet Zone):</Text>
                <View style={styles.toggleRow}>
                  {[1, 2, 3, 4].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.miniOptionBtn,
                        config.margin === m && styles.miniOptionBtnActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, margin: m }))}
                    >
                      <Text
                        style={[
                          styles.miniOptionText,
                          config.margin === m && styles.miniOptionTextActive,
                        ]}
                      >
                        {m} Modül
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 4. SEKME: MERKEZİ LOGO & İKON */}
            {activeTab === 'logo' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>🏷️ Merkez Logo & İkon Rozeti</Text>
                <Text style={styles.blockSubtitle}>
                  Hata düzeltme toleransı sayesinde QR kodun ortasına logonuzu veya modül simgesini yerleştirin.
                </Text>

                {/* Logo Tipi */}
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, config.logoType === 'emoji' && styles.toggleBtnActive]}
                    onPress={() => setConfig((prev) => ({ ...prev, logoType: 'emoji' }))}
                  >
                    <Ionicons name="happy-outline" size={17} color={config.logoType === 'emoji' ? '#6366F1' : '#94A3B8'} />
                    <Text style={[styles.toggleBtnText, config.logoType === 'emoji' && styles.toggleBtnTextActive]}>
                      Hazır İkon
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, config.logoType === 'url' && styles.toggleBtnActive]}
                    onPress={() => setConfig((prev) => ({ ...prev, logoType: 'url' }))}
                  >
                    <Ionicons name="link-outline" size={17} color={config.logoType === 'url' ? '#6366F1' : '#94A3B8'} />
                    <Text style={[styles.toggleBtnText, config.logoType === 'url' && styles.toggleBtnTextActive]}>
                      Görsel Linki
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, config.logoType === 'none' && styles.toggleBtnActive]}
                    onPress={() => setConfig((prev) => ({ ...prev, logoType: 'none' }))}
                  >
                    <Ionicons name="close-circle-outline" size={17} color={config.logoType === 'none' ? '#6366F1' : '#94A3B8'} />
                    <Text style={[styles.toggleBtnText, config.logoType === 'none' && styles.toggleBtnTextActive]}>
                      Logosuz
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Hızlı İkon Seçicisi */}
                {config.logoType === 'emoji' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Modül & Marka İkonu Seçin:</Text>
                    <View style={styles.emojiGrid}>
                      {['👑', '💍', '🚗', '🐾', '💼', '🍽️', '⚡', '📍', '⭐', '❤️', '🔒', '☕'].map(
                        (emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            style={[
                              styles.emojiBtn,
                              config.logoEmoji === emoji && styles.emojiBtnActive,
                            ]}
                            onPress={() => setConfig((prev) => ({ ...prev, logoEmoji: emoji }))}
                          >
                            <Text style={styles.emojiText}>{emoji}</Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                )}

                {/* Görsel URL Girişi */}
                {config.logoType === 'url' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Logo Görseli URL Adresi (PNG/SVG):</Text>
                    <TextInput
                      style={styles.textInput}
                      value={config.logoUrl}
                      onChangeText={(val) => setConfig((prev) => ({ ...prev, logoUrl: val }))}
                      placeholder="https://example.com/logo.png"
                      placeholderTextColor="#64748B"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Logo Boyutu */}
                {config.logoType !== 'none' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.fieldLabel}>Logo Rozet Büyüklüğü:</Text>
                    <View style={styles.toggleRow}>
                      {[
                        { pct: 18, label: 'Kompakt (%18)' },
                        { pct: 22, label: 'Dengeli (%22 - Önerilen)' },
                        { pct: 26, label: 'Büyük (%26)' },
                      ].map((item) => (
                        <TouchableOpacity
                          key={item.pct}
                          style={[
                            styles.miniOptionBtn,
                            config.logoSizePercent === item.pct && styles.miniOptionBtnActive,
                          ]}
                          onPress={() => setConfig((prev) => ({ ...prev, logoSizePercent: item.pct }))}
                        >
                          <Text
                            style={[
                              styles.miniOptionText,
                              config.logoSizePercent === item.pct && styles.miniOptionTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 5. SEKME: ÇERÇEVE & ÇAĞRI ROZETİ */}
            {activeTab === 'frame' && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>🖼️ Çerçeve & Eylem Çağrısı (CTA)</Text>
                <Text style={styles.blockSubtitle}>
                  Kullanıcıları taramaya teşvik eden rozet ve yönlendirici başlık ekleyin.
                </Text>

                {/* Çerçeve Tipi */}
                <Text style={styles.fieldLabel}>Çerçeve Modu:</Text>
                <View style={styles.toggleRow}>
                  {[
                    { id: 'bottom_badge', label: 'Alt Rozet' },
                    { id: 'top_banner', label: 'Üst Banner' },
                    { id: 'none', label: 'Çerçevesiz' },
                  ].map((fr) => (
                    <TouchableOpacity
                      key={fr.id}
                      style={[
                        styles.toggleBtn,
                        config.frameStyle === fr.id && styles.toggleBtnActive,
                      ]}
                      onPress={() => setConfig((prev) => ({ ...prev, frameStyle: fr.id as QRFrameStyle }))}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          config.frameStyle === fr.id && styles.toggleBtnTextActive,
                        ]}
                      >
                        {fr.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Rozet Metni & Hızlı Şablonlar */}
                {config.frameStyle !== 'none' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>Rozet Başlık Metni:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={config.frameText}
                        onChangeText={(val) => setConfig((prev) => ({ ...prev, frameText: val }))}
                        placeholder="SCAN ME / MENÜYÜ GÖR"
                        placeholderTextColor="#64748B"
                      />
                    </View>

                    <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Hızlı Eylem Başlıkları:</Text>
                    <View style={styles.quickTagsRow}>
                      {[
                        'BENİ TARA 📸',
                        'MENÜYÜ GÖRÜN 🍽️',
                        'REHBERE EKLE 💼',
                        'İLETİŞİME GEÇ 🚗',
                        'KÜNYEYİ TARA 🐾',
                        'AYRICALIKLI ERİŞİM 👑',
                      ].map((tag) => (
                        <TouchableOpacity
                          key={tag}
                          style={styles.quickTagBtn}
                          onPress={() => setConfig((prev) => ({ ...prev, frameText: tag }))}
                        >
                          <Text style={styles.quickTagText}>{tag}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      flexWrap: 'wrap',
      gap: 12,
    },
    topBarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      gap: 6,
    },
    backBtnText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    titleGroup: {
      gap: 2,
    },
    topBarTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    topBarSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
      gap: 6,
    },
    svgActionBtn: {
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
    },
    hdActionBtn: {
      backgroundColor: colors.gold,
    },
    printActionBtn: {
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionBtnText: {
      color: isDark ? '#FFFFFF' : colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    toastContainer: {
      position: 'absolute',
      top: 72,
      alignSelf: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 8,
      zIndex: 999,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    toastText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    workspace: {
      flex: 1,
    },
    workspaceRow: {
      flexDirection: 'row',
    },
    workspaceCol: {
      flexDirection: 'column',
    },
    previewColumn: {
      padding: 20,
      gap: 20,
    },
    previewColumnDesktop: {
      width: 440,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    previewCard: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 16,
    },
    scoreBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#064E3B',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 6,
    },
    scoreDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },
    scoreText: {
      color: '#A7F3D0',
      fontSize: 11,
      fontWeight: '700',
    },
    formatBadge: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    canvasContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    mobileFallbackText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    previewActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    previewSubBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewSubBtnText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: '600',
    },
    presetsSection: {
      gap: 12,
    },
    presetsSectionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    presetsScroll: {
      flexDirection: 'row',
    },
    presetCard: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 12,
      width: 170,
      marginRight: 12,
      gap: 6,
    },
    presetBadge: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    presetName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    presetDesc: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
    presetColorPreview: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 4,
    },
    colorSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    controlsColumn: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    controlsColumnDesktop: {
      flex: 1,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      gap: 6,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabItemActive: {
      borderBottomColor: colors.gold,
      backgroundColor: isDark ? '#1E293B44' : '#F8FAFC',
    },
    tabItemText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    tabItemTextActive: {
      color: colors.gold,
      fontWeight: '700',
    },
    tabContentScroll: {
      flex: 1,
    },
    tabContentContainer: {
      padding: 24,
    },
    sectionBlock: {
      gap: 16,
    },
    blockTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    blockSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 4,
    },
    fieldLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    assetSelectorContainer: {
      gap: 8,
    },
    assetScroll: {
      flexDirection: 'row',
    },
    assetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      marginRight: 10,
      gap: 10,
      maxWidth: 220,
    },
    assetChipActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    assetChipIcon: {
      fontSize: 20,
    },
    assetChipTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    assetChipTitleActive: {
      color: colors.gold,
      fontWeight: '700',
    },
    assetChipUrl: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    inputGroup: {
      gap: 6,
    },
    textInput: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      fontSize: 14,
    },
    inputHelper: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    toggleBtn: {
      flex: 1,
      minWidth: 140,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      gap: 8,
    },
    toggleBtnActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    toggleBtnText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    toggleBtnTextActive: {
      color: colors.gold,
      fontWeight: '700',
    },
    paletteGrid: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    paletteCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    paletteCircleActive: {
      borderColor: colors.gold,
      transform: [{ scale: 1.15 }],
    },
    miniOptionBtn: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
    },
    miniOptionBtnActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    miniOptionText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    miniOptionTextActive: {
      color: colors.gold,
      fontWeight: '700',
    },
    bgOptionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    bgOptionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      gap: 8,
    },
    bgOptionCardActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    bgSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    bgOptionLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    shapeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    shapeCard: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 120,
      gap: 4,
    },
    shapeCardActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    shapeCardTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    shapeCardDesc: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    emojiBtn: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiBtnActive: {
      borderColor: colors.gold,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
    },
    emojiText: {
      fontSize: 22,
    },
    quickTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickTagBtn: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
    },
    quickTagText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    quickActionPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    quickActionText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.gold,
    },
    hexInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    hexPreviewSwatch: {
      width: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    hexTextInput: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      fontSize: 13,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
  });
}
