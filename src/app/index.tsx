import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'qrcode';
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
  statLabel: string;
  statValue: string;
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
      '📱 Sıfır uygulama indirme (kamera açılır açılmaz anında yükleme)',
      '📺 Salona özel canlı projeksiyon & dev ekran TV slayt modu',
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
    mockupTag: '💍 Sait Halim Paşa Yalısı • 48 Canlı Fotoğraf',
    statLabel: 'Yüklenen Fotoğraf',
    statValue: '148.200+',
  },
  vehicle: {
    key: 'vehicle',
    label: 'Araç & Park Tagı',
    badge: 'Gizlilik • Güvenli İletişim',
    icon: 'car-sport',
    accentColor: '#0284C7',
    gradientBg: ['#041525', '#060B12'],
    title: 'Araç Camında Numaranı Gizle, WhatsApp ile İletişime Geçilsin',
    subtitle: 'Numaranızı cama yazıp ifşa etmeyin! Kaza ve park anında tek dokunuşla akıllı iletişim.',
    description:
      'Ön camınıza yapıştıracağınız güneşte solmayan akıllı QR sticker ile telefon numaranız gizlenir; ziyaretçiler tek tıkla hazır şablon mesajlarla ("Farlarınız açık kaldı", "Aracınızı çeker misiniz?") WhatsApp üzerinden size ulaşır. Kaza ve acil durumlarda kan grubunuz ilk yardım ekipleri için hayat kurtarır.',
    features: [
      '🔒 Gizli numara maskeleme (telefonunuz yabancılara açıkça gösterilmez)',
      '🩸 Hayati acil durum kan grubu rozeti ve tek tıkla yakını arama butonu',
      '🎨 20+ Marka renk teması (Honda, Yamaha, BMW, Mercedes vb.)',
      '💬 Tek tıkla hazır WhatsApp durum mesajları',
      '🏷️ Güneşte solmayan UV korumalı çizilmez ön cam stickerı',
    ],
    demoSlug: '/34abc123',
    demoLabel: 'Örnek Araç Tagını Gör (34 ABC 123)',
    actionRoute: '/panel/arac',
    actionLabel: 'Araç QR’ı Oluştur',
    landingSlug: '/otomobil',
    mockupImage:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🏍️ Honda CBR 650R • 34 ABC 123 • A Rh+',
    statLabel: 'Gizli İletişim',
    statValue: '28.500+',
  },
  pet: {
    key: 'pet',
    label: 'Pati Künyesi (Petguru)',
    badge: 'GPS & Kayıp Takibi',
    icon: 'paw',
    accentColor: '#10B981',
    gradientBg: ['#021B12', '#050E0A'],
    title: 'Kaybolan Dostunuz İçin Anlık GPS Konumu Bildiren Akıllı Künye',
    subtitle: 'Künye okutulduğu anda bulan kişi size tek tıkla ulaşsın, telefonunuza harita konumu gelsin.',
    description:
      'Petguru iş birliği ile metal lazer kazımalı paslanmaz çelik tasma künyeleri için akıllı sistem! Tasmadaki kod kamerayla okutulduğunda bulan kişinin onaylı anlık GPS konumu Petguru altyapısına iletilir, sahibe anlık bildirim gider ve dijital aşı karnesi tek ekranda açılır.',
    features: [
      '📍 Bulan kişi tarattığı anda sahibine anlık harita & GPS bildirimi',
      '🚨 Tek tıkla Acil Kayıp Hayvan Alarmı ve ödül ilanı sayfası',
      '💉 Dijital sağlık ve aşı karnesi (alerjiler, çip no, veteriner telefonu)',
      '🐕 Ultra kısa dinamik format (karanlıkta bile saniyede okunur)',
      '🏷️ Lazer kazımalı paslanmaz çelik dayanıklı fiziksel künye',
    ],
    demoSlug: '/p/duman',
    demoLabel: 'Örnek Pati Künyesini Gör (Duman)',
    actionRoute: '/panel/pati',
    actionLabel: 'Pati Künyesi Oluştur',
    landingSlug: '/pati',
    mockupImage:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🐾 Duman • Golden Retriever • Kadıköy • Aşıları Tam',
    statLabel: 'Güvencede Olan Pati',
    statValue: '12.400+',
  },
  vcard: {
    key: 'vcard',
    label: 'Dijital Kartvizit',
    badge: 'vCard & NFC',
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
      '🔄 İstediğiniz an bilgileri ücretsiz güncelleme (kartı yeniden basmak yok)',
    ],
    demoSlug: '/samet-sunman',
    demoLabel: 'Örnek Dijital Kartviziti Gör (Samet Sunman)',
    actionRoute: '/panel/kartvizit',
    actionLabel: 'Dijital Kartvizitini Oluştur',
    landingSlug: '/kartvizit',
    mockupImage:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '💼 Samet Sunman • Senior Software Architect • Asnus',
    statLabel: 'Rehbere Kayıt',
    statValue: '45.000+',
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
      'Restoran, kafe, bar ve oteller için temassız dijital menü. Misafirleriniz masadaki karekodla kategori sekmelerini gezsin, fotoğrafları ve alerjen etiketlerini incelesin. Garson çağırma ve çoklu dil desteğiyle işletmenizin verimliliğini artırın.',
    features: [
      '⚡ Anlık fiyat ve ürün güncelleme (yeni menü basma masrafı sıfır)',
      '📸 Yüksek çözünürlüklü iştah açıcı ürün fotoğrafları ve açıklamaları',
      '🥜 Detaylı alerjen ve kalori etiketleri',
      '🌍 Yabancı misafirler için otomatik çoklu dil desteği',
      '📊 Masa bazlı sipariş ve menü görüntülenme analitiği',
    ],
    demoSlug: '/m/lucca-bistrot',
    demoLabel: 'Örnek Menüyü İncele (Lucca Bistrot)',
    actionRoute: '/panel/menu',
    actionLabel: 'Restoran Menünü Oluştur',
    landingSlug: '/menu',
    mockupImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🍽️ Lucca Bistrot & Cocktail Bar • Şef Menüsü',
    statLabel: 'Menü Taraması',
    statValue: '310.000+',
  },
};

