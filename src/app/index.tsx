import React, { useEffect, useState, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'qrcode';
import { DEMO_HOST_UID } from '@/services/mockData';
import { authService } from '@/services/authService';
import { UserModel } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { adminService, ModuleControlConfig, DEFAULT_MODULE_CONTROLS, PlatformModuleKey } from '@/services/adminService';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

type ModuleKey = 'vehicle' | 'pet' | 'vcard' | 'menu' | 'wedding';

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

// 5 Equal, Unified Pillars — Tech-first, balanced, neutral platform
const MODULES: Record<ModuleKey, ModuleConfig> = {
  vehicle: {
    key: 'vehicle',
    label: 'Araç & Park Tagı',
    badge: 'Gizli Numara • Güvenlik',
    icon: 'car-sport',
    accentColor: '#0284C7',
    gradientBg: ['#041525', '#060B12'],
    title: 'Numaranızı Gizleyin, Araç Camından Güvenle Ulaşılsın',
    subtitle: 'Telefon numaranızı cama yazıp ifşa etmeye son. Kaza ve park anında tek dokunuşla akıllı iletişim.',
    description:
      'Güneşte solmayan UV korumalı akıllı sticker ile sürücü telefon numaranız yabancılara asla gösterilmez. Karekodu okutanlar doğrudan hazır WhatsApp şablonlarıyla ("Farlarınız açık", "Aracı alabilir misiniz?") size ulaşır. Acil durumlarda kan grubu ve acil durum kişisi hayat kurtarır.',
    features: [
      '🔒 Numara maskeleme (telefonunuz yabancılara açıkça gösterilmez)',
      '🩸 Hayati acil durum kan grubu rozeti ve acil yakını arama',
      '💬 Tek tıkla hazır WhatsApp durum mesajları',
      '🎨 20+ Otomobil ve motosiklet marka renk teması',
      '🏷️ Çizilmez, güneşte solmaz UV korumalı ön cam stickerı',
    ],
    demoSlug: '/34abc123',
    demoLabel: 'Örnek Araç Tagı (34 ABC 123)',
    actionRoute: '/panel/arac',
    actionLabel: 'Araç Tagını İncele',
    landingSlug: '/otomobil',
    mockupImage:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🚗 Honda CBR • 34 ABC 123 • A Rh+ • WhatsApp Aktif',
    statLabel: 'Gizli İletişim',
    statValue: '28.500+',
  },
  pet: {
    key: 'pet',
    label: 'Pati Künyesi (GPS)',
    badge: 'Petguru Entegrasyonlu',
    icon: 'paw',
    accentColor: '#10B981',
    gradientBg: ['#021B12', '#050E0A'],
    title: 'Kayıp Halinde Anlık GPS Harita Bildirimi Gönderen Akıllı Künye',
    subtitle: 'Künye okutulduğu anda bulan kişi size tek tıkla ulaşsın, telefonunuza harita konumu gelsin.',
    description:
      'Petguru doğrudan altyapısı ile paslanmaz çelik tasma künyeleri akıllı sisteme bağlanır. Tasmadaki kod kamerayla okutulduğunda bulan kişinin onaylı anlık GPS konumu anında sahibe iletilir, acil sağlık profili ve aşı karnesi tek tıkla açılır.',
    features: [
      '📍 Bulan kişi tarattığı anda sahibe harita & GPS konumu bildirimi',
      '🚨 Tek tıkla Acil Kayıp Hayvan Alarmı sayfası',
      '💉 Dijital sağlık profili (alerjiler, çip no, veteriner telefonu)',
      '🐕 Ultra kısa dinamik format (karanlıkta bile 1 saniyede taranır)',
      '🏷️ Lazer kazımalı paslanmaz çelik dayanıklı fiziksel künye',
    ],
    demoSlug: '/p/duman',
    demoLabel: 'Örnek Pati Künyesi (Duman)',
    actionRoute: '/panel/pati',
    actionLabel: 'Pati Künyesini İncele',
    landingSlug: '/pati',
    mockupImage:
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🐾 Duman • Golden Retriever • Kadıköy • Aşıları Tam',
    statLabel: 'Korumada Olan Pati',
    statValue: '14.200+',
  },
  vcard: {
    key: 'vcard',
    label: 'Dijital Kartvizit (NFC)',
    badge: 'Temassız vCard & Profil',
    icon: 'briefcase',
    accentColor: '#6366F1',
    gradientBg: ['#170A26', '#090510'],
    title: 'Tek Dokunuşla Telefon Rehberine Kaydolun, Bilgilerinizi Aktarın',
    subtitle: 'Kağıt kartvizitleri geride bırakın. LinkedIn, telefon, WhatsApp ve IBAN tek ekranda.',
    description:
      'İş görüşmelerinde telefonun arkasına dokundurulan mat siyah NFC kartvizit veya karekod ile profilinizi anında paylaşın. Karşı taraf hiçbir şey yazmadan doğrudan "Rehbere Kaydet" (.vcf) butonuna basarak tüm bilgilerinizi telefonuna eklesin.',
    features: [
      '📇 Tek tıkla doğrudan telefon rehberine kayıt (.vcf formatı)',
      '🔗 Sosyal medya hesapları, web sitesi, katalog ve portfolyo',
      '💳 Hızlı ödemeler için tek tıkla kopyalanabilir IBAN ve banka kartları',
      '📡 Lüks mat siyah lazer baskılı NFC temassız akıllı kartvizit seçeneği',
      '🔄 Bilgileri panelden anında ücretsiz güncelleme (kartı yeniden basmak yok)',
    ],
    demoSlug: '/samet-sunman',
    demoLabel: 'Örnek Kartvizit (Samet Sunman)',
    actionRoute: '/panel/kartvizit',
    actionLabel: 'Kartviziti İncele',
    landingSlug: '/kartvizit',
    mockupImage:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '💼 Samet Sunman • Senior Software Architect • Asnus Tech',
    statLabel: 'Rehbere Kayıt',
    statValue: '48.000+',
  },
  menu: {
    key: 'menu',
    label: 'Restoran Menü QR',
    badge: 'Kafe & Restoran',
    icon: 'restaurant',
    accentColor: '#F59E0B',
    gradientBg: ['#1E1202', '#0A0702'],
    title: 'Masanızdan Anlık Güncellenen, Fotoğraflı Dijital Menü',
    subtitle: 'Kağıt menü baskı maliyetine son. Fiyatları ve görselleri panelden saniyeler içinde değiştirin.',
    description:
      'Restoran, kafe, bar ve oteller için temassız dijital menü. Misafirler masadaki karekodla kategorileri gezsin, fotoğrafları ve alerjen etiketlerini incelesin. Garson çağırma ve çoklu dil desteğiyle işletmenizin verimliliğini artırın.',
    features: [
      '⚡ Anlık fiyat ve ürün güncelleme (yeni baskı maliyeti sıfır)',
      '📸 Yüksek çözünürlüklü iştah açıcı ürün fotoğrafları ve detaylar',
      '🥜 Detaylı alerjen ve kalori etiketleri',
      '🌍 Yabancı misafirler için otomatik çoklu dil desteği',
      '📊 Masa bazlı görüntülenme ve ürün ilgi analitiği',
    ],
    demoSlug: '/m/lucca-bistrot',
    demoLabel: 'Örnek Menü (Lucca Bistrot)',
    actionRoute: '/panel/menu',
    actionLabel: 'Menüyü İncele',
    landingSlug: '/menu',
    mockupImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '🍽️ Lucca Bistrot & Cocktail Bar • Dijital Menü',
    statLabel: 'Menü Görüntüleme',
    statValue: '320.000+',
  },
  wedding: {
    key: 'wedding',
    label: 'Etkinlik & Davet Albümü',
    badge: 'Canlı Fotoğraf Duvarı',
    icon: 'images',
    accentColor: '#EC4899',
    gradientBg: ['#1F1A12', '#0F0E0C'],
    title: 'Etkinlik ve Davetlerde Masadan Fotoğraf Toplayın, Ekrana Yansıtın',
    subtitle: 'Düğün, lansman ve kurumsal etkinliklerde misafirlerin çektiği fotoğrafları tek tıkla dev ekranda toplayın.',
    description:
      'Misafirlerinizin çektiği eşsiz anlar WhatsApp gruplarında kaybolmasın. Masadaki zarif stanttan karekodu okutan misafirler uygulama indirmeden fotoğraflarını yüklesin; salondaki projeksiyonda canlı yayınlansın ve gece sonunda tek tıkla ZIP arşiv olarak indirin.',
    features: [
      '📱 Sıfır uygulama indirme (kamera açılır açılmaz anında yükleme)',
      '📺 Salona özel canlı projeksiyon & dev ekran TV slayt modu',
      '💌 Ziyaretçi dijital anı defteri ve tebrik mesajları',
      '📦 Tek tıkla orijinal kalitede ZIP arşiv indirme',
      '🔒 PIN kodu koruması ve anlık moderasyon',
    ],
    demoSlug: '/samet-ve-sule',
    demoLabel: 'Örnek Etkinlik Albümü',
    actionRoute: '/panel',
    actionLabel: 'Albümü İncele',
    landingSlug: '/dugun',
    mockupImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    mockupTag: '📸 Gala & Kutlama • Canlı Fotoğraf Havuzu',
    statLabel: 'Fotoğraf Arşivi',
    statValue: '150.000+',
  },
};

// Tech SaaS Color Palette (Electric Indigo & Slate)
const BRAND_PRIMARY = '#6366F1';
const BRAND_SECONDARY = '#06B6D4';

const QR_PALETTE = [
  { name: 'Koyu Grafit', hex: '#0F172A' },
  { name: 'Elektrik İndigo', hex: '#6366F1' },
  { name: 'Okyanus Mavisi', hex: '#0284C7' },
  { name: 'Pati Zümrüdü', hex: '#10B981' },
  { name: 'Canlı Mercan', hex: '#F43F5E' },
];

const PRESETS = [
  { label: '🔗 Web / Link', value: 'https://qr-la.com', color: '#0F172A' },
  { label: '🚗 Araç Park Tagı', value: 'https://qr-la.com/34abc123', color: '#0284C7' },
  { label: '🐾 GPS Pati Künyesi', value: 'https://qr-la.com/p/duman', color: '#10B981' },
  { label: '💼 Dijital vCard', value: 'https://qr-la.com/samet-sunman', color: '#6366F1' },
  { label: '🍽️ Restoran Menü', value: 'https://qr-la.com/m/lucca-bistrot', color: '#F59E0B' },
  { label: '📸 Etkinlik Albümü', value: 'https://qr-la.com/samet-ve-sule', color: '#EC4899' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  const isTablet = width > 600 && width <= 900;
  const isMobile = width <= 600;
  const { colors, isDark } = useTheme();

  const [activeModule, setActiveModule] = useState<ModuleKey>('vehicle');
  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);
  const [moduleControls, setModuleControls] = useState<Record<PlatformModuleKey, ModuleControlConfig>>(DEFAULT_MODULE_CONTROLS);

  // Live Quick QR Generator State
  const [qrInputText, setQrInputText] = useState('https://qr-la.com');
  const [selectedQrColor, setSelectedQrColor] = useState(BRAND_PRIMARY);
  const [liveQrDataUrl, setLiveQrDataUrl] = useState('');
  const [isQrGenerating, setIsQrGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Modals for Create and Demo selection
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

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

  // Generate live QR code
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
            light: isDark ? '#111827' : '#FFFFFF',
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
  const selectedConfig = MODULES[activeModule] || MODULES.vehicle;

  const handleStartNow = (modKey?: ModuleKey) => {
    const key = modKey || activeModule;
    if (isUserLoggedIn) {
      if (key === 'vehicle') router.push('/otomobil' as any);
      else if (key === 'pet') router.push('/pati' as any);
      else if (key === 'vcard') router.push('/kartvizit' as any);
      else if (key === 'menu') router.push('/menu' as any);
      else router.push('/panel' as any);
    } else {
      router.push({ pathname: '/giris', params: { tab: 'register' } } as any);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#090D16' : '#F8FAFC' }]}>
      <Head>
        <title>QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu</title>
        <meta
          name="description"
          content="Araç camında numara gizleyen akıllı park tagı, Petguru GPS pati künyesi, NFC dijital kartvizit, restoran menü ve etkinlik fotoğraf havuzu. Tek dinamik ekosistem."
        />
        <meta
          name="keywords"
          content="qr-la, dinamik karekod, akıllı qr kod, araç park tagı, gizli numara qr, petguru evcil hayvan künye, dijital kartvizit nfc, vcard, restoran qr menü"
        />
        <meta property="og:title" content="QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu" />
        <meta
          property="og:description"
          content="Fiziksel dünyayı dijitale bağlayan dinamik QR kod platformu. Araç, evcil hayvan, kartvizit, menü ve etkinlik çözümleri."
        />
        <meta property="og:url" content="https://qr-la.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://qr-la.com/og-banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QR-la | Yeni Nesil Dinamik QR Kod &amp; Akıllı Etiket Platformu" />
        <meta
          name="twitter:description"
          content="Fiziksel dünyayı dijitale bağlayan dinamik QR kod platformu."
        />
        <meta name="twitter:image" content="https://qr-la.com/og-banner.png" />
        <link rel="canonical" href="https://qr-la.com" />
      </Head>

      {/* Floating Glass Navbar */}
      <View style={[styles.navWrapper, { backgroundColor: isDark ? 'rgba(9, 13, 22, 0.88)' : 'rgba(255, 255, 255, 0.92)' }]}>
        <View style={styles.navContainer}>
          {/* Brand Logo */}
          <TouchableOpacity
            style={styles.logoRow}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.logoBadgeIcon, { backgroundColor: BRAND_PRIMARY }]}>
              <Ionicons name="qr-code" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              QR<Text style={{ color: BRAND_PRIMARY }}>-LA</Text>
            </Text>
            <View style={styles.livePulseDot} />
          </TouchableOpacity>

          {/* Desktop Nav Links */}
          {isDesktop && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity onPress={() => router.push('/otomobil' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Araç Tagı</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/pati' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Pati Künyesi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/kartvizit' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Kartvizit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/menu' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94A3B8' : '#64748B' }]}>QR Menü</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/dugun' as any)} style={styles.navLinkItem}>
                <Text style={[styles.navLinkText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Etkinlik</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Header Actions */}
          <View style={styles.navRightActions}>
            <ThemeToggleBtn />

            <TouchableOpacity
              style={[
                styles.navDemoBtn,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? '#334155' : '#E2E8F0' },
              ]}
              onPress={() => setIsDemoModalOpen(true)}
            >
              <Ionicons name="sparkles" size={13} color={BRAND_PRIMARY} />
              <Text style={[styles.navDemoBtnText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>Canlı Demo</Text>
            </TouchableOpacity>

            {isUserLoggedIn ? (
              <TouchableOpacity
                style={[styles.navPrimaryBtn, { backgroundColor: BRAND_PRIMARY }]}
                onPress={() => router.push('/panel' as any)}
              >
                <Text style={styles.navPrimaryBtnText}>Panelim</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navPrimaryBtn, { backgroundColor: BRAND_PRIMARY }]}
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
        {/* HERO SECTION (Linear / Stripe Tech Minimal Dark Aurora) */}
        {/* ========================================================================= */}
        <View style={styles.heroWrapper}>
          {/* Subtle Ambient Tech Glows */}
          <View style={[styles.glowOrbIndigo, { opacity: isDark ? 0.2 : 0.08 }]} />
          <View style={[styles.glowOrbCyan, { opacity: isDark ? 0.15 : 0.06 }]} />

          <View style={styles.heroContent}>
            {/* Unified Overline Pill */}
            <View style={[styles.heroPill, { borderColor: isDark ? '#334155' : '#E2E8F0', backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF' }]}>
              <View style={[styles.heroPillDot, { backgroundColor: BRAND_PRIMARY }]} />
              <Text style={[styles.heroPillText, { color: BRAND_PRIMARY }]}>DİNAMİK KAREKOD &amp; AKILLI ETİKET PLATFORMU</Text>
              <View style={[styles.heroPillBadge, { backgroundColor: BRAND_PRIMARY }]}>
                <Text style={styles.heroPillBadgeText}>V2.0</Text>
              </View>
            </View>

            {/* Massive Tech Headline */}
            <Text style={[styles.heroHeadline, isMobile && styles.heroHeadlineMobile, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Fiziksel Olan Her Şeyi{' '}
              <Text style={{ color: BRAND_PRIMARY }}>Tek Bir Dinamik QR İle</Text>{' '}
              Dijitale Bağlayın.
            </Text>

            {/* Subtitle */}
            <Text style={[styles.heroSub, isMobile && styles.heroSubMobile, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Araç camında numara gizleme, Petguru GPS pati künyesi, temassız NFC kartvizit, restoran menüsü ve özel etkinlik fotoğraf havuzu. Tüm dinamik QR çözümlerinizi tek bir kontrol panelinden yönetin.
            </Text>

            {/* Dual CTA */}
            <View style={[styles.heroCtaRow, isMobile && styles.heroCtaRowMobile]}>
              <TouchableOpacity
                style={[styles.heroPrimaryBtn, { backgroundColor: BRAND_PRIMARY }]}
                onPress={() => setIsCreateModalOpen(true)}
                activeOpacity={0.88}
              >
                <Text style={styles.heroPrimaryBtnText}>Modülleri İncele</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.heroSecondaryBtn,
                  { borderColor: isDark ? '#334155' : '#CBD5E1', backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF' },
                ]}
                onPress={() => setIsDemoModalOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="layers-outline" size={19} color={BRAND_PRIMARY} />
                <Text style={[styles.heroSecondaryBtnText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Canlı Demoyu İncele
                </Text>
              </TouchableOpacity>
            </View>

            {/* Micro Trust Stats */}
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatItem}>
                <Ionicons name="flash-outline" size={15} color="#10B981" />
                <Text style={[styles.heroStatText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Uygulama İndirmek Yok</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#0284C7" />
                <Text style={[styles.heroStatText, { color: isDark ? '#94A3B8' : '#64748B' }]}>%100 Numara Gizliliği</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="navigate-outline" size={15} color="#10B981" />
                <Text style={[styles.heroStatText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Petguru GPS Takibi</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="infinite-outline" size={15} color="#8B5CF6" />
                <Text style={[styles.heroStatText, { color: isDark ? '#94A3B8' : '#64748B' }]}>Sınırsız Dinamik Düzenleme</Text>
              </View>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* HERO LIVE INTERACTIVE QUICK QR GENERATOR WIDGET */}
          {/* ========================================================================= */}
          <View style={[styles.quickGeneratorCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
            <View style={styles.quickGenHeader}>
              <View style={styles.quickGenTitleRow}>
                <View style={[styles.quickGenIconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="sparkles" size={16} color={BRAND_PRIMARY} />
                </View>
                <View>
                  <Text style={[styles.quickGenTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Hızlı Karekod Üretici</Text>
                  <Text style={[styles.quickGenSub, { color: isDark ? '#94A3B8' : '#64748B' }]}>Anında oluştur, renk seç ve yüksek çözünürlüklü indir</Text>
                </View>
              </View>
              <View style={styles.instantFreePill}>
                <Text style={styles.instantFreePillText}>ÜCRETSİZ &amp; ANINDA</Text>
              </View>
            </View>

            <View style={[styles.quickGenBody, !isDesktop && styles.quickGenBodyStacked]}>
              {/* Left Controls */}
              <View style={styles.quickGenLeft}>
                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Hazır Şablon Seç:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScrollView}>
                  {PRESETS.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: qrInputText === p.value ? p.color : isDark ? '#1E293B' : '#F1F5F9',
                          borderColor: qrInputText === p.value ? p.color : isDark ? '#334155' : '#CBD5E1',
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
                          { color: qrInputText === p.value ? '#FFF' : isDark ? '#F1F5F9' : '#0F172A' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Hedef Web Adresi veya Metin:</Text>
                <View style={[styles.inputBox, { backgroundColor: isDark ? '#090D16' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                  <Ionicons name="link-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={[styles.textInput, { color: isDark ? '#F8FAFC' : '#0F172A' }]}
                    value={qrInputText}
                    onChangeText={setQrInputText}
                    placeholder="https://..."
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {qrInputText.length > 0 && (
                    <TouchableOpacity onPress={() => setQrInputText('')} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Color Palette Selector */}
                <Text style={[styles.inputLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>Karekod Rengi:</Text>
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
                  <Text style={[styles.colorNameLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {QR_PALETTE.find((c) => c.hex === selectedQrColor)?.name}
                  </Text>
                </View>
              </View>

              {/* Right QR Display Box */}
              <View style={styles.quickGenRight}>
                <View style={[styles.qrPreviewBox, { backgroundColor: isDark ? '#090D16' : '#F8FAFC', borderColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
                  {liveQrDataUrl ? (
                    <Image
                      source={{ uri: liveQrDataUrl }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.qrLoadingBox}>
                      <Ionicons name="qr-code-outline" size={48} color="#94A3B8" />
                      <Text style={styles.qrLoadingText}>Karekod Oluşturuluyor...</Text>
                    </View>
                  )}

                  <View style={[styles.qrLiveBadge, { backgroundColor: isDark ? '#1E293B' : '#0F172A' }]}>
                    <View style={[styles.qrLiveDot, { backgroundColor: selectedQrColor }]} />
                    <Text style={styles.qrLiveBadgeText}>Canlı Önizleme</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.qrActionBtnRow}>
                  <TouchableOpacity style={[styles.qrDownloadBtn, { backgroundColor: BRAND_PRIMARY }]} onPress={handleDownloadQr}>
                    <Ionicons name="download-outline" size={16} color="#FFF" />
                    <Text style={styles.qrDownloadBtnText}>PNG İndir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.qrCopyBtn, { borderColor: isDark ? '#334155' : '#CBD5E1' }]}
                    onPress={handleCopyLink}
                  >
                    <Ionicons name={copiedLink ? 'checkmark' : 'copy-outline'} size={15} color={copiedLink ? '#10B981' : isDark ? '#F8FAFC' : '#0F172A'} />
                    <Text style={[styles.qrCopyBtnText, { color: copiedLink ? '#10B981' : isDark ? '#F8FAFC' : '#0F172A' }]}>
                      {copiedLink ? 'Kopyalandı' : 'Linki Kopyala'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* LINEAR STYLE BENTO GRID (5 BALANCED, EQUAL MODULE CARDS) */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={[styles.sectionOverlinePill, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Text style={[styles.sectionOverlineText, { color: BRAND_PRIMARY }]}>5 GÜÇLÜ MODÜL • TEK EKOSİSTEM</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Her İhtiyaca Özel Geliştirilmiş Akıllı Çözümler
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              QR-la; statik link yönlendirmesi yerine her kullanım senaryosu için özel tasarlanmış interaktif web araçları sunar.
            </Text>
          </View>

          {/* Bento Grid: 2 Top + 3 Bottom Equal High-Tech Cards */}
          <View style={styles.bentoContainer}>
            {/* ==================== BENTO CARD 1: ARAÇ & PARK TAGI ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                      <Ionicons name="car-sport" size={22} color="#0284C7" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(2, 132, 199, 0.12)', borderColor: 'rgba(2, 132, 199, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#0284C7' }]}>Araç &amp; Park Tagı</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#0284C7' }]}>%100 Gizlilik</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Numaranızı Gizleyin, Araç Camından Güvenle Ulaşılsın
                </Text>
                <Text style={[styles.bentoDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Ön camdaki UV sticker taranınca telefon numaranız asla yabancılara gösterilmez. Hazır şablon mesajlarla anında WhatsApp veya arama köprüsü kurulur.
                </Text>

                {/* Simulated Privacy Phone Shield */}
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
                      <Text style={styles.quickTemplatePillText}>🚨 Farlarınız açık</Text>
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
                    onPress={() => router.push('/otomobil' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Araç Tagını İncele</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" />
                  </TouchableOpacity>


                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 2: PETGURU GPS PATİ KÜNYESİ ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardHalf, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <Ionicons name="paw" size={22} color="#10B981" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#10B981' }]}>Petguru x QR-la</Text>
                    </View>
                  </View>
                  <Text style={[styles.bentoMetricText, { color: '#10B981' }]}>Canlı GPS</Text>
                </View>

                <Text style={[styles.bentoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Kayıp Halinde Anlık GPS Konumu Bildiren Akıllı Künye
                </Text>
                <Text style={[styles.bentoDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Tasmadaki lazer kazıma künye tarandığı anda bulan kişinin GPS konumu Petguru altyapısına iletilir, sahibe anlık bildirim gider ve aşı karnesi açılır.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#021B12' : '#F0FDF4' }]}>
                  <View style={styles.maskedNumberRow}>
                    <Ionicons name="navigate-circle" size={16} color="#10B981" />
                    <Text style={[styles.maskedNumberText, { color: '#10B981' }]}>40.9833° N, 29.0278° E (Kadıköy)</Text>
                    <View style={[styles.maskedVerifiedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Text style={[styles.maskedVerifiedBadgeText, { color: '#10B981' }]}>Canlı Konum</Text>
                    </View>
                  </View>

                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🐕 Duman (Golden)</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>💉 Aşı Karnesi Aktif</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📞 Sahibi Ara</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bentoBtnRow}>
                  <TouchableOpacity
                    style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => router.push('/pati' as any)}
                  >
                    <Text style={styles.bentoPrimaryActionBtnText}>Pati Künyesini İncele</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" />
                  </TouchableOpacity>


                </View>
              </View>
            </View>

            {/* ==================== BENTO CARD 3: DİJİTAL KARTVİZİT (NFC) ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardThird, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                      <Ionicons name="briefcase" size={20} color={BRAND_PRIMARY} />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: 'rgba(99, 102, 241, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: BRAND_PRIMARY }]}>vCard &amp; NFC</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.bentoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Tek Dokunuşla Rehbere Kaydolun
                </Text>
                <Text style={[styles.bentoDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  NFC kartı telefona yaklaştırın; profiliniz, sosyal ağlarınız ve IBAN bilgileriniz tek tıkla (.vcf) kaydedilsin.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#170A26' : '#EEF2FF' }]}>
                  <Text style={[styles.maskedNumberText, { color: BRAND_PRIMARY, marginBottom: 8 }]}>Samet Sunman • Architect</Text>
                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📇 Rehbere Kaydet</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>💳 IBAN</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.bentoPrimaryActionBtn, { backgroundColor: BRAND_PRIMARY }]}
                  onPress={() => router.push('/kartvizit' as any)}
                >
                  <Text style={styles.bentoPrimaryActionBtnText}>Kartviziti İncele</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ==================== BENTO CARD 4: RESTORAN QR MENÜ ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardThird, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Ionicons name="restaurant" size={20} color="#F59E0B" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#F59E0B' }]}>Kafe &amp; Restoran</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.bentoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Anlık Güncellenen Menü
                </Text>
                <Text style={[styles.bentoDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Baskı maliyetine son. Fiyatları ve görselleri panelden saniyeler içinde değiştirin, garson çağırma özelliğini kullanın.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#1E1202' : '#FFFBEB' }]}>
                  <Text style={[styles.maskedNumberText, { color: '#F59E0B', marginBottom: 8 }]}>Lucca Bistrot • Dijital Menü</Text>
                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🔔 Garson Çağır</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>🥜 Alerjenler</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#F59E0B' }]}
                  onPress={() => router.push('/menu' as any)}
                >
                  <Text style={styles.bentoPrimaryActionBtnText}>Menüyü İncele</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ==================== BENTO CARD 5: ETKİNLİK & DAVET ALBÜMÜ ==================== */}
            <View style={[styles.bentoCard, styles.bentoCardThird, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={styles.bentoCardInner}>
                <View style={styles.bentoCardHeader}>
                  <View style={styles.bentoIconRow}>
                    <View style={[styles.bentoIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                      <Ionicons name="images" size={20} color="#EC4899" />
                    </View>
                    <View style={[styles.bentoPill, { backgroundColor: 'rgba(236, 72, 153, 0.12)', borderColor: 'rgba(236, 72, 153, 0.3)' }]}>
                      <Text style={[styles.bentoPillText, { color: '#EC4899' }]}>Etkinlik &amp; Davet</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.bentoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Canlı Fotoğraf Havuzu
                </Text>
                <Text style={[styles.bentoDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Düğün veya kurumsal etkinlikte misafir fotoğraflarını masadan toplayın, salondaki dev ekrana yansıtın, ZIP indirin.
                </Text>

                <View style={[styles.simulatedShieldBox, { backgroundColor: isDark ? '#1F0B18' : '#FDF2F8' }]}>
                  <Text style={[styles.maskedNumberText, { color: '#EC4899', marginBottom: 8 }]}>Canlı Salon Projeksiyonu</Text>
                  <View style={styles.quickTemplatePills}>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📺 TV Slayt</Text>
                    </View>
                    <View style={styles.quickTemplatePill}>
                      <Text style={styles.quickTemplatePillText}>📦 ZIP İndir</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.bentoPrimaryActionBtn, { backgroundColor: '#EC4899' }]}
                  onPress={() => router.push('/dugun' as any)}
                >
                  <Text style={styles.bentoPrimaryActionBtnText}>Albümü İncele</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* INTERACTIVE DEVICE PREVIEW SIMULATOR (TABBED) */}
        {/* ========================================================================= */}
        <View style={[styles.simulatorSection, { backgroundColor: isDark ? '#0A0E18' : '#F1F5F9' }]}>
          <View style={styles.sectionHeaderCentered}>
            <View style={[styles.sectionOverlinePill, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Text style={[styles.sectionOverlineText, { color: BRAND_PRIMARY }]}>MOBİL DENEYİM SİMÜLATÖRÜ</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              Kullanıcılarınızın Göreceği Gerçek Mobil Ekran
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Aşağıdaki sekmelerden dilediğiniz modülü seçerek telefon arayüzünü canlı olarak inceleyin:
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
                    {
                      backgroundColor: isSelected ? mod.accentColor : isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isSelected ? mod.accentColor : isDark ? '#334155' : '#E2E8F0',
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
                      { color: isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
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
              <View style={[styles.phoneBezel, { borderColor: isDark ? '#334155' : '#CBD5E1' }]}>
                {/* Dynamic Island */}
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
              <View style={[styles.simModuleBadge, { backgroundColor: selectedConfig.accentColor + '18', borderColor: selectedConfig.accentColor + '35' }]}>
                <Text style={[styles.simModuleBadgeText, { color: selectedConfig.accentColor }]}>
                  {selectedConfig.label}
                </Text>
              </View>

              <Text style={[styles.simTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                {selectedConfig.title}
              </Text>
              <Text style={[styles.simDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {selectedConfig.description}
              </Text>

              {/* Feature Checklist */}
              <View style={styles.simFeaturesList}>
                {selectedConfig.features.map((feat, idx) => (
                  <View key={idx} style={styles.simFeatureItem}>
                    <Ionicons name="checkmark-circle" size={17} color={selectedConfig.accentColor} style={{ marginRight: 8 }} />
                    <Text style={[styles.simFeatureText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Dual CTA */}
              <View style={styles.simCtaRow}>
                <TouchableOpacity
                  style={[styles.simPrimaryBtn, { backgroundColor: selectedConfig.accentColor }]}
                  onPress={() => router.push(selectedConfig.landingSlug as any)}
                >
                  <Text style={styles.simPrimaryBtnText}>{selectedConfig.actionLabel}</Text>
                  <Ionicons name="arrow-forward" size={15} color="#FFF" />
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
            <View style={[styles.sectionOverlinePill, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
              <Text style={[styles.sectionOverlineText, { color: '#818CF8' }]}>FİJİTAL DEĞER TEKLİFİ</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: '#FFF' }]}>
              Dijital Kolaylık + Lüks Fiziksel Baskı Kalitesi
            </Text>
            <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile, { color: '#94A3B8' }]}>
              İster sadece dinamik QR kodunuzu ücretsiz üretip kendiniz kullanın; isterseniz kapınıza teslim edilen yüksek kaliteli UV cam sticker’ı, pleksi stand veya çelik künye ile deneyimi taçlandırın.
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
                <Text style={styles.phygitalBadgeText}>🚗 Araç &amp; Motosiklet</Text>
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
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Ionicons name="card-outline" size={26} color="#818CF8" />
              </View>
              <Text style={styles.phygitalCardTitle}>Mat Siyah Temassız NFC Kartvizit</Text>
              <Text style={styles.phygitalCardDesc}>
                Telefona yaklaştırıldığı anda profilinizi açan akıllı NFC çipli şık kartvizit. Kağıt kartvizitleri çöpe atın.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>💼 Dijital Kartvizit</Text>
              </View>
            </View>

            <View style={styles.phygitalCard}>
              <View style={[styles.phygitalIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="restaurant-outline" size={26} color="#FBBF24" />
              </View>
              <Text style={styles.phygitalCardTitle}>Lüks Pleksi Masa Standı</Text>
              <Text style={styles.phygitalCardDesc}>
                Restoran masalarına ve özel davetlere yakışan lüks akrilik / pleksi ayaklı masa stantları.
              </Text>
              <View style={styles.phygitalBadge}>
                <Text style={styles.phygitalBadgeText}>🍽️ Menü &amp; Masa</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* HOW IT WORKS SECTION */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={[styles.sectionOverlinePill, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Text style={[styles.sectionOverlineText, { color: BRAND_PRIMARY }]}>NASIL ÇALIŞIR?</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              3 Adımda Zahmetsiz Deneyim
            </Text>
          </View>

          <View style={[styles.stepsGrid, isDesktop ? styles.stepsGridDesktop : styles.stepsGridMobile]}>
            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Text style={[styles.stepNumber, { color: BRAND_PRIMARY }]}>1</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="create-outline" size={28} color={BRAND_PRIMARY} />
              </View>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Modülünü Seç &amp; Oluştur</Text>
              <Text style={[styles.stepDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Araç tagı, pati künyesi, kartvizit, menü veya etkinlik albümü modüllerinden birini seçip bilgilerinizi girin.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                <Text style={[styles.stepNumber, { color: '#0284C7' }]}>2</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="qr-code-outline" size={28} color="#0284C7" />
              </View>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>İster İndir, İster Bastır</Text>
              <Text style={[styles.stepDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Karekodunuzu anında ücretsiz PNG formatında indirin veya kapınıza teslim fiziksel baskısını sipariş edin.
              </Text>
            </View>

            <View style={[styles.stepCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <View style={[styles.stepNumberBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={[styles.stepNumber, { color: '#10B981' }]}>3</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="sparkles-outline" size={28} color="#10B981" />
              </View>
              <Text style={[styles.stepTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Canlı Yönet &amp; Güncelle</Text>
              <Text style={[styles.stepDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Panelinizden dilediğiniz zaman içeriği güncelleyin; tarama istatistiklerini ve raporları canlı takip edin.
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* FAQ ACCORDION SECTION */}
        {/* ========================================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <View style={[styles.sectionOverlinePill, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Text style={[styles.sectionOverlineText, { color: BRAND_PRIMARY }]}>SIKÇA SORULAN SORULAR</Text>
            </View>
            <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
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
                a: 'Kayıp hayvan tasmadaki künyeyi taratan kişinin onaylı anlık GPS konumu doğrudan Petguru altyapısına iletilir ve hayvan sahibine SMS/Push bildirimi gider. Bulan kişi ayrıca veteriner acil numaralarını ve aşı karnesini tek ekranda görebilir.',
              },
              {
                q: 'Dinamik karekod basıldıktan sonra içeriği değiştirebilir miyim?',
                a: 'Evet! Dinamik karekod teknolojisi sayesinde fiziksel olarak bastırdığınız UV sticker, pleksi stand veya künyedeki QR kod değişmeden; yönlendiği sayfayı, iletişim bilgilerini ve menü fiyatlarını panelinizden dilediğiniz an güncelleyebilirsiniz.',
              },
              {
                q: 'Fiziksel ürünler ne kadar sürede teslim edilir?',
                a: 'Sipariş ettiğiniz UV araç sticker’ları, lazer kazımalı çelik tasma künyeleri ve NFC akıllı kartvizitler 1-2 iş günü içerisinde özel korumalı ambalajında kargoya teslim edilir.',
              },
            ].map((item, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.faqCard,
                    {
                      backgroundColor: isDark ? '#111827' : '#FFFFFF',
                      borderColor: isExpanded ? BRAND_PRIMARY : isDark ? '#1E293B' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeaderRow}>
                    <Text style={[styles.faqQuestionText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{item.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isExpanded ? BRAND_PRIMARY : '#94A3B8'}
                    />
                  </View>
                  {isExpanded && (
                    <Text style={[styles.faqAnswerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>{item.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <View style={[styles.footer, { backgroundColor: isDark ? '#080C14' : '#F1F5F9', borderTopColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
          <View style={styles.footerTopRow}>
            <View style={styles.footerBrandCol}>
              <View style={styles.logoRow}>
                <View style={[styles.logoBadgeIcon, { backgroundColor: BRAND_PRIMARY }]}>
                  <Ionicons name="qr-code" size={18} color="#FFFFFF" />
                </View>
                <Text style={[styles.logoText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  QR<Text style={{ color: BRAND_PRIMARY }}>-LA</Text>
                </Text>
              </View>
              <Text style={[styles.footerTagline, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Fiziksel dünyayı dijitale bağlayan yeni nesil dinamik QR kod ve akıllı etiket ekosistemi.
              </Text>
            </View>

            <View style={styles.footerLinksGrid}>
              {visibleModules.map((mod) => (
                <TouchableOpacity key={mod.key} onPress={() => setActiveModule(mod.key)}>
                  <Text style={[styles.footerLink, { color: isDark ? '#94A3B8' : '#64748B' }]}>{mod.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => router.push('/admin' as any)}>
                <Text style={[styles.footerLink, { color: BRAND_PRIMARY, fontWeight: '700' }]}>⚙️ Platform Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.footerDivider, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />

          <View style={styles.footerBottomRow}>
            <Text style={[styles.footerCopy, { color: isDark ? '#64748B' : '#94A3B8' }]}>
              &copy; 2026 QR-la Platformu. Tüm hakları saklıdır.
            </Text>
            <Text style={[styles.footerSubNote, { color: isDark ? '#64748B' : '#94A3B8' }]}>
              Araç Tagı • Petguru Pati Künyesi • NFC Kartvizit • Restoran Menü • Etkinlik Albümü
            </Text>
          </View>
        </View>
      </ScrollView>
      {/* ========================================================================= */}
      {/* 1. MODÜL SEÇ & QR OLUŞTUR MODALI */}
      {/* ========================================================================= */}
      <Modal
        visible={isCreateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Hangi Modülü İncelemek İstiyorsunuz?
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  İhtiyacınıza uygun çözümü seçerek detaylı sayfasına gidin:
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              {/* Araç */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  router.push('/otomobil' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Ionicons name="car-sport" size={22} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🚗 Araç &amp; Park Tagı</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Gizli numara maskeleme ve hazır WhatsApp şablonları</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Pati */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  router.push('/pati' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="paw" size={22} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🐾 Petguru GPS Pati Künyesi</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Kayıp anında canlı harita bildirimi ve dijital aşı karnesi</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Kartvizit */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  router.push('/kartvizit' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="briefcase" size={22} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>💼 Dijital Kartvizit (NFC &amp; vCard)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Tek dokunuşla rehbere kayıt ve profesyonel profil</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Menü */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  router.push('/menu' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="restaurant" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🍽️ Restoran &amp; Kafe Menü QR</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Fotoğraflı dijital menü ve garson çağırma sistemi</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Etkinlik */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  router.push('/dugun' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Ionicons name="images" size={22} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>📸 Etkinlik &amp; Davet Albümü</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Misafirlerden canlı fotoğraf toplama ve projeksiyon slaytı</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. CANLI DEMO SEÇİM MODALI */}
      {/* ========================================================================= */}
      <Modal
        visible={isDemoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDemoModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  Canlı Demo İnceleyin
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Tüm modüllerimizin gerçek canlı arayüzlerini ve demo panelini test edin:
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsDemoModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              {/* Araç Demosu */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/34abc123' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Ionicons name="car-sport" size={22} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🚗 34 ABC 123 (Araç Tagı Demosu)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Gizli numara WhatsApp köprüsünü ve kan grubu acil durum ekranını görün</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#0284C7" />
              </TouchableOpacity>

              {/* Pati Demosu */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/p/duman' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="paw" size={22} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🐾 Duman (Pati Künyesi Demosu)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Petguru entegrasyonlu GPS konum paylaşımı ve aşı karnesini test edin</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#10B981" />
              </TouchableOpacity>

              {/* Kartvizit Demosu */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/samet-sunman' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="briefcase" size={22} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>💼 Samet Sunman (Dijital Kartvizit)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Tek tıkla rehbere (.vcf) indirme ve sosyal medya profilini inceleyin</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#6366F1" />
              </TouchableOpacity>

              {/* Menü Demosu */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/m/lucca-bistrot' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="restaurant" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>🍽️ Lucca Bistrot (Restoran QR Menü)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Fotoğraflı menüyü gezin, garson çağırma butonunu test edin</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#F59E0B" />
              </TouchableOpacity>

              {/* Etkinlik Demosu */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/samet-ve-sule' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Ionicons name="images" size={22} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>📸 Samet &amp; Şule (Etkinlik Albümü)</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Misafir fotoğraf yükleme galerisini ve anı defterini görün</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#EC4899" />
              </TouchableOpacity>

              {/* Yönetim Paneli */}
              <TouchableOpacity
                style={[styles.modalItemCard, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF', borderColor: 'rgba(99, 102, 241, 0.3)' }]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/panel' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="grid" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: '#6366F1' }]}>📊 Çoklu Varlık Yönetim Paneli</Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>Tüm modüllerin tek bir merkezden yönetildiği demo panel</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
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
  },
  navPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  glowOrbIndigo: {
    position: 'absolute',
    top: -80,
    right: 20,
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: '#6366F1',
  },
  glowOrbCyan: {
    position: 'absolute',
    top: 120,
    left: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#06B6D4',
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
    marginBottom: 20,
  },
  heroPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  heroPillBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
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
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
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
    backgroundColor: '#64748B',
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
    shadowOpacity: 0.12,
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
    color: '#94A3B8',
  },
  qrLiveBadge: {
    position: 'absolute',
    bottom: -10,
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
    marginBottom: 12,
  },
  sectionOverlineText: {
    fontSize: 11,
    fontWeight: '800',
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  bentoCardHalf: {
    flex: 1,
    minWidth: 340,
  },
  bentoCardThird: {
    flex: 1,
    minWidth: 280,
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
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  bentoDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },

  /* Simulated Box */
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
    color: '#94A3B8',
  },

  /* Bento Buttons */
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
  },
  moduleTabText: {
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: '#0A0E18',
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
    color: '#94A3B8',
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
    color: '#CBD5E1',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '900',
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
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
  planCtaBtnPopular: {},
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

  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalCard: {
    maxWidth: 640,
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalGrid: {
    gap: 10,
  },
  modalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  modalItemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalItemDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
