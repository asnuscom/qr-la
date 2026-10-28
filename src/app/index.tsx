import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PLAN_TIERS, DEMO_HOST_UID } from '@/services/mockData';
import { authService } from '@/services/authService';
import { UserModel } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { adminService, ModuleControlConfig, DEFAULT_MODULE_CONTROLS, PlatformModuleKey } from '@/services/adminService';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

type ModuleKey = 'wedding' | 'vehicle' | 'pet' | 'vcard' | 'menu';

interface ModuleConfig {
  key: ModuleKey;
  label: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  gradientBg: [string, string];
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  demoSlug: string;
  demoLabel: string;
  actionRoute: string;
  actionLabel: string;
  landingSlug: string;
  mockupImage: string;
  mockupTag: string;
}

const MODULES: Record<ModuleKey, ModuleConfig> = {
  wedding: {
    key: 'wedding',
    label: 'Düğün & Etkinlik',
    badge: 'Canlıda • En Popüler',
    icon: 'heart',
    accentColor: '#C5A059',
    gradientBg: ['#1F1A12', '#0F0E0C'],
    title: 'Düğün & Nikahta Masadaki Kodu QR’la, Anıları Canlı Topla',
    subtitle: 'Uygulama indirmeden masadaki karekodla yüksek çözünürlüklü misafir fotoğrafları dev ekrana yansısın.',
    description:
      'Misafirlerinizin çektiği yüzlerce eşsiz fotoğraf WhatsApp gruplarında kaybolmasın. Tek bir QR kodla tüm fotoğrafları toplayın, salondaki dev projeksiyonda canlı yayınlayın ve gece sonunda tek tıkla orijinal kalitede ZIP olarak indirin.',
    features: [
      '📱 Uygulama indirmek yok (kamera açılır açılmaz anında yükleme)',
      '📺 Salona özel canlı projeksiyon & TV slayt modu',
      '💌 Ziyaretçi dijital anı defteri ve tebrik mesajları',
      '📦 Tek tıkla orijinal yüksek çözünürlüklü ZIP arşiv indirme',
      '🔒 İsteğe bağlı PIN kodu koruması ve anlık moderasyon',
    ],
    demoSlug: '/samet-ve-sule',
    demoLabel: 'Örnek Düğünü Gör (Samet & Şule)',
    actionRoute: '/panel',
    actionLabel: 'Etkinlik QR’ı Oluştur',
    landingSlug: '/dugun',
    mockupImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '💍 Sait Halim Paşa Yalısı • 42 Canlı Fotoğraf',
  },
  vehicle: {
    key: 'vehicle',
    label: 'Araç & Park Tagı',
    badge: 'Yeni • Hayat Kurtaran',
    icon: 'car-sport',
    accentColor: '#0284C7',
    gradientBg: ['#041525', '#060B12'],
    title: 'Araç Camında Numaranı Gizle, WhatsApp ile İletişime Geçilsin',
    subtitle: 'Numaranızı cama yazıp ifşa etmeyin! Kaza ve park anında tek dokunuşla akıllı iletişim.',
    description:
      'Ön camınıza yapıştıracağınız güneşte solmayan akıllı QR sticker ile telefon numaranız gizlenir; ziyaretçiler tek tıkla hazır şablon mesajlarla ("Farlarınız açık kaldı", "Aracınızı çeker misiniz?") WhatsApp üzerinden size ulaşır. Kaza ve acil durumlarda kan grubunuz ve acil durum kişiniz ilk yardım ekipleri için hayat kurtarır.',
    features: [
      '🔒 Gizli numara maskeleme (telefonunuz yabancılara açıkça gösterilmez)',
      '🩸 Hayati acil durum kan grubu rozeti ve tek tıkla yakını arama butonu',
      '🎨 20+ Marka renk teması (Honda, Yamaha, BMW, Mercedes, KTM vb.)',
      '💬 Tek tıkla hazır WhatsApp durum mesajları ("Farlar açık", "Aracı alabilir misiniz?")',
      '🏷️ Yazdırılabilir ön cam sticker şablonu veya UV korumalı fiziksel sticker',
    ],
    demoSlug: '/34abc123',
    demoLabel: 'Örnek Araç Tagını Gör (34 ABC 123)',
    actionRoute: '/panel/arac',
    actionLabel: 'Araç QR’ı Oluştur',
    landingSlug: '/otomobil',
    mockupImage:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🏍️ Honda CBR 650R • 34 ABC 123 • A Rh+',
  },
  pet: {
    key: 'pet',
    label: 'Pati Künyesi (Petguru)',
    badge: 'Kayıp Takibi & GPS',
    icon: 'paw',
    accentColor: '#10B981',
    gradientBg: ['#021B12', '#050E0A'],
    title: 'Kaybolan Dostunuz İçin Anlık GPS Konumu Bildiren Akıllı Künye',
    subtitle: 'Künye okutulduğu anda bulan kişi size tek tıkla ulaşsın, telefonunuza harita konumu gelsin.',
    description:
      'Petguru iş birliği ile metal lazer kazımalı paslanmaz çelik tasma künyeleri için ultra kısa link formatı! Tasmadaki kod kamerayla okutulduğunda bulan kişiden anlık GPS konumu alınır, sahibe SMS/Push bildirimi gider ve dijital aşı karnesi tek ekranda açılır.',
    features: [
      '📍 Bulan kişi tarattığı anda sahibine anlık harita & GPS bildirimi',
      '🚨 Tek tıkla Acil Kayıp Hayvan Alarmı ve ödül ilanı sayfası',
      '💉 Dijital sağlık ve aşı karnesi (alerjiler, çip no, veteriner telefonu)',
      '🐕 Ultra kısa link formatı (küçük metal künyelerde karanlıkta bile 1 saniyede okunur)',
      '🏷️ Lazer kazımalı paslanmaz çelik dayanıklı fiziksel künye',
    ],
    demoSlug: '/p/duman',
    demoLabel: 'Örnek Pati Künyesini Gör (Duman)',
    actionRoute: '/panel/pati',
    actionLabel: 'Pati Künyesi Oluştur',
    landingSlug: '/pati',
    mockupImage:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🐾 Duman • Golden Retriever • Kadıköy • Kuduz/Karma Güncel',
  },
  vcard: {
    key: 'vcard',
    label: 'Dijital Kartvizit',
    badge: 'vCard & NFC Kart',
    icon: 'briefcase',
    accentColor: '#8B5CF6',
    gradientBg: ['#170A26', '#090510'],
    title: 'Kağıt Kartvizitleri Çöpe Atın, Tek Tıkla Telefon Rehberine Kaydolun',
    subtitle: 'Kişisel profilinizi, sosyal medya hesaplarınızı ve IBAN bilgilerinizi tek dokunuşla paylaşın.',
    description:
      'İş toplantılarında veya fuarlarda kamerayla QR okutarak ya da lüks mat siyah NFC kartınızı telefona dokundurarak tüm bilgilerinizi aktarın. Karşı taraf hiçbir şey yazmadan doğrudan "Rehbere Kaydet" (.vcf) butonuna basarak tüm bilgilerinizi telefonuna eklesin.',
    features: [
      '📇 Tek dokunuşla tüm telefon rehberine kayıt (.vcf dosyası)',
      '🔗 LinkedIn, Instagram, WhatsApp, Web Sitesi ve Portfolyo bağlantıları',
      '💳 Hızlı ödemeler için tek tıkla kopyalanabilir IBAN ve banka kartları',
      '📡 Lüks mat siyah lazer baskılı NFC temassız akıllı kartvizit seçeneği',
      '🔄 İstediğiniz an bilgilerini ücretsiz güncelleme (kartı yeniden basmak yok)',
    ],
    demoSlug: '/samet-sunman',
    demoLabel: 'Örnek Dijital Kartviziti Gör (Samet Sunman)',
    actionRoute: '/panel/kartvizit',
    actionLabel: 'Dijital Kartvizitini Oluştur',
    landingSlug: '/kartvizit',
    mockupImage:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '💼 Samet Sunman • Kurucu & Kıdemli Yazılım Mimarı • Asnus',
  },
  menu: {
    key: 'menu',
    label: 'Restoran Menü QR',
    badge: 'Kafe & Restoran',
    icon: 'restaurant',
    accentColor: '#F59E0B',
    gradientBg: ['#1E1202', '#0A0702'],
    title: 'Masanızdan Anlık Güncellenen, Fotoğraflı Dijital QR Menü',
    subtitle: 'Kağıt menü baskı maliyetine son! Fiyatları ve görselleri panelden saniyeler içinde değiştirin.',
    description:
      'Restoran, kafe, bar ve oteller için temassız dijital menü. Misafirleriniz masadaki karekodla kategori sekmelerini gezsin, fotoğrafları ve alerjen etiketlerini incelesin. Garson çağırma ve çoklu dil (Türkçe, İngilizce) desteğiyle cironuzu artırın.',
    features: [
      '⚡ Anlık fiyat ve ürün güncelleme (yeni menü basma masrafı sıfır)',
      '📸 Yüksek çözünürlüklü iştah açıcı ürün fotoğrafları ve açıklamaları',
      '🥜 Detaylı alerjen ve kalori etiketleri',
      '🌍 Yabancı turistler için otomatik çoklu dil desteği',
      '📊 Hangi masanın hangi ürünü incelediğini gösteren sipariş analitiği',
    ],
    demoSlug: '/m/lucca-bistrot',
    demoLabel: 'Örnek Menüyü İncele (Lucca Bistrot)',
    actionRoute: '/panel/menu',
    actionLabel: 'Restoran Menünü Oluştur',
    landingSlug: '/menu',
    mockupImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🍽️ Lucca Bistrot & Cocktail Bar • Şefin İmza Menüsü',
  },
};

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isMobile = width <= 768;
  const isSmallPhone = width < 390;
  const { colors } = useTheme();

  const [activeModule, setActiveModule] = useState<ModuleKey>('wedding');
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'QR-la | Tek Bir Dinamik QR Kodla Hayatı Kolaylaştır, İletişime Geç & Kutla';

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        'Uygulama indirmeden tek bir dinamik QR kodla; düğünde misafir fotoğraflarını topla ve slaytta yayınla, araç camında numaranı gizleyerek iletişime geç, evcil hayvanını koru, kartvizitini tek tıkla rehbere kaydettir.'
      );
    }
  }, []);

  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  const isUserLoggedIn = Boolean(currentUser && currentUser.uid !== DEMO_HOST_UID);
  const selectedConfig = MODULES[activeModule];

  const handleStartNow = () => {
    if (isUserLoggedIn) {
      if (activeModule === 'vehicle') router.push('/panel/arac' as any);
      else if (activeModule === 'pet') router.push('/panel/pati' as any);
      else if (activeModule === 'vcard') router.push('/panel/kartvizit' as any);
      else if (activeModule === 'menu') router.push('/panel/menu' as any);
      else router.push('/panel' as any);
    } else {
      router.push({ pathname: '/giris', params: { tab: 'register' } } as any);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <Head>
        <title>QR-la | Tek Bir Dinamik QR Kodla Hayatı Kolaylaştır, İletişime Geç &amp; Kutla</title>
        <meta
          name="description"
          content="Uygulama indirtmeden tek bir dinamik QR kodla; düğünde misafir fotoğraflarını topla, araç camında numaranı gizleyerek iletişime geç, evcil hayvanını koru, kartvizitini rehbere kaydettir."
        />
        <meta
          name="keywords"
          content="qr-la, karekod fotoğraf toplama, düğün karekod fotoğraf, araç camı qr kod, park sticker qr, gizli numara araç qr, petguru evcil hayvan künye, dijital kartvizit vcard nfc, restoran menü qr"
        />
        <meta property="og:title" content="QR-la | Çok Modüllü Dinamik QR Ekosistemi" />
        <meta
          property="og:description"
          content="Uygulama indirtmeden tek bir QR kodla anıları toplayın, araç camında güvenle iletişime geçin, kartvizitinizi rehbere kaydettirin."
        />
        <meta property="og:url" content="https://qr-la.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://qr-la.com/og-banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QR-la | Çok Modüllü Dinamik QR Ekosistemi" />
        <meta
          name="twitter:description"
          content="Uygulama indirtmeden tek bir QR kodla anıları toplayın, araç camında güvenle iletişime geçin, kartvizitinizi rehbere kaydettirin."
        />
        <meta name="twitter:image" content="https://qr-la.com/og-banner.png" />
        <link rel="canonical" href="https://qr-la.com" />
      </Head>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Navigation Bar */}
        <View
          style={[
            styles.navbar,
            isMobile && styles.navbarMobile,
            { backgroundColor: colors.navBg, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.logoRow}>
            <View style={[styles.logoIcon, { backgroundColor: colors.goldBg, borderColor: colors.border }]}>
              <Ionicons name="qr-code" size={isMobile ? 18 : 20} color="#C5A059" />
            </View>
            <Text style={[styles.logoText, isMobile && styles.logoTextMobile, { color: colors.text }]}>
              QR<Text style={{ color: '#C5A059' }}>-la</Text>
            </Text>
            <View style={styles.platformBadge}>
              <Text style={styles.platformBadgeText}>PLATFORM</Text>
            </View>
          </View>

          <View style={[styles.navActions, isMobile && styles.navActionsMobile]}>
            <ThemeToggleBtn size="sm" />

            {isUserLoggedIn ? (
              <TouchableOpacity
                style={styles.navPanelBtn}
                onPress={() => router.push('/panel' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="shield-checkmark" size={15} color="#FFF" />
                <Text style={styles.navPanelBtnText}>
                  {isSmallPhone ? 'Panel' : 'Yönetim Paneli'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.navLinkBtn}
                  onPress={() => router.push({ pathname: '/giris', params: { tab: 'login' } } as any)}
                >
                  <Text style={[styles.navLinkText, { color: colors.text }]}>Giriş</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navRegisterBtn, isSmallPhone && styles.navRegisterBtnCompact]}
                  onPress={() => router.push({ pathname: '/giris', params: { tab: 'register' } } as any)}
                >
                  <Text style={styles.navRegisterBtnText}>
                    {isSmallPhone ? 'Kayıt' : 'Ücretsiz Başla'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.demoHeaderBtn,
                    isSmallPhone && styles.demoHeaderBtnCompact,
                    { backgroundColor: colors.cardMuted, borderColor: colors.border },
                  ]}
                  onPress={() => router.push('/panel' as any)}
                >
                  <Text style={styles.demoHeaderBtnText}>Demo Paneli</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile]}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color="#C5A059" />
            <Text style={[styles.heroBadgeText, isMobile && styles.heroBadgeTextMobile]}>
              FİZİKSEL DÜNYAYI DİJİTAL DÜNYAYA BAĞLAYAN DİNAMİK QR EKOSİSTEMİ
            </Text>
          </View>

          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
            Tek Bir Dinamik QR Kodla{'\n'}
            <Text style={styles.highlightText}>Hayatı Kolaylaştır</Text>, İletişime Geç &amp; Kutla
          </Text>

          <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
            Uygulama indirtmeden saniyeler içinde; düğünde misafir fotoğraflarını topla, araç camında numaranı gizleyerek WhatsApp'tan iletişime geç, evcil hayvanını kaybolmaya karşı koru, kartvizitini rehbere kaydettir.
          </Text>

          {/* Action CTAs */}
          <View style={[styles.ctaRow, isMobile && styles.ctaRowMobile]}>
            <TouchableOpacity
              style={[styles.primaryCta, isMobile && styles.ctaBtnMobile]}
              onPress={handleStartNow}
              activeOpacity={0.88}
            >
              <Ionicons name="sparkles" size={18} color="#FFF" />
              <Text style={styles.primaryCtaText}>Hemen Ücretsiz QR Oluştur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryCta, isMobile && styles.ctaBtnMobile]}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="play-circle" size={18} color="#1A1817" />
              <Text style={styles.secondaryCtaText}>Canlı Demoyu Dene</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={[styles.trustBadgesRow, isMobile && styles.trustBadgesRowMobile]}>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.trustBadgeText}>Uygulama İndirmek Yok</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={15} color="#0284C7" />
              <Text style={styles.trustBadgeText}>Gizli Numara Maskeleme</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="flash" size={15} color="#EAB308" />
              <Text style={styles.trustBadgeText}>1 Saniyede Hızlı Okuma</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="cube" size={15} color="#C5A059" />
              <Text style={styles.trustBadgeText}>Lüks Fiziksel Baskı Seçeneği</Text>
            </View>
          </View>
        </View>

        {/* Interactive Multi-Module Hub Section */}
        <View style={[styles.hubSection, isMobile && styles.hubSectionMobile]}>
          <View style={styles.hubHeader}>
            <Text style={styles.sectionOverline}>QR-LA MODÜLLERİ</Text>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
              Tek Platform, Sınırsız Kullanım Alanı
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile]}>
              İhtiyacınıza uygun modüle tıklayarak arayüzünü ve canlı demosunu anında inceleyin:
            </Text>
          </View>

          {/* Module Selector Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
            style={styles.tabsScrollView}
          >
            {visibleModules.map((mod) => {
              const isSelected = activeModule === mod.key;
              return (
                <TouchableOpacity
                  key={mod.key}
                  style={[
                    styles.moduleTab,
                    isSelected && {
                      backgroundColor: mod.accentColor,
                      borderColor: mod.accentColor,
                    },
                  ]}
                  onPress={() => setActiveModule(mod.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={mod.icon}
                    size={17}
                    color={isSelected ? '#FFFFFF' : '#4B5563'}
                  />
                  <Text style={[styles.moduleTabText, isSelected && styles.moduleTabTextActive]}>
                    {mod.label}
                  </Text>
                  {mod.badge && (
                    <View
                      style={[
                        styles.tabBadge,
                        isSelected
                          ? { backgroundColor: 'rgba(255,255,255,0.25)' }
                          : { backgroundColor: '#FAF7F2' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          isSelected && { color: '#FFF' },
                        ]}
                      >
                        {mod.badge.split('•')[0].trim()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Active Module Showcase Card */}
          <View
            style={[
              styles.showcaseCard,
              {
                backgroundColor: selectedConfig.gradientBg[0],
                borderColor: selectedConfig.accentColor,
              },
            ]}
          >
            <View style={[styles.showcaseGrid, isDesktop ? styles.showcaseGridDesktop : styles.showcaseGridMobile]}>
              {/* Left Column: Info, Features & CTAs */}
              <View style={styles.showcaseLeftCol}>
                <View style={[styles.showcaseBadge, { backgroundColor: `${selectedConfig.accentColor}25` }]}>
                  <Ionicons name={selectedConfig.icon} size={14} color={selectedConfig.accentColor} />
                  <Text style={[styles.showcaseBadgeText, { color: selectedConfig.accentColor }]}>
                    {selectedConfig.badge.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.showcaseTitle}>{selectedConfig.title}</Text>
                <Text style={styles.showcaseSub}>{selectedConfig.subtitle}</Text>
                <Text style={styles.showcaseDesc}>{selectedConfig.description}</Text>

                {/* Features List */}
                <View style={styles.showcaseFeaturesList}>
                  {selectedConfig.features.map((feat, i) => (
                    <View key={i} style={styles.showcaseFeatureItem}>
                      <Ionicons name="checkmark-circle" size={17} color={selectedConfig.accentColor} />
                      <Text style={styles.showcaseFeatureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Module Action Buttons */}
                <View style={styles.showcaseActionRow}>
                  <TouchableOpacity
                    style={[styles.showcaseMainBtn, { backgroundColor: selectedConfig.accentColor }]}
                    onPress={() => router.push(selectedConfig.actionRoute as any)}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="sparkles" size={17} color="#FFF" />
                    <Text style={styles.showcaseMainBtnText}>{selectedConfig.actionLabel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.showcaseDemoBtn}
                    onPress={() => router.push(selectedConfig.demoSlug as any)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="eye-outline" size={17} color="#FFF" />
                    <Text style={styles.showcaseDemoBtnText}>{selectedConfig.demoLabel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.showcaseLandingBtn, { borderColor: selectedConfig.accentColor }]}
                    onPress={() => router.push(selectedConfig.landingSlug as any)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="information-circle-outline" size={17} color={selectedConfig.accentColor} />
                    <Text style={[styles.showcaseLandingBtnText, { color: selectedConfig.accentColor }]}>
                      Detay & Fiyatlar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Right Column: Visual Mockup Card */}
              <View style={styles.showcaseRightCol}>
                <View style={styles.mockupFrame}>
                  <Image
                    source={{ uri: selectedConfig.mockupImage }}
                    style={styles.mockupFrameImage}
                    resizeMode="cover"
                  />
                  <View style={styles.mockupFrameOverlay}>
                    <View style={styles.mockupPillBadge}>
                      <View style={[styles.mockupPillDot, { backgroundColor: selectedConfig.accentColor }]} />
                      <Text style={styles.mockupPillText}>Canlıda Aktif</Text>
                    </View>
                    <Text style={styles.mockupFrameCaption}>{selectedConfig.mockupTag}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Phygital Products Showcase Section */}
        <View style={[styles.phygitalSection, isMobile && styles.phygitalSectionMobile]}>
          <View style={styles.phygitalHeader}>
            <Text style={styles.sectionOverline}>PHYGITAL DEĞER TEKLİFİ</Text>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: '#FFF' }]}>
              Dijital Kolaylık + Lüks Fiziksel Baskı Kalitesi
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: '#9CA3AF' }]}>
              İster sadece QR kodunuzu ücretsiz üretip kendi yazıcınızdan bastırın; isterseniz kapınıza kadar teslim edilen yüksek kaliteli UV cam sticker'ı, pleksi masa standı veya metal künye ile deneyimi taçlandırın.
            </Text>
          </View>

          <View style={[styles.phygitalGrid, isDesktop ? styles.phygitalGridDesktop : styles.phygitalGridMobile]}>
            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                <Ionicons name="car-outline" size={26} color="#38BDF8" />
              </View>
              <Text style={styles.phygitalCardTitle}>UV Korumalı Ön Cam Sticker'ı</Text>
              <Text style={styles.phygitalCardDesc}>
                Güneşte solmayan, söküldüğünde iz bırakmayan özel otomobil ve motosiklet sticker baskısı. Yağmura ve yıkamaya %100 dayanıklı.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>🚗 Araç &amp; Motosiklet</Text>
              </View>
            </View>

            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                <Ionicons name="wine-outline" size={26} color="#C5A059" />
              </View>
              <Text style={styles.phygitalCardTitle}>Altın Yaldızlı Pleksi Masa Standı</Text>
              <Text style={styles.phygitalCardDesc}>
                Düğün, nikah ve kurumsal davet masalarına yakışan lüks akrilik / pleksi ayaklı masa kartları. Misafirleriniz dokunmaktan keyif alır.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>💍 Düğün &amp; Davet</Text>
              </View>
            </View>

            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Ionicons name="paw-outline" size={26} color="#34D399" />
              </View>
              <Text style={styles.phygitalCardTitle}>Lazer Kazımalı Çelik Tasma Künyesi</Text>
              <Text style={styles.phygitalCardDesc}>
                Silinmeyen derin lazer kazımalı paslanmaz çelik tasma künyesi. Yağmurda, çamurda ve suda asla paslanmaz ve solmaz.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>🐾 Petguru x QR-la</Text>
              </View>
            </View>

            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Ionicons name="card-outline" size={26} color="#A78BFA" />
              </View>
              <Text style={styles.phygitalCardTitle}>Mat Siyah Temassız NFC Kartvizit</Text>
              <Text style={styles.phygitalCardDesc}>
                Telefona yaklaştırdığınız anda profilinizi açan akıllı NFC çipli şık kartvizit. Kağıt kartvizitleri çöpe atın.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>💼 Dijital Kartvizit</Text>
              </View>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>NASIL ÇALIŞIR?</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            3 Adımda Zahmetsiz Deneyim
          </Text>

          <View style={[styles.stepsGrid, isDesktop ? styles.stepsGridDesktop : styles.stepsGridMobile]}>
            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="create-outline" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Modülünü Seç &amp; QR Üret</Text>
              <Text style={styles.stepDesc}>
                Düğün, araç veya kartvizit modülünden birini seçin; bilgilerinizi ve tema renginizi belirleyip saniyeler içinde dinamik QR kodunuzu oluşturun.
              </Text>
            </View>

            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="print-outline" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Yazdır veya Fiziksel Baskı Al</Text>
              <Text style={styles.stepDesc}>
                Ücretsiz PDF şablonunu anında yazdırabilir veya UV korumalı cam sticker'ı, lüks pleksi masa standı ve lazer künye siparişi verebilirsiniz.
              </Text>
            </View>

            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="camera-outline" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Tek Dokunuşta Kamera Okusun</Text>
              <Text style={styles.stepDesc}>
                Karşı taraf hiçbir uygulama indirmeden yalnızca telefon kamerasını tutarak fotoğraflarını yükler, WhatsApp'tan yazar veya rehberine kaydeder.
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Packages Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>KOTA &amp; TARİFELER</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            Şeffaf ve Esnek Paketler
          </Text>
          <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile]}>
            Tüm modüllerde ücretsiz başlayabilir, dilediğiniz zaman tek tıkla depolamanızı veya fiziksel baskı özelliklerinizi yükseltebilirsiniz.
          </Text>

          <View style={[styles.plansGrid, isDesktop ? styles.plansGridDesktop : styles.plansGridMobile]}>
            {PLAN_TIERS.map((tier) => (
              <View
                key={tier.tier}
                style={[
                  styles.planCard,
                  !isDesktop && styles.planCardMobile,
                  tier.isPopular && styles.planCardPopular,
                ]}
              >
                {tier.isPopular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="star" size={11} color="#FFF" />
                    <Text style={styles.popularBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
                  </View>
                )}

                <Text style={styles.planName}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>
                    {tier.priceTL === 0 ? 'Ücretsiz' : `${tier.priceTL.toLocaleString('tr-TR')} ₺`}
                  </Text>
                  {tier.priceTL > 0 && <Text style={styles.pricePeriod}>/ etkinlik</Text>}
                </View>

                <View style={styles.planQuotaBadge}>
                  <Ionicons name="cloud" size={14} color="#C5A059" />
                  <Text style={styles.planQuotaText}>
                    {tier.quotaMB >= 1024 ? `${tier.quotaMB / 1024} GB` : `${tier.quotaMB} MB`} Depolama
                  </Text>
                  <Text style={styles.planDaysText}>• {tier.retentionDays} Gün Arşiv</Text>
                </View>

                <View style={styles.featuresList}>
                  {tier.features.map((feat, i) => (
                    <View key={i} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.featureItemText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.planBtn, tier.isPopular && styles.planBtnPopular]}
                  onPress={handleStartNow}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.planBtnText, tier.isPopular && styles.planBtnTextPopular]}>
                    {tier.priceTL === 0 ? 'Hemen Başla' : 'Bu Paketi Seç'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>SIKÇA SORULAN SORULAR</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            Aklınıza Takılan Her Şey
          </Text>

          <View style={styles.faqList}>
            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Misafirlerin veya sürücülerin uygulama indirmesi gerekir mi?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Hayır! QR-la'nın en büyük gücü web tabanlı (PWA/web app) olmasıdır. Misafir telefonunun kamerasını karekoda tuttuğu anda doğrudan tarayıcı açılır ve hiçbir kayıt veya indirme gerekmeden işlem tamamlanır.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Araç camındaki QR kodda telefon numaram başkaları tarafından görülür mü?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Varsayılan olarak "Gizli Numara Modu" aktiftir. Numaranız yabancı kişilere açıkça gösterilmez; iletişim doğrudan WhatsApp hazır mesaj şablonu üzerinden şifreli olarak kurulur.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Düğün bittikten sonra misafir fotoğraflarını nasıl indirebilirim?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Ev sahibi yönetim panelinizdeki "ZIP İndir" butonuna basarak tüm orijinal fotoğrafları tek bir arşiv dosyası halinde bilgisayarınıza veya telefonunuza orijinal kalitesinde indirebilirsiniz.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Fiziksel ürünler (cam sticker'ı, pleksi stand) ne kadar sürede teslim edilir?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Sipariş verilen fiziksel ürünler 1 iş günü içerisinde UV baskı / lazer kazıma işleminden geçerek Türkiye'nin her yerine kargo ile 2-3 iş günü içerisinde teslim edilir.
              </Text>
            </View>
          </View>
        </View>

        {/* Global Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="qr-code" size={18} color="#C5A059" />
              </View>
              <Text style={styles.logoText}>
                QR<Text style={{ color: '#C5A059' }}>-la</Text>
              </Text>
            </View>
            <Text style={styles.footerBrandDesc}>
              Fiziksel dünyadaki etiket ve kartları dijital mikro web uygulamalarına bağlayan akıllı QR ekosistemi.
            </Text>
          </View>

          <View style={styles.footerLinksGrid}>
            {visibleModules.map((mod) => (
              <TouchableOpacity key={mod.key} onPress={() => setActiveModule(mod.key)}>
                <Text style={styles.footerLink}>{mod.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.footerDivider} />
          <Text style={styles.footerCopy}>
            &copy; 2026 QR-la Platformu. Tüm hakları saklıdır.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
  },
  navbarMobile: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1817',
    letterSpacing: -0.5,
  },
  logoTextMobile: {
    fontSize: 20,
  },
  platformBadge: {
    backgroundColor: '#1A1817',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  platformBadgeText: {
    color: '#C5A059',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navActionsMobile: {
    gap: 6,
  },
  navLinkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  navRegisterBtn: {
    backgroundColor: '#1A1817',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navRegisterBtnCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navRegisterBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  navPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navPanelBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  demoHeaderBtn: {
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  demoHeaderBtnCompact: {
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  demoHeaderBtnText: {
    color: '#8A6D3B',
    fontSize: 12,
    fontWeight: '700',
  },
  heroSection: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  heroSectionMobile: {
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  heroBadgeTextMobile: {
    fontSize: 10,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1A1817',
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 18,
  },
  heroTitleMobile: {
    fontSize: 28,
    lineHeight: 36,
  },
  highlightText: {
    color: '#C5A059',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 720,
    marginBottom: 30,
  },
  heroSubtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  ctaRowMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
  },
  ctaBtnMobile: {
    width: '100%',
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1817',
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryCtaText: {
    color: '#1A1817',
    fontSize: 14,
    fontWeight: '700',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  trustBadgesRowMobile: {
    gap: 8,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  hubSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
  },
  hubSectionMobile: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  hubHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionOverline: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C5A059',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1817',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  sectionHeadingMobile: {
    fontSize: 24,
  },
  sectionSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 680,
  },
  sectionSubMobile: {
    fontSize: 13,
    lineHeight: 20,
  },
  tabsScrollView: {
    marginBottom: 20,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  moduleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  moduleTabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C5A059',
  },
  showcaseCard: {
    borderRadius: 28,
    borderWidth: 2,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  showcaseGrid: {
    width: '100%',
  },
  showcaseGridDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  showcaseGridMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  showcaseLeftCol: {
    flex: 1.1,
  },
  showcaseRightCol: {
    flex: 0.9,
  },
  showcaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 14,
  },
  showcaseBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  showcaseTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 10,
  },
  showcaseSub: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  showcaseDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  showcaseFeaturesList: {
    gap: 10,
    marginBottom: 24,
  },
  showcaseFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  showcaseFeatureText: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  showcaseActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  showcaseMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  showcaseMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  showcaseDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  showcaseDemoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  showcaseLandingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  showcaseLandingBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mockupFrame: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    aspectRatio: 1.1,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  mockupFrameImage: {
    width: '100%',
    height: '100%',
  },
  mockupFrameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  mockupPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  mockupPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mockupPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  mockupFrameCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  phygitalSection: {
    backgroundColor: '#0F172A',
    paddingVertical: 56,
    paddingHorizontal: 24,
    width: '100%',
  },
  phygitalSectionMobile: {
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  phygitalHeader: {
    alignItems: 'center',
    marginBottom: 36,
    maxWidth: 820,
    alignSelf: 'center',
  },
  phygitalGrid: {
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
  },
  phygitalGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  phygitalGridMobile: {
    flexDirection: 'column',
    gap: 14,
  },
  phygitalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    flex: 1,
    minWidth: 260,
  },
  phygitalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  phygitalCardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  phygitalCardDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  phygitalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phygitalBadgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 50,
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  sectionMobile: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  stepsGrid: {
    width: '100%',
    marginTop: 24,
  },
  stepsGridDesktop: {
    flexDirection: 'row',
    gap: 20,
  },
  stepsGridMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  stepCardMobile: {
    padding: 20,
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8A6D3B',
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  plansGrid: {
    width: '100%',
    marginTop: 28,
  },
  plansGridDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'stretch',
  },
  plansGridMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 3,
    position: 'relative',
  },
  planCardMobile: {
    padding: 20,
  },
  planCardPopular: {
    borderColor: '#C5A059',
    backgroundColor: '#FFFFFE',
    shadowColor: '#C5A059',
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C5A059',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginTop: 8,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 16,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1817',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  planQuotaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5EA',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
  },
  planQuotaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D3B',
  },
  planDaysText: {
    fontSize: 11,
    color: '#6B7280',
  },
  featuresList: {
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureItemText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    flex: 1,
  },
  planBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DA',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  planBtnPopular: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  planBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1817',
  },
  planBtnTextPopular: {
    color: '#FFFFFF',
  },
  faqList: {
    width: '100%',
    maxWidth: 860,
    gap: 14,
    marginTop: 20,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1817',
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    paddingLeft: 30,
  },
  footer: {
    backgroundColor: '#111827',
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  footerBrandRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  footerBrandDesc: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 480,
    marginTop: 10,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 28,
  },
  footerLink: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  footerDivider: {
    width: '100%',
    maxWidth: 860,
    height: 1,
    backgroundColor: '#1E293B',
    marginBottom: 20,
  },
  footerCopy: {
    color: '#64748B',
    fontSize: 12,
  },
});
