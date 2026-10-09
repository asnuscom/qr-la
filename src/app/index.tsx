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
import { PLAN_TIERS } from '@/services/mockData';
import { authService } from '@/services/authService';
import { UserModel } from '@/types';

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isMobile = width <= 768;
  const isSmallPhone = width < 390;

  const [currentUser, setCurrentUser] = useState<UserModel | null>(authService.getState().user);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = "QR-la | Düğünde & Nikahta Karekodla Fotoğraf Yüklemesi - Davetiye Etkinlik Albümü";

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        'Düğün, nikah ve özel davetiye etkinliklerinizde masalardaki karekodla misafirlerinizden anında yüksek çözünürlüklü fotoğraf toplayın. Uygulama indirmeden karekodla fotoğraf yüklemesi, canlı TV/projeksiyon yayını ve tek tıkla ZIP arşiv indirme.'
      );

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute(
        'content',
        'davetiye etkinlik, düğünde nikahta karekodla fotoğraf yüklemesi, düğün karekod fotoğraf, nikah karekod fotoğraf, karekodla fotoğraf toplama, masada qr kod fotoğraf, dijital davetiye etkinlik fotoğraf albümü, etkinlik karekod galeri, düğün masa kartı qr kod, kına gecesi karekod, canlı projeksiyon düğün slayt'
      );
    }
  }, []);

  useEffect(() => {
    const unsub = authService.subscribe((state) => {
      setCurrentUser(state.user);
    });
    return () => unsub();
  }, []);

  const isUserLoggedIn = Boolean(currentUser && currentUser.uid !== 'demo-host-yavuz');

  const handleStartEvent = () => {
    if (isUserLoggedIn) {
      router.push('/panel' as any);
    } else {
      router.push({ pathname: '/giris', params: { tab: 'register' } } as any);
    }
  };

  const handleSelectPlan = () => {
    if (isUserLoggedIn) {
      router.push('/panel/tarifeler' as any);
    } else {
      router.push({ pathname: '/giris', params: { tab: 'register' } } as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Head>
        <title>QR-la | Masadaki Kodu QR'la, En Mutlu Anları Paylaş &amp; Kutla</title>
        <meta
          name="description"
          content="Düğün, nikah ve özel davetiye etkinliklerinizde masalardaki karekodla misafirlerinizden anında yüksek çözünürlüklü fotoğraf toplayın. Uygulama indirmeden karekodla fotoğraf yüklemesi, canlı TV/projeksiyon yayını ve tek tıkla ZIP arşiv indirme."
        />
        <meta
          name="keywords"
          content="davetiye etkinlik, düğünde nikahta karekodla fotoğraf yüklemesi, düğün karekod fotoğraf, nikah karekod fotoğraf, karekodla fotoğraf toplama, masada qr kod fotoğraf, dijital davetiye etkinlik fotoğraf albümü, etkinlik karekod galeri, düğün masa kartı qr kod, kına gecesi karekod, canlı projeksiyon düğün slayt"
        />
        <meta property="og:title" content="QR-la | Masadaki Kodu QR'la, En Mutlu Anları Paylaş &amp; Kutla" />
        <meta
          property="og:description"
          content="Misafirlerinizin çektiği yüzlerce eşsiz fotoğraf WhatsApp gruplarında kaybolmasın. Tek bir QR kodla tüm fotoğrafları toplayın ve salondaki dev ekrana anında yansıtın!"
        />
        <meta property="og:url" content="https://qr-la.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://qr-la.com/assets/images/icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QR-la | Masadaki Kodu QR'la, En Mutlu Anları Paylaş &amp; Kutla" />
        <meta
          name="twitter:description"
          content="Düğün ve etkinliklerde uygulama indirmeden misafir fotoğraflarını toplayın ve canlı slaytta yayınlayın."
        />
        <link rel="canonical" href="https://qr-la.com" />
      </Head>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Navigation Bar */}
        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="qr-code" size={isMobile ? 18 : 20} color="#C5A059" />
            </View>
            <Text style={[styles.logoText, isMobile && styles.logoTextMobile]}>
              QR<Text style={{ color: '#C5A059' }}>-la</Text>
            </Text>
          </View>

          <View style={[styles.navActions, isMobile && styles.navActionsMobile]}>
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
                  <Text style={styles.navLinkText}>Giriş</Text>
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
                  style={[styles.demoHeaderBtn, isSmallPhone && styles.demoHeaderBtnCompact]}
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
              {isSmallPhone
                ? 'DÜĞÜN & NİKAHTA KAREKOD FOTOĞRAF'
                : 'DÜĞÜNDE & NİKAHTA KAREKODLA FOTOĞRAF YÜKLEMESİ • DAVETİYE ETKİNLİK ALBÜMÜ'}
            </Text>
          </View>

          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
            Düğün & Nikahta Masadaki Kodu <Text style={styles.highlightText}>QR'la</Text>,{'\n'}
            Tüm Anıları Tek Albümde Topla
          </Text>

          <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
            Düğün, nikah ve özel davetiye etkinliklerinizde misafirlerinizin çektiği yüzlerce eşsiz fotoğraf WhatsApp'ta kaybolmasın.
            Uygulama indirmeden, masadaki karekodla anında fotoğraf yüklemesi yapın ve salondaki dev ekranda canlı yansıtın!
          </Text>

          {/* Action CTAs */}
          <View style={[styles.ctaRow, isMobile && styles.ctaRowMobile]}>
            <TouchableOpacity
              style={[styles.primaryCta, isMobile && styles.ctaBtnMobile]}
              onPress={handleStartEvent}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={18} color="#FFF" />
              <Text style={styles.primaryCtaText}>Kendi Etkinliğini Başlat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryCta, isMobile && styles.ctaBtnMobile]}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="play-circle" size={18} color="#1A1817" />
              <Text style={styles.secondaryCtaText}>Canlı Demo Paneli Gör</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryCta, isMobile && styles.ctaBtnMobile]}
              onPress={() => router.push('/demo-panel/canli' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="tv-outline" size={18} color="#1A1817" />
              <Text style={styles.secondaryCtaText}>Projeksiyon Modu</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={[styles.trustBadgesRow, isMobile && styles.trustBadgesRowMobile]}>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={15} color="#10B981" />
              <Text style={styles.trustBadgeText}>Uygulama İndirmek Yok</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="flash" size={15} color="#EAB308" />
              <Text style={styles.trustBadgeText}>10x Akıllı Sıkıştırma</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="cloud-download" size={15} color="#3B82F6" />
              <Text style={styles.trustBadgeText}>Tek Tıkla ZIP İndir</Text>
            </View>
          </View>

          {/* Mockup Preview Card */}
          <View style={[styles.mockupContainer, isMobile && styles.mockupContainerMobile]}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.mockupImage}
              resizeMode="cover"
            />
            <View style={styles.mockupOverlay}>
              <View style={styles.mockupLiveTag}>
                <View style={styles.mockupDot} />
                <Text style={styles.mockupLiveText}>Salonda Canlı Yayında</Text>
              </View>
              <Text style={[styles.mockupCaption, isMobile && styles.mockupCaptionMobile]}>
                "Şule & Samet'in Boğaz manzaralı masalsı gecesinden 42 anı paylaşıldı!"
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>NASIL ÇALIŞIR?</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            3 Adımda Zahmetsiz Anı Koleksiyonu
          </Text>

          <View style={[styles.stepsGrid, isDesktop ? styles.stepsGridDesktop : styles.stepsGridMobile]}>
            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="print" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>QR Masa Kartını Bastır</Text>
              <Text style={styles.stepDesc}>
                Panelimizden çiftinize özel hazırlanan altın detaylı şık masa kartı şablonunu indirin ve masalara koyun.
              </Text>
            </View>

            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="camera" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Misafirler QR'lasın</Text>
              <Text style={styles.stepDesc}>
                Telefon kamerası tutulduğunda sayfa anında açılır. Otomatik sıkıştırma ile 10-20 fotoğraf saniyeler içinde yüklenir.
              </Text>
            </View>

            <View style={[styles.stepCard, !isDesktop && styles.stepCardMobile]}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="tv" size={26} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Dev Ekranda Canlı Görün</Text>
              <Text style={styles.stepDesc}>
                Projeksiyonda yeni yüklenen tüm kareler müzik eşliğinde dönsün. Gece bitiminde tüm arşivi tek tıkla ZIP olarak indirin.
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Packages Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>KOTA & TARİFELER</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            Her Etkinliğe Uygun Paketler
          </Text>
          <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile]}>
            Tüm paketlerde ücretsiz 500 MB ile başlayabilir, dilediğiniz zaman tek tıkla kotanızı yükseltebilirsiniz.
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
                    <Text style={styles.popularBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
                  </View>
                )}

                <Text style={styles.planName}>{tier.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>
                    {tier.priceTL === 0 ? 'ÜCRETSİZ' : `${tier.priceTL} ₺`}
                  </Text>
                  {tier.priceTL > 0 && <Text style={styles.planPeriod}>/ tek seferlik</Text>}
                </View>

                <View style={styles.planMeta}>
                  <Text style={styles.planQuotaText}>
                    📦 {tier.quotaMB >= 1024 ? `${tier.quotaMB / 1024} GB` : `${tier.quotaMB} MB`} Depolama
                  </Text>
                  <Text style={styles.planDaysText}>⏳ {tier.retentionDays} Gün Saklama</Text>
                </View>

                <View style={styles.featuresList}>
                  {tier.features.map((feat, i) => (
                    <View key={i} style={styles.featureItem}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                      <Text style={styles.featureItemText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.planBtn, tier.isPopular && styles.planBtnPopular]}
                  onPress={handleSelectPlan}
                >
                  <Text style={[styles.planBtnText, tier.isPopular && styles.planBtnTextPopular]}>
                    {tier.priceTL === 0 ? 'Hemen Başla' : 'Paketi Seç'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* SEO FAQ & Feature Highlights Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionOverline}>MERAK EDİLENLER</Text>
          <Text style={[styles.sectionHeading, isMobile && styles.sectionHeadingMobile]}>
            Düğün & Nikahta Karekodla Fotoğraf Yüklemesi SSS
          </Text>
          <Text style={[styles.sectionSub, isMobile && styles.sectionSubMobile]}>
            Davetiye etkinliklerinizde karekod albümünün sağladığı kolaylıklar ve sıkça sorulan sorular.
          </Text>

          <View style={styles.faqList}>
            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Düğünde ve nikahta karekodla fotoğraf yüklemesi nasıl yapılır?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Misafirler masalarındaki şık masa kartlarında bulunan karekodu cep telefonu kamerasıyla okutur.
                Herhangi bir mobil uygulama indirmeye ya da üye olmaya gerek kalmadan, doğrudan açılan web galerisine tek tıkla fotoğraf ve video yükleyebilirler.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Davetiye etkinliklerinde neden QR kodlu fotoğraf albümü tercih edilmeli?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                WhatsApp gibi mesajlaşma uygulamaları görselleri sıkıştırarak kalitelerini bozar ve fotoğrafları misafirlerden tek tek istemek haftalar sürer.
                QR-la ile tüm davetiye etkinliklerinizde (düğün, nikah, nişan, kına gecesi) çekilen anılar tek bir yüksek çözünürlüklü dijital arşivde toplanır.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Canlı projeksiyon slayt gösterisi nasıl çalışır?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Düğün veya nikah salonundaki akıllı televizyona ya da projeksiyon cihazına etkinlik canlı mod bağlantısını açmanız yeterlidir.
                Misafirler masalarından karekodla fotoğraf yükledikçe ekranda şık animasyonlar ve arka plan müziği eşliğinde otomatik olarak gösterilir.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <View style={styles.faqQuestionRow}>
                <Ionicons name="help-circle" size={20} color="#C5A059" />
                <Text style={styles.faqQuestion}>Gece bitiminde fotoğrafları nasıl indirebilirim?</Text>
              </View>
              <Text style={styles.faqAnswer}>
                Yönetim panelinizdeki "ZIP İndir" butonuna tıklayarak etkinlik boyunca yüklenen tüm yüksek çözünürlüklü fotoğraf ve videoları tek bir arşiv dosyası olarak bilgisayarınıza veya telefonunuza orijinal kalitesinde indirebilirsiniz.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>QR-la (qr-la.com)</Text>
          <Text style={styles.footerTagline}>
            "Masadaki Kodu QR'la, En Mutlu Anları Paylaş & Kutla"
          </Text>
          <Text style={styles.footerCopy}>© 2026 QR-la. Tüm Hakları Saklıdır.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  navbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    backgroundColor: '#FFF',
  },
  navbarMobile: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1817',
    letterSpacing: -0.5,
  },
  logoTextMobile: {
    fontSize: 19,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navActionsMobile: {
    gap: 8,
  },
  navLinkBtn: {
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  navRegisterBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navRegisterBtnCompact: {
    paddingHorizontal: 9,
  },
  navRegisterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E7A36',
  },
  navPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C5A059',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#C5A059',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  navPanelBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  demoHeaderBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  demoHeaderBtnCompact: {
    paddingHorizontal: 9,
  },
  demoHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
  },
  heroSectionMobile: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 36,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    marginBottom: 18,
    maxWidth: '96%',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  heroBadgeTextMobile: {
    fontSize: 10,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1817',
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -1,
    maxWidth: 720,
    marginBottom: 16,
  },
  heroTitleMobile: {
    fontSize: 27,
    lineHeight: 35,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  highlightText: {
    color: '#C5A059',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 620,
    marginBottom: 28,
  },
  heroSubtitleMobile: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: '96%',
    marginBottom: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
  },
  ctaRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    maxWidth: 360,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: '#C5A059',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  secondaryCtaText: {
    color: '#1A1817',
    fontSize: 14,
    fontWeight: '700',
  },
  ctaBtnMobile: {
    width: '100%',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 36,
    width: '100%',
  },
  trustBadgesRowMobile: {
    gap: 10,
    marginBottom: 28,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3EFE6',
  },
  trustBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  mockupContainer: {
    width: '100%',
    maxWidth: 800,
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#C5A059',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  mockupContainerMobile: {
    height: 220,
    borderRadius: 18,
  },
  mockupImage: {
    width: '100%',
    height: '100%',
  },
  mockupOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 16,
  },
  mockupLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mockupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  mockupLiveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  mockupCaption: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  mockupCaptionMobile: {
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 44,
    alignItems: 'center',
  },
  sectionMobile: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  sectionOverline: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C5A059',
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionHeadingMobile: {
    fontSize: 22,
    lineHeight: 28,
  },
  sectionSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 580,
    marginBottom: 32,
  },
  sectionSubMobile: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 24,
  },
  stepsGrid: {
    width: '100%',
    maxWidth: 1000,
    gap: 16,
  },
  stepsGridDesktop: {
    flexDirection: 'row',
  },
  stepsGridMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  stepCardMobile: {
    flex: undefined,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  stepIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  plansGrid: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
  },
  plansGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  plansGridMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  planCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    position: 'relative',
  },
  planCardMobile: {
    maxWidth: 360,
    alignSelf: 'center',
  },
  planCardPopular: {
    borderColor: '#C5A059',
    borderWidth: 2,
    shadowColor: '#C5A059',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#C5A059',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1817',
    marginTop: 6,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#C5A059',
  },
  planPeriod: {
    fontSize: 12,
    color: '#6B7280',
  },
  planMeta: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 4,
  },
  planQuotaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  planDaysText: {
    fontSize: 11,
    color: '#6B7280',
  },
  featuresList: {
    gap: 10,
    marginBottom: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureItemText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    lineHeight: 16,
  },
  planBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  planBtnPopular: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  planBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  planBtnTextPopular: {
    color: '#FFF',
  },
  footer: {
    width: '100%',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3EFE6',
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerTagline: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
    maxWidth: 400,
  },
  footerCopy: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  faqList: {
    width: '100%',
    maxWidth: 860,
    gap: 16,
    marginTop: 8,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
});