const QR_PALETTE = [
  { name: 'Kömür Siyahı', hex: '#111827' },
  { name: 'Lüks Altın', hex: '#C5A059' },
  { name: 'Okyanus Mavisi', hex: '#0284C7' },
  { name: 'Pati Zümrüdü', hex: '#10B981' },
  { name: 'Asil Mor', hex: '#8B5CF6' },
];

const PRESETS = [
  { label: '🔗 Web Link', value: 'https://qr-la.com', color: '#111827' },
  { label: '💍 Düğün Albümü', value: 'https://qr-la.com/samet-ve-sule', color: '#C5A059' },
  { label: '🚗 Park Tagı', value: 'https://qr-la.com/34abc123', color: '#0284C7' },
  { label: '🐾 Pati Künyesi', value: 'https://qr-la.com/p/duman', color: '#10B981' },
  { label: '💼 Dijital vCard', value: 'https://qr-la.com/samet-sunman', color: '#8B5CF6' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  const isTablet = width > 600 && width <= 900;
  const isMobile = width <= 600;
  const isSmallPhone = width < 380;
  const { colors, isDark } = useTheme();

  const [activeModule, setActiveModule] = useState<ModuleKey>('wedding');
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [moduleControls, setModuleControls] = useState<Record<PlatformModuleKey, ModuleControlConfig>>(DEFAULT_MODULE_CONTROLS);

  // Live Quick QR Generator State
  const [qrInputText, setQrInputText] = useState('https://qr-la.com');
  const [selectedQrColor, setSelectedQrColor] = useState('#C5A059');
  const [liveQrDataUrl, setLiveQrDataUrl] = useState('');
  const [isQrGenerating, setIsQrGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Subscribe to module visibility controls
  useEffect(() => {
    const unsub = adminService.subscribeModuleControls((controls) => {
      setModuleControls(controls);
    });
    return () => unsub();
  }, []);

  // Filter visible modules
  const visibleModules = useMemo(() => {
    return Object.values(MODULES).filter((mod) => {
      const ctrl = moduleControls[mod.key];
      if (!ctrl) return true;
      return ctrl.isEnabled && !ctrl.isHiddenOnHome;
    });
  }, [moduleControls]);

  useEffect(() => {
    if (visibleModules.length > 0 && !visibleModules.some((m) => m.key === activeModule)) {
      setActiveModule(visibleModules[0].key);
    }
  }, [visibleModules, activeModule]);

  // Subscribe to auth state
  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  // Generate live QR code whenever input or color changes
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      try {
        setIsQrGenerating(true);
        const url = await QRCode.toDataURL(qrInputText || 'https://qr-la.com', {
          width: 600,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: {
            dark: selectedQrColor,
            light: isDark ? '#141A28' : '#FFFFFF',
          },
        });
        if (!isCancelled) {
          setLiveQrDataUrl(url);
          setIsQrGenerating(false);
        }
      } catch (e) {
        console.error('Error generating quick QR:', e);
        if (!isCancelled) setIsQrGenerating(false);
      }
    };
    generate();
    return () => {
      isCancelled = true;
    };
  }, [qrInputText, selectedQrColor, isDark]);

  const handleDownloadQr = () => {
    if (!liveQrDataUrl) return;
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.download = 'qr-la-karekod.png';
      link.href = liveQrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyLink = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(qrInputText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isUserLoggedIn = Boolean(currentUser && currentUser.uid !== DEMO_HOST_UID);
  const selectedConfig = MODULES[activeModule] || MODULES.wedding;

  const handleStartNow = (modKey?: ModuleKey) => {
    const key = modKey || activeModule;
    if (isUserLoggedIn) {
      if (key === 'vehicle') router.push('/panel/arac' as any);
      else if (key === 'pet') router.push('/panel/pati' as any);
      else if (key === 'vcard') router.push('/panel/kartvizit' as any);
      else if (key === 'menu') router.push('/panel/menu' as any);
      else router.push('/panel' as any);
    } else {
      router.push({ pathname: '/giris', params: { tab: 'register' } } as any);
    }
  };

  const scrollToGenerator = () => {
    // Soft interaction
    setQrInputText('https://qr-la.com');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <Head>
        <title>QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu</title>
        <meta
          name="description"
          content="Düğünde masadan canlı fotoğraf toplama, araç camında numara gizleyen akıllı park tagı, Petguru GPS pati künyesi, NFC dijital kartvizit ve restoran QR menü."
        />
        <meta
          name="keywords"
          content="qr-la, karekod fotoğraf toplama, düğün karekod fotoğraf, araç camı qr kod, park sticker qr, gizli numara araç qr, petguru evcil hayvan künye, dijital kartvizit vcard nfc, restoran menü qr"
        />
        <meta property="og:title" content="QR-la | Çok Modüllü Dinamik QR Ekosistemi" />
        <meta
          property="og:description"
          content="Uygulama indirmeden tek bir QR kodla anıları toplayın, araç camında güvenle iletişime geçin, kartvizitinizi rehbere kaydettirin."
        />
        <meta property="og:url" content="https://qr-la.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://qr-la.com/og-banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QR-la | Çok Modüllü Dinamik QR Ekosistemi" />
        <meta
          name="twitter:description"
          content="Uygulama indirmeden tek bir QR kodla anıları toplayın, araç camında güvenle iletişime geçin, kartvizitinizi rehbere kaydettirin."
        />
        <meta name="twitter:image" content="https://qr-la.com/og-banner.png" />
        <link rel="canonical" href="https://qr-la.com" />
      </Head>

      {/* Floating Glass Navbar */}
      <View style={[styles.navWrapper, { backgroundColor: isDark ? 'rgba(9, 13, 22, 0.85)' : 'rgba(250, 247, 242, 0.88)' }]}>
        <View style={styles.navContainer}>
          {/* Brand Logo */}
          <TouchableOpacity
            style={styles.logoRow}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.8}
          >
            <View style={styles.logoBadgeIcon}>
              <Ionicons name="qr-code" size={18} color="#C5A059" />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>
              QR<Text style={styles.logoGold}>-LA</Text>
            </Text>
            <View style={styles.livePulseDot} />
          </TouchableOpacity>

          {/* Desktop Nav Links */}
          {isDesktop && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity onPress={() => router.push('/dugun' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.textSecondary }]}>Düğün</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/otomobil' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.textSecondary }]}>Araç Tagı</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/pati' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.textSecondary }]}>Pati Künyesi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/kartvizit' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.textSecondary }]}>Kartvizit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/menu' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: colors.textSecondary }]}>QR Menü</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Header Actions */}
          <View style={styles.navRightActions}>
            <ThemeToggleBtn />

            <TouchableOpacity
              style={[
                styles.navDemoBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF5EA', borderColor: colors.border },
              ]}
              onPress={() => router.push('/demo-panel' as any)}
            >
              <Ionicons name="sparkles" size={13} color="#C5A059" />
              <Text style={styles.navDemoBtnText}>Canlı Demo</Text>
            </TouchableOpacity>

            {isUserLoggedIn ? (
              <TouchableOpacity
                style={styles.navPrimaryBtn}
                onPress={() => router.push('/panel' as any)}
              >
                <Text style={styles.navPrimaryBtnText}>Panelim</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navPrimaryBtn}
                onPress={() => router.push('/giris' as any)}
              >
                <Text style={styles.navPrimaryBtnText}>Giriş Yap</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* ========================================================================= */}
        {/* HERO SECTION (Linear / Apple Minimal Dark Aurora) */}
        {/* ========================================================================= */}
        <View style={styles.heroWrapper}>
          {/* Ambient Glow Orbs */}
          <View style={[styles.glowOrbGold, { opacity: isDark ? 0.25 : 0.15 }]} />
          <View style={[styles.glowOrbBlue, { opacity: isDark ? 0.2 : 0.1 }]} />

          <View style={styles.heroContent}>
            {/* Pill Tag */}
            <View style={[styles.heroPill, { borderColor: isDark ? 'rgba(197, 160, 89, 0.4)' : '#EFE7DA' }]}>
              <View style={styles.heroPillDot} />
              <Text style={styles.heroPillText}>YENİ NESİL DİNAMİK QR EKOSİSTEMİ</Text>
              <View style={styles.heroPillBadge}>
                <Text style={styles.heroPillBadgeText}>V2.0</Text>
              </View>
            </View>

            {/* Massive Headline */}
            <Text style={[styles.heroHeadline, isMobile && styles.heroHeadlineMobile, { color: colors.text }]}>
              Fiziksel Dünyayı{' '}
              <Text style={styles.heroGradientText}>Tek Bir Dinamik QR İle</Text>{' '}
              Dijitale Bağlayın.
            </Text>

            {/* Subtitle */}
            <Text style={[styles.heroSub, isMobile && styles.heroSubMobile, { color: colors.textSecondary }]}>
              Düğünde masadan canlı misafir fotoğrafı toplama, araç camında numara gizleyen akıllı park sticker’ı, Petguru GPS pati künyesi, NFC dijital kartvizit ve restoran QR menü. Tek ekosistemde sınırsız kolaylık.
            </Text>

            {/* CTA Group */}
            <View style={[styles.heroCtaRow, isMobile && styles.heroCtaRowMobile]}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={() => handleStartNow()}
                activeOpacity={0.88}
              >
                <Text style={styles.heroPrimaryBtnText}>Hemen Ücretsiz Başla</Text>
                <Ionicons name="arrow-forward" size={17} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroSecondaryBtn, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFF' }]}
                onPress={() => router.push('/samet-ve-sule' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle-outline" size={20} color="#C5A059" />
                <Text style={[styles.heroSecondaryBtnText, { color: colors.text }]}>Örnek Düğün Demosu</Text>
              </TouchableOpacity>
            </View>

            {/* Micro Trust Stats */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Ionicons name="flash" size={15} color="#10B981" />
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>Sıfır Uygulama İndirme</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="shield-checkmark" size={15} color="#0284C7" />
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>%100 Numara Gizliliği</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="navigate" size={15} color="#C5A059" />
                <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>Petguru GPS Takibi</Text>
              </View>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* HERO LIVE INTERACTIVE QUICK QR GENERATOR WIDGET */}
          {/* ========================================================================= */}
          <View style={[styles.quickGeneratorCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E5E7EB' }]}>
            <View style={styles.quickGenHeader}>
              <View style={styles.quickGenTitleRow}>
                <View style={styles.quickGenIconBadge}>
                  <Ionicons name="sparkles" size={16} color="#C5A059" />
                </View>
                <View>
                  <Text style={[styles.quickGenTitle, { color: colors.text }]}>Canlı Karekod Üretici</Text>
                  <Text style={[styles.quickGenSub, { color: colors.textSecondary }]}>Anında oluştur, renk seç ve yüksek çözünürlüklü indir</Text>
                </View>
              </View>
              <View style={styles.instantFreePill}>
                <Text style={styles.instantFreePillText}>ÜCRETSİZ & ANINDA</Text>
              </View>
            </View>

            <View style={[styles.quickGenBody, !isDesktop && styles.quickGenBodyStacked]}>
              {/* Left Controls */}
              <View style={styles.quickGenLeft}>
                {/* Preset Chips */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Hazır Şablon Seç:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScrollView}>
                  {PRESETS.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: qrInputText === p.value ? p.color : isDark ? '#1F2937' : '#F3F4F6',
                          borderColor: qrInputText === p.value ? p.color : isDark ? '#374151' : '#E5E7EB',
                        },
                      ]}
                      onPress={() => {
                        setQrInputText(p.value);
                        setSelectedQrColor(p.color);
                      }}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          { color: qrInputText === p.value ? '#FFF' : colors.text },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Text/URL Input */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Hedef Web Adresi veya Metin:</Text>
                <View style={[styles.inputBox, { backgroundColor: isDark ? '#090D16' : '#F9FAFB', borderColor: colors.border }]}>
                  <Ionicons name="link-outline" size={18} color="#9CA3AF" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={qrInputText}
                    onChangeText={setQrInputText}
                    placeholder="https://qr-la.com/..."
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {qrInputText.length > 0 && (
                    <TouchableOpacity onPress={() => setQrInputText('')} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Color Palette Selector */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Karekod Rengi:</Text>
                <View style={styles.paletteRow}>
                  {QR_PALETTE.map((pal) => {
                    const isSelected = selectedQrColor === pal.hex;
                    return (
                      <TouchableOpacity
                        key={pal.hex}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: pal.hex },
                          isSelected && styles.colorCircleSelected,
                        ]}
                        onPress={() => setSelectedQrColor(pal.hex)}
                      >
                        {isSelected && <Ionicons name="checkmark" size={13} color="#FFF" />}
                      </TouchableOpacity>
                    );
                  })}
                  <Text style={[styles.colorNameLabel, { color: colors.textSecondary }]}>
                    {QR_PALETTE.find((c) => c.hex === selectedQrColor)?.name}
                  </Text>
                </View>
              </View>

              {/* Right QR Display Box */}
              <View style={styles.quickGenRight}>
                <View style={[styles.qrPreviewBox, { backgroundColor: isDark ? '#141A28' : '#FAF7F2', borderColor: isDark ? '#1F2937' : '#EFE7DA' }]}>
                  {liveQrDataUrl ? (
                    <Image
                      source={{ uri: liveQrDataUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.qrLoadingBox}>
                      <Ionicons name="qr-code-outline" size={48} color="#9CA3AF" />
                      <Text style={styles.qrLoadingText}>Karekod Oluşturuluyor...</Text>
                    </View>
                  )}

                  <View style={styles.qrLiveBadge}>
                    <View style={[styles.qrLiveDot, { backgroundColor: selectedQrColor }]} />
                    <Text style={styles.qrLiveBadgeText}>Canlı Önizleme</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.qrActionBtnRow}>
                  <TouchableOpacity style={styles.qrDownloadBtn} onPress={handleDownloadQr}>
                    <Ionicons name="download-outline" size={16} color="#FFF" />
                    <Text style={styles.qrDownloadBtnText}>PNG İndir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.qrCopyBtn, { borderColor: colors.border }]}
                    onPress={handleCopyLink}
                  >
                    <Ionicons name={copiedLink ? 'checkmark' : 'copy-outline'} size={15} color={copiedLink ? '#10B981' : colors.text} />
                    <Text style={[styles.qrCopyBtnText, { color: copiedLink ? '#10B981' : colors.text }]}>
                      {copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* LINEAR / APPLE STYLE BENTO GRID (THE 5 CORE PILLARS) */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>5’İ 1 ARADA PLATFORM</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: colors.text }]}>
              Her İhtiyaç İçin Özel Olarak Geliştirilmiş Modüller
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: colors.textSecondary }]}>
              QR-la, standart statik karekod sitelerinden farklı olarak her sektöre özel interaktif dijital deneyimler sunar.
            </Text>
          </View>

          {/* Bento Grid Container */}
          <View style={styles.bentoContainer}>
            {/* ==================== BENTO CARD 1: DÜĞÜN (WIDE HERO CARD) ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardWide, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(197, 160, 89, 0.3)' : '#EFE7DA' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
                      <Ionicons name="heart" size={22} color="#C5A059" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(197, 160, 89, 0.12)', borderColor: 'rgba(197, 160, 89, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#C5A059' }]}>Düğün & Etkinlik • Canlıda</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#C5A059' }]}>+148K Fotoğraf</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Düğünde Masadaki Kodu QR’la, Misafir Fotoğrafları Dev Ekrana Yansısın
                </Text>
                <Text style={[styles.bentoDesc, { color: colors.textSecondary }]}>
                  Uygulama indirtmeden masadaki zarif masa kartından misafirlerinizin çektiği orijinal yüksek çözünürlüklü fotoğrafları toplayın. Salondaki projeksiyon veya TV slaytında canlı yayınlayın, gece sonunda tek tıkla ZIP arşiv olarak indirin.
                </Text>

                {/* Simulated Live Projection Screen Preview */}
                <View style={[styles.simulatedScreenBox, { backgroundColor: isDark ? '#090D16' : '#FAF5EA' }]}>
                  <View style={styles.simulatedScreenBar}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.simulatedScreenLiveText}>CANLI SALON YAYINI • ŞULE & SAMET DÜĞÜNÜ</Text>
                    <Text style={styles.simulatedScreenCountText}>48 Yükleme</Text>
                  </View>

                  <View style={styles.simulatedPhotoTilesRow}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80' }}
                      style={styles.simulatedPhotoTile}
                    />
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' }}
                      style={styles.simulatedPhotoTile}
                    />
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80' }}
                      style={styles.simulatedPhotoTile}
                    />
                  </View>
                </View>

                {/* Bento Footer Action Buttons */}
                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#C5A059' }]}
                    onPress={() => router.push('/panel' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Düğün QR’ı Başlat</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bentoSecondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/samet-ve-sule' as any)}
                  >
                    <Ionicons name="eye-outline" size={16} color={colors.text} />
                    <Text style={[styles.bentoSecondaryActionBtnText, { color: colors.text }]}>Canlı Düğün Demosu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 2: ARAÇ & PARK TAGI ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(2, 132, 199, 0.3)' : '#E5E7EB' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                      <Ionicons name="car-sport" size={22} color="#0284C7" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(2, 132, 199, 0.12)', borderColor: 'rgba(2, 132, 199, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#0284C7' }]}>Araç & Park Tagı</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#0284C7' }]}>%100 Gizli</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Araç Camında Numaranı İfşa Etme, Güvenle WhatsApp ile Ulaşılsın
                </Text>
                <Text style={[styles.bentoDesc, { color: colors.textSecondary }]}>
                  Ön camdaki UV sticker taranınca telefon numaranız asla yabancılara gösterilmez. Hazır şablon mesajlarla anında WhatsApp veya arama köprüsü kurulur.
                </Text>

                {/* Interactive Privacy Phone Shield */}
                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#041525' : '#F0F9FF' }]}>
                  <View style={styles.maskedNumberRow}>
                    <Ionicons name="lock-closed" size={14} color="#0284C7" />
                    <Text style={styles.maskedNumberText}>+90 (532) ••• •• 84</Text>
                    <View style={styles.maskedVerifiedBadge}>
                      <Text style={styles.maskedVerifiedBadgeText}>Maskelendi</Text>
                    </View>
                  </View>

                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🚨 Farlarınız açık kaldı</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🅿️ Aracı çeker misiniz?</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🩸 Kan Grubu: A Rh+</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#0284C7' }]}
                    onPress={() => router.push('/panel/arac' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Araç Tagı Oluştur</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bentoSecondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/34abc123' as any)}
                  >
                    <Text style={[styles.bentoSecondaryActionBtnText, { color: colors.text }]}>Örnek Araç</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 3: PETGURU GPS PATİ KÜNYESİ ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#E5E7EB' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Ionicons name="paw" size={22} color="#10B981" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#10B981' }]}>Petguru İş Birliğiyle</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#10B981' }]}>GPS & Kayıp</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Kaybolan Dostunuz İçin Anlık Harita Konumu Bildiren Akıllı Künye
                </Text>
                <Text style={[styles.bentoDesc, { color: colors.textSecondary }]}>
                  Tasmadaki lazer kazıma künye tarandığı anda bulan kişinin GPS konumu tek tıkla Petguru veritabanına iletilir, sahibe anlık bildirim gider ve aşı karnesi açılır.
                </Text>

                {/* Radar GPS Coordinate Simulation Box */}
                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#021B12' : '#F0FDF4' }]}>
                  <View style={styles.maskedNumberRow}>
                    <Ionicons name="navigate-circle" size={16} color="#10B981" />
                    <Text style={[styles.maskedNumberText, { color: '#10B981' }]}>40.9833° N, 29.0278° E (Kadıköy)</Text>
                    <View style={[styles.maskedVerifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Text style={[styles.maskedVerifiedBadgeText, { color: '#10B981' }]}>Canlı GPS</Text>
                    </View>
                  </View>

                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🐕 Dost: Duman (Golden)</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>💉 Kuduz/Karma Güncel</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📞 Sahibi Ara</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => router.push('/panel/pati' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Pati Künyesi Al</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bentoSecondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/p/duman' as any)}
                  >
                    <Text style={[styles.bentoSecondaryActionBtnText, { color: colors.text }]}>Örnek Künye</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 4: DİJİTAL KARTVİZİT & NFC ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : '#E5E7EB' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                      <Ionicons name="briefcase" size={22} color="#8B5CF6" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#8B5CF6' }]}>vCard & NFC Kart</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#8B5CF6' }]}>Tek Dokunuş</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Kağıt Kartvizitleri Çöpe Atın, Tek Dokunuşla Rehbere Kaydolun
                </Text>
                <Text style={[styles.bentoDesc, { color: colors.textSecondary }]}>
                  Mat siyah NFC kartı telefona yaklaştırın veya QR okutun; unvanınız, sosyal medya hesaplarınız ve IBAN bilgileriniz tek tıkla rehbere (.vcf) kaydedilsin.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#170A26' : '#FAF5FF' }]}>
                  <View style={styles.maskedNumberRow}>
                    <Ionicons name="card" size={16} color="#8B5CF6" />
                    <Text style={[styles.maskedNumberText, { color: '#8B5CF6' }]}>Samet Sunman • Senior Architect</Text>
                  </View>
                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📇 Rehbere Kaydet (.vcf)</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🔗 LinkedIn / Web</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>💳 IBAN Kopyala</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#8B5CF6' }]}
                    onPress={() => router.push('/panel/kartvizit' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Kartvizit Başlat</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bentoSecondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/samet-sunman' as any)}
                  >
                    <Text style={[styles.bentoSecondaryActionBtnText, { color: colors.text }]}>Örnek Kart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 5: RESTORAN QR MENÜ ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#E5E7EB' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Ionicons name="restaurant" size={22} color="#F59E0B" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#F59E0B' }]}>Kafe & Restoran</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#F59E0B' }]}>Anlık Fiyat</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: colors.text }]}>
                  Masanızdan Anlık Güncellenen, Fotoğraflı Dijital QR Menü
                </Text>
                <Text style={[styles.bentoDesc, { color: colors.textSecondary }]}>
                  Kağıt menü baskı maliyetine son verin! Fiyatları, görselleri ve alerjenleri saniyeler içinde güncelleyin. Garson çağırma butonuyla müşteri memnuniyetini zirveye taşıyın.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#1E1202' : '#FFFBEB' }]}>
                  <View style={styles.maskedNumberRow}>
                    <Ionicons name="fast-food" size={16} color="#F59E0B" />
                    <Text style={[styles.maskedNumberText, { color: '#F59E0B' }]}>Lucca Bistrot • Şef Menüsü</Text>
                  </View>
                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📸 Görselli İştah Açıcı</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🔔 Garson Çağır</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🥜 Alerjen Etiketleri</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#F59E0B' }]}
                    onPress={() => router.push('/panel/menu' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Menü QR Oluştur</Text>
                    <Ionicons name="arrow-forward" size={15} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bentoSecondaryActionBtn, { borderColor: colors.border }]}
                    onPress={() => router.push('/m/lucca-bistrot' as any)}
                  >
                    <Text style={[styles.bentoSecondaryActionBtnText, { color: colors.text }]}>Örnek Menü</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* INTERACTIVE DEVICE PREVIEW SIMULATOR (TABBED) */}
        {/* ========================================================================= */}
        <View style={[styles.simulatorSection, { backgroundColor: isDark ? '#0D131F' : '#F3EFE6' }]}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>CANLI ARAYÜZ SİMÜLATÖRÜ</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: colors.text }]}>
              Telefonunuzdaki Deneyimi Önceden Test Edin
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: colors.textSecondary }]}>
              Modülleri değiştirerek misafirlerinizin veya müşterilerinizin göreceği gerçek mobil arayüzü inceleyin:
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
                    color={isSelected ? '#FFFFFF' : mod.accentColor}
                  />
                  <Text
                    style={[
                      styles.moduleTabText,
                      isSelected && styles.moduleTabTextSelected,
                    ]}
                  >
                    {mod.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Interactive Phone Frame & Details */}
          <View style={[styles.simulatorContentRow, !isDesktop && styles.simulatorContentRowStacked]}>
            {/* Left Phone Bezel Frame */}
            <View style={styles.phoneFrameWrapper}>
              <View style={[styles.phoneBezel, { borderColor: isDark ? '#374151' : '#D1D5DB' }]}>
                {/* Dynamic Island / Notch */}
                <View style={styles.phoneIsland} />

                {/* Screen Content */}
                <Image
                  source={{ uri: selectedConfig.mockupImage }}
                  style={styles.phoneScreenImage}
                  resizeMode="cover"
                />

                <View style={styles.phoneScreenOverlay}>
                  <View style={styles.phoneLiveBadge}>
                    <View style={[styles.livePulseDot, { backgroundColor: selectedConfig.accentColor }]} />
                    <Text style={styles.phoneLiveBadgeText}>{selectedConfig.badge}</Text>
                  </View>
                  <Text style={styles.phoneScreenCaption}>{selectedConfig.mockupTag}</Text>
                </View>
              </View>
            </View>

            {/* Right Details Panel */}
            <View style={styles.simulatorDetailsCol}>
              <View style={[styles.simModuleBadge, { backgroundColor: selectedConfig.accentColor + '20', borderColor: selectedConfig.accentColor + '40' }]}>
                <Text style={[styles.simModuleBadgeText, { color: selectedConfig.accentColor }]}>
                  {selectedConfig.label}
                </Text>
              </View>

              <Text style={[styles.simTitle, { color: colors.text }]}>
                {selectedConfig.title}
              </Text>
              <Text style={[styles.simDesc, { color: colors.textSecondary }]}>
                {selectedConfig.description}
              </Text>

              {/* Feature Checklist */}
              <View style={styles.simFeaturesList}>
                {selectedConfig.features.map((feat, idx) => (
                  <View key={idx} style={styles.simFeatureItem}>
                    <Text style={[styles.simFeatureText, { color: colors.text }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Dual CTA */}
              <View style={styles.simCtaRow}>
                <TouchableOpacity
                  style={[styles.simPrimaryBtn, { backgroundColor: selectedConfig.accentColor }]}
                  onPress={() => handleStartNow(selectedConfig.key)}
                >
                  <Text style={styles.simPrimaryBtnText}>{selectedConfig.actionLabel}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.simSecondaryBtn, { borderColor: colors.border }]}
                  onPress={() => router.push(selectedConfig.demoSlug as any)}
                >
                  <Ionicons name="eye-outline" size={16} color={colors.text} />
                  <Text style={[styles.simSecondaryBtnText, { color: colors.text }]}>
                    {selectedConfig.demoLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* PHYGITAL HARDWARE SHOWCASE SECTION */}
        {/* ========================================================================= */}
        <View style={styles.phygitalSection}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>PHYGITAL DEĞER TEKLİFİ</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: '#FFF' }]}>
              Dijital Kolaylık + Lüks Fiziksel Baskı Kalitesi
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: '#9CA3AF' }]}>
              İster sadece QR kodunuzu ücretsiz üretip kendiniz kullanın; isterseniz kapınıza teslim edilen yüksek kaliteli UV cam sticker’ı, pleksi stand veya metal künye ile deneyimi taçlandırın.
            </Text>
          </View>

          <View style={[styles.phygitalGrid, isDesktop ? styles.phygitalGridDesktop : styles.phygitalGridMobile]}>
            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                <Ionicons name="car-outline" size={26} color="#38BDF8" />
              </View>
              <Text style={styles.phygitalCardTitle}>UV Korumalı Ön Cam Sticker’ı</Text>
              <Text style={styles.phygitalCardDesc}>
                Güneşte solmayan, söküldüğünde iz bırakmayan özel otomobil ve motosiklet sticker baskısı. Yağmura ve oto yıkamaya %100 dayanıklı.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>🚗 Araç & Motosiklet</Text>
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
                <Text style={styles.phygitalBadgeText}>💍 Düğün & Davet</Text>
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

        {/* ========================================================================= */}
        {/* HOW IT WORKS SECTION */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>NASIL ÇALIŞIR?</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: colors.text }]}>
              3 Adımda Zahmetsiz Deneyim
            </Text>
          </View>

          <View style={[styles.stepsGrid, isDesktop ? styles.stepsGridDesktop : styles.stepsGridMobile]}>
            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="create-outline" size={28} color="#C5A059" />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Modülünü Seç & Oluştur</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Düğün, araç tagı, pati künyesi veya kartvizit modüllerinden birini seçip bilgilerinizi girin.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="qr-code-outline" size={28} color="#0284C7" />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>İster İndir, İster Bastır</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Karekodunuzu anında ücretsiz PNG/PDF formatında indirin veya kapınıza teslim lüks fiziksel baskısını sipariş edin.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="sparkles-outline" size={28} color="#10B981" />
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Canlı Yönet & İzle</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Panelinizden dilediğiniz zaman içeriği güncelleyin; fotoğrafları, GPS taramalarını ve analizleri canlı izleyin.
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* PRICING PLANS SECTION */}
        {/* ========================================================================= */}
        <View style={[styles.pricingSection, { backgroundColor: isDark ? '#0D131F' : '#F9F6F0' }]}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>ŞEFFAF & ESNEK FİYATLAR</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: colors.text }]}>
              İhtiyacınıza Uygun Paketi Seçin
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: colors.textSecondary }]}>
              Tüm modüllerde ücretsiz başlayabilir, dilediğiniz an tek tıkla gelişmiş depolama veya fiziksel baskı paketlerine geçebilirsiniz.
            </Text>
          </View>

          <View style={[styles.plansGrid, isDesktop ? styles.plansGridDesktop : styles.plansGridMobile]}>
            {PLAN_TIERS.map((tier) => {
              const isPopular = tier.tier === 'premium' || Boolean(tier.isPopular);
              return (
                <View
                  key={tier.tier}
                  style={[
                    styles.planCard,
                    { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isPopular ? '#C5A059' : colors.border },
                    isPopular && styles.planCardPopular,
                  ]}
                >
                  {isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>EN ÇOK SEÇİLEN</Text>
                    </View>
                  )}

                  <Text style={[styles.planName, { color: colors.text }]}>{tier.name}</Text>
                  <Text style={[styles.planTagline, { color: colors.textSecondary }]}>{tier.quotaMB} MB Bulut Depolama • {tier.retentionDays} Gün Arşiv</Text>

                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPriceNumber, { color: isPopular ? '#C5A059' : colors.text }]}>
                      {tier.priceTL === 0 ? 'Ücretsiz' : `₺${tier.priceTL.toLocaleString('tr-TR')}`}
                    </Text>
                    {tier.priceTL > 0 && <Text style={[styles.planPricePeriod, { color: colors.textSecondary }]}>/ tek seferlik</Text>}
                  </View>

                  <View style={[styles.planDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.planFeaturesList}>
                    {tier.features.map((feat, fIdx) => (
                      <View key={fIdx} style={styles.planFeatureRow}>
                        <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                        <Text style={[styles.planFeatureText, { color: colors.text }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.planCtaBtn,
                      isPopular
                        ? styles.planCtaBtnPopular
                        : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF5EA', borderColor: colors.border },
                    ]}
                    onPress={() => handleStartNow()}
                  >
                    <Text style={[styles.planCtaBtnText, isPopular ? { color: '#FFF' } : { color: colors.text }]}>
                      {tier.priceTL === 0 ? 'Hemen Başla' : 'Paketi Satın Al'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* FAQ ACCORDION SECTION */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={styles.sectionOverlinePill}>
              <Text style={styles.sectionOverlineText}>SIKÇA SORULAN SORULAR</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: colors.text }]}>
              Aklınıza Takılan Her Şey
            </Text>
          </View>

          <View style={styles.faqList}>
            {[
              {
                q: 'Misafirlerin veya aracı taratanların uygulama indirmesi gerekir mi?',
                a: 'Kesinlikle hayır! QR-la tamamen modern web tarayıcıları üzerinden çalışır. iPhone veya Android telefon kamerası açılıp karekod tarandığı anda doğrudan hedef sayfa saniyeler içinde açılır.',
              },
              {
                q: 'Araç camı QR kodunda telefon numaram herkese açık görünür mü?',
                a: 'Hayır. QR-la akıllı araç etiketinde telefon numaranız yabancılara asla ifşa edilmez. Taratan kişi QR-la güvenli köprüsü üzerinden numaranızı görmeden hazır şablonlarla WhatsApp mesajı iletebilir veya arama gerçekleştirebilir.',
              },
              {
                q: 'Pati künyesi Petguru ile nasıl entegre çalışır?',
                a: 'Kayıp hayvan tasmadaki künyeyi taratan kişinin onaylı anlık GPS konumu doğrudan Petguru sunucularına iletilir ve hayvan sahibine SMS/Push bildirimi gider. Bulan kişi ayrıca veteriner acil numaralarını ve aşı karnesini tek ekranda görebilir.',
              },
              {
                q: 'Dinamik karekod basıldıktan sonra içeriği değiştirebilir miyim?',
                a: 'Evet! Dinamik karekod teknolojisi sayesinde fiziksel olarak bastırdığınız UV sticker, pleksi stand veya künyedeki QR kod değişmeden; yönlendiği sayfayı, iletişim bilgilerini ve menü fiyatlarını panelinizden dilediğiniz an güncelleyebilirsiniz.',
              },
              {
                q: 'Düğün fotoğraflarını gece bitiminde nasıl indiriyoruz?',
                a: 'Yönetim panelinizdeki "Tüm Fotoğrafları İndir" butonuna basarak misafirlerin yüklediği yüzlerce orijinal yüksek çözünürlüklü fotoğrafı tek bir ZIP arşivi halinde bilgisayarınıza veya telefonunuza anında indirebilirsiniz.',
              },
            ].map((item, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.faqCard,
                    { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isExpanded ? '#C5A059' : colors.border },
                  ]}
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeaderRow}>
                    <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isExpanded ? '#C5A059' : '#9CA3AF'}
                    />
                  </View>
                  {isExpanded && (
                    <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{item.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <View style={[styles.footer, { backgroundColor: isDark ? '#090D16' : '#F3EFE6', borderTopColor: colors.border }]}>
          <View style={styles.footerTopRow}>
            <View style={styles.footerBrandCol}>
              <View style={styles.logoRow}>
                <Ionicons name="qr-code" size={20} color="#C5A059" />
                <Text style={[styles.logoText, { color: colors.text }]}>
                  QR<Text style={styles.logoGold}>-LA</Text>
                </Text>
              </View>
              <Text style={[styles.footerTagline, { color: colors.textSecondary }]}>
                Fiziksel dünyayı dijitale bağlayan yeni nesil dinamik QR kod ekosistemi.
              </Text>
            </View>

            <View style={styles.footerLinksGrid}>
              {visibleModules.map((mod) => (
                <TouchableOpacity key={mod.key} onPress={() => setActiveModule(mod.key)}>
                  <Text style={[styles.footerLink, { color: colors.textSecondary }]}>{mod.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => router.push('/admin' as any)}>
                <Text style={[styles.footerLink, { color: '#C5A059' }]}>⚙️ Platform Admin Paneli</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

          <View style={styles.footerBottomRow}>
            <Text style={[styles.footerCopy, { color: colors.textMuted }]}>
              &copy; 2026 QR-la Platformu. Tüm hakları saklıdır.
            </Text>
            <Text style={[styles.footerSubNote, { color: colors.textMuted }]}>
              Düğün • Araç Tagı • Petguru Pati Künyesi • NFC Kartvizit • Restoran Menü
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* Floating Navbar */
  navWrapper: {
    position: 'relative',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  navContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logoGold: {
    color: '#C5A059',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  navLinkItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  navDemoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C5A059',
  },
  navPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  navPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Hero Section */
  heroWrapper: {
    position: 'relative',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 64,
  },
  glowOrbGold: {
    position: 'absolute',
    top: -60,
    right: 40,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#C5A059',
  },
  glowOrbBlue: {
    position: 'absolute',
    top: 100,
    left: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#0284C7',
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 44,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    marginBottom: 20,
  },
  heroPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C5A059',
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C5A059',
    letterSpacing: 0.8,
  },
  heroPillBadge: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroPillBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  heroHeadline: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.2,
    lineHeight: 56,
    maxWidth: 920,
    marginBottom: 18,
  },
  heroHeadlineMobile: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  heroGradientText: {
    color: '#C5A059',
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 780,
    marginBottom: 28,
  },
  heroSubMobile: {
    fontSize: 15,
    lineHeight: 23,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  heroCtaRowMobile: {
    flexDirection: 'column',
    width: '100%',
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  heroSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    opacity: 0.5,
  },
  heroStatText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Hero Live Quick Generator Card */
  quickGeneratorCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
  },
  quickGenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 16,
  },
  quickGenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickGenIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickGenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  quickGenSub: {
    fontSize: 13,
    marginTop: 2,
  },
  instantFreePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  instantFreePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  quickGenBody: {
    flexDirection: 'row',
    gap: 28,
  },
  quickGenBodyStacked: {
    flexDirection: 'column',
  },
  quickGenLeft: {
    flex: 1.3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetsScrollView: {
    marginBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  colorNameLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickGenRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPreviewBox: {
    width: 220,
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 14,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrLoadingBox: {
    alignItems: 'center',
    gap: 8,
  },
  qrLoadingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  qrLiveBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qrLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  qrLiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  qrActionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 240,
  },
  qrDownloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
  },
  qrDownloadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  qrCopyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 10,
  },
  qrCopyBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Section Styles */
  section: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 64,
  },
  sectionHeaderCentered: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 44,
  },
  sectionOverlinePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    marginBottom: 12,
  },
  sectionOverlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C5A059',
    letterSpacing: 0.8,
  },
  sectionHeading: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  sectionHeadingMobile: {
    fontSize: 26,
    lineHeight: 32,
  },
  sectionSub: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 680,
  },
  sectionSubMobile: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* Bento Grid */
  bentoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  bentoCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  bentoCardWide: {
    width: '100%',
  },
  bentoCardHalf: {
    flex: 1,
    minWidth: 320,
  },
  bentoCardInner: {
    flex: 1,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bentoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bentoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  bentoPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bentoMetricText: {
    fontSize: 13,
    fontWeight: '800',
  },
  bentoTitle: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  bentoDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },

  /* Bento Simulated Screen Previews */
  simulatedScreenBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  simulatedScreenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  simulatedScreenLiveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    flex: 1,
  },
  simulatedScreenCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C5A059',
  },
  simulatedPhotoTilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  simulatedPhotoTile: {
    flex: 1,
    height: 90,
    borderRadius: 10,
  },
  simulatedShieldBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  maskedNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  maskedNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    flex: 1,
  },
  maskedVerifiedBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  maskedVerifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  quickTemplatePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTemplatePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickTemplatePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  /* Bento Action Buttons */
  bentoBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  bentoPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bentoPrimaryActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  bentoSecondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  bentoSecondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Simulator Section */
  simulatorSection: {
    paddingVertical: 64,
  },
  tabsScrollView: {
    marginBottom: 36,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: 10,
  },
  moduleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  moduleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  moduleTabTextSelected: {
    color: '#FFFFFF',
  },
  simulatorContentRow: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  simulatorContentRowStacked: {
    flexDirection: 'column',
  },
  phoneFrameWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBezel: {
    width: 310,
    height: 520,
    borderRadius: 44,
    borderWidth: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 36,
  },
  phoneIsland: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 90,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    zIndex: 10,
  },
  phoneScreenImage: {
    width: '100%',
    height: '100%',
  },
  phoneScreenOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  phoneLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  phoneLiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  phoneScreenCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  simulatorDetailsCol: {
    flex: 1.2,
  },
  simModuleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  simModuleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  simTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 14,
  },
  simDesc: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  simFeaturesList: {
    gap: 10,
    marginBottom: 26,
  },
  simFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simFeatureText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  simCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  simPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  simPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  simSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  simSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Phygital Hardware Section */
  phygitalSection: {
    backgroundColor: '#090D16',
    paddingVertical: 72,
    paddingHorizontal: 20,
  },
  phygitalGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  phygitalGridDesktop: {
    flexDirection: 'row',
  },
  phygitalGridMobile: {
    flexDirection: 'column',
  },
  phygitalCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 22,
  },
  phygitalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  phygitalCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  phygitalCardDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  phygitalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phygitalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D1D5DB',
  },

  /* How It Works Steps */
  stepsGrid: {
    gap: 20,
  },
  stepsGridDesktop: {
    flexDirection: 'row',
  },
  stepsGridMobile: {
    flexDirection: 'column',
  },
  stepCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    position: 'relative',
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: '#C5A059',
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 20,
  },

  /* Pricing Section */
  pricingSection: {
    paddingVertical: 64,
  },
  plansGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  plansGridDesktop: {
    flexDirection: 'row',
  },
  plansGridMobile: {
    flexDirection: 'column',
  },
  planCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    position: 'relative',
  },
  planCardPopular: {
    borderWidth: 2,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#C5A059',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  planName: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  planTagline: {
    fontSize: 13,
    marginBottom: 16,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  planPriceNumber: {
    fontSize: 34,
    fontWeight: '900',
  },
  planPricePeriod: {
    fontSize: 13,
    marginLeft: 6,
  },
  planDivider: {
    height: 1,
    marginBottom: 18,
  },
  planFeaturesList: {
    gap: 12,
    marginBottom: 28,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  planCtaBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  planCtaBtnPopular: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  planCtaBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },

  /* FAQ Accordion */
  faqList: {
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  faqCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 22,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },

  /* Footer */
  footer: {
    borderTopWidth: 1,
    paddingTop: 48,
    paddingBottom: 36,
  },
  footerTopRow: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 32,
    marginBottom: 32,
  },
  footerBrandCol: {
    maxWidth: 380,
  },
  footerTagline: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerDivider: {
    height: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  footerBottomRow: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerCopy: {
    fontSize: 12,
  },
  footerSubNote: {
    fontSize: 11,
  },
});
