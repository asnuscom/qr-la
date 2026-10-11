import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { useTheme, ThemeColors } from '@/context/ThemeContext';

export default function BusinessCardLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const { isDark, colors } = useTheme();

  const ACCENT = '#8B5CF6';
  const styles = getStyles(isDark, colors, ACCENT);

  return (
    <View style={styles.container}>
      <Head>
        <title>Yeni Nesil Dijital Kartvizit & NFC Akıllı Kart | vCard 3.0 | QR-la</title>
        <meta
          name="description"
          content="Kağıt kartvizitler çöpe gider, QR-la rehbere tek tıkla eklenir. NFC akıllı kartvizit ve QR kod ile profilinizi saniyeler içinde paylaşın. vCard 3.0 rehbere kaydetme, IBAN panosu, portfolyo ve 12+ lüks kurumsal tema."
        />
        <meta
          name="keywords"
          content="dijital kartvizit, nfc kartvizit, akıllı kartvizit, vcard qr kod, e-kartvizit, kurumsal dijital kimlik, temassız kartvizit"
        />
        <meta property="og:title" content="Yeni Nesil Dijital Kartvizit & NFC Akıllı Kart | QR-la" />
        <meta
          property="og:description"
          content="Toplantılarda telefonunuzu dokundurun, tüm iletişim bilgileriniz karşı tarafın rehberine anında kaydolsun."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
        />
        <link rel="canonical" href="https://qr-la.com/kartvizit" />
      </Head>

      <MarketingNav activeModule="kartvizit" accentColor={ACCENT} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <Ionicons name="card" size={14} color={ACCENT} />
              <Text style={styles.heroBadgeText}>DİJİTAL KARTVİZİT & NFC EKOSİSTEMİ</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Kağıt Kartvizitler Çöpe Gider,{'\n'}
              <Text style={styles.heroTitleAccent}>QR-la Rehbere Tek Tıkla Eklenir</Text>
            </Text>

            <Text style={styles.heroSub}>
              Toplantılarda, fuarlarda veya tanışmalarda telefonunuzu dokundurun ya da QR kodunuzu gösterin.
              İletişim bilgileriniz, şirket unvanınız, sosyal medya hesaplarınız ve IBAN'larınız karşı tarafın rehberine tek dokunuşla kaydolsun.
            </Text>

            {/* CTA Butonları */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => router.push('/panel/kartvizit' as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.primaryCtaText}>Dijital Kartvizitinizi Oluşturun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => router.push('/samet-sunman' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={18} color={isDark ? '#F8FAFC' : colors.text} />
                <Text style={styles.secondaryCtaText}>Örnek Kartviziti Canlı Gör</Text>
              </TouchableOpacity>
            </View>

            {/* İstatistik Rozetleri */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>60.000+</Text>
                <Text style={styles.statLabel}>Profesyonel Kullanıcı</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.2 Milyon+</Text>
                <Text style={styles.statLabel}>Rehbere Kaydetme</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%100</Text>
                <Text style={styles.statLabel}>Sıfır Kağıt İsrafı</Text>
              </View>
            </View>

            {/* Hero Mockup Görseli */}
            <View style={styles.mockupContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.mockupImage}
                resizeMode="cover"
              />
              <View style={styles.mockupFloatingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.mockupFloatingText}>Samet Sunman • Kıdemli Mimar • vCard 3.0 Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ÖNCESİ VS SONRASI KARŞILAŞTIRMA */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>NEDEN QR-LA DİJİTAL KARTVİZİT?</Text>
          <Text style={styles.sectionHeading}>Klasik Kağıt Kartvizit vs. Akıllı NFC Profil</Text>

          <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
            {/* Eski Yöntem */}
            <View style={styles.compareCardBad}>
              <View style={styles.compareHeader}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.compareTitleBad}>Geleneksel Kağıt Kartvizit</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextBad}>❌ Dağıtılan kartların %88'i ilk hafta içinde çöpe atılır</Text>
                <Text style={styles.compareTextBad}>❌ Telefon veya unvan değiştiğinde tüm kutular çöp olur</Text>
                <Text style={styles.compareTextBad}>❌ Karşı taraf bilgileri rehberine elle tek tek yazmakla uğraşmaz</Text>
                <Text style={styles.compareTextBad}>❌ Portfolyo, video tanıtım veya IBAN eklemek imkansızdır</Text>
                <Text style={styles.compareTextBad}>❌ Her yıl binlerce liralık tekrarlayan matbaa maliyeti yaratır</Text>
              </View>
            </View>

            {/* QR-la Yöntemi */}
            <View style={styles.compareCardGood}>
              <View style={styles.compareHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.compareTitleGood}>QR-la Akıllı NFC Kartvizit</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextGood}>✨ Karşı taraf tek tıkla vCard 3.0 dosyasını rehberine kaydeder</Text>
                <Text style={styles.compareTextGood}>✨ NFC ile telefonun arkasına dokundurulduğunda anında açılır</Text>
                <Text style={styles.compareTextGood}>✨ IBAN kopyalama panosu ile para transferleri hatasız yapılır</Text>
                <Text style={styles.compareTextGood}>✨ Sosyal medya, web sitesi, katalog ve portfolyo linkleri tek ekranda</Text>
                <Text style={styles.compareTextGood}>✨ Bilgilerinizi panelden dilediğiniz zaman sınırsız güncelleyebilirsiniz</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEMEL ÖZELLİKLER IZGARASI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>TEKNOLOJİ & KURUMSAL GÜÇ</Text>
          <Text style={styles.sectionHeading}>Profesyonel İmajınızı Zirveye Taşıyın</Text>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {[
              {
                icon: 'person-add-outline' as const,
                title: 'vCard 3.0 Tek Tıkla Rehbere Ekleme',
                desc: 'Tüm iPhone ve Android telefonlarla %100 uyumlu standart format. İsim, unvan, şirket, e-posta, telefon ve adres tek dokunuşla rehbere akar.',
              },
              {
                icon: 'radio-outline' as const,
                title: 'Temassız NFC Akıllı Kart',
                desc: 'Telefonun arkasına hafifçe dokundurun. Hiçbir uygulama gerekmeden tarayıcıda zengin profil sayfanız anında belirsin.',
              },
              {
                icon: 'wallet-outline' as const,
                title: 'IBAN & Banka Hesap Panosu',
                desc: 'Müşterilerinizin uzun IBAN numaralarını yanlış yazmasına son. Tek tıkla banka adı, alıcı ismi ve IBAN panoya kopyalanır.',
              },
              {
                icon: 'briefcase-outline' as const,
                title: 'Portfolyo & PDF Broşür Bağlantıları',
                desc: 'Geçmiş projelerinizi, şirket kataloglarınızı veya sunum dosyalarınızı profilinize ekleyerek müşterilerinize prestijli bir deneyim sunun.',
              },
              {
                icon: 'color-palette-outline' as const,
                title: '12+ Lüks Tasarım Teması',
                desc: 'Executive Dark, Midnight Gold, Cyberpunk, Rose Gold, Titanium ve Kurumsal Lacivert modlarıyla markanızı en şık şekilde yansıtın.',
              },
              {
                icon: 'leaf-outline' as const,
                title: 'Çevre Dostu Sıfır Kağıt',
                desc: 'Ağaçların kesilmesini önleyin, karbon ayak izinizi sıfırlayın ve sürdürülebilir bir kurumsal kimliğe kavuşun.',
              },
            ].map((feat, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconBadge}>
                  <Ionicons name={feat.icon} size={22} color={ACCENT} />
                </View>
                <Text style={styles.featureCardTitle}>{feat.title}</Text>
                <Text style={styles.featureCardDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FİZİKSEL MATBAA & NFC KART */}
        <View style={styles.phygitalSection}>
          <View style={styles.phygitalCard}>
            <View style={styles.phygitalTextCol}>
              <View style={styles.phygitalBadge}>
                <Ionicons name="card" size={14} color="#8B5CF6" />
                <Text style={styles.phygitalBadgeText}>FİZİKSEL ÜRÜN & NFC TEKNOLOJİSİ</Text>
              </View>
              <Text style={styles.phygitalTitle}>Kişiye Özel Mat Siyah NFC Akıllı Kartvizit</Text>
              <Text style={styles.phygitalDesc}>
                Lüks mat siyah dokusu, adınıza özel UV kabartma baskısı ve içinde gömülü NTAG216 çipiyle
                toplantıların en prestijli aksesuarı kapınıza kadar teslim edilsin.
              </Text>
              <TouchableOpacity
                style={styles.phygitalBtn}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.phygitalBtnText}>NFC Kart Modellerini İncele</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.phygitalImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FİYATLANDIRMA ÖZETİ */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>ŞEFFAF PAKETLER</Text>
          <Text style={styles.sectionHeading}>İşiniz İçin En Uygun Kartı Seçin</Text>

          <View style={[styles.pricingRow, isMobile && styles.pricingRowMobile]}>
            {/* Standart Dijital Paket */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Dijital Kartvizit</Text>
              <Text style={styles.priceVal}>249 ₺</Text>
              <Text style={styles.pricePeriod}>Ömür Boyu Tek Seferlik</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📲 vCard 3.0 Tek Tıkla Rehbere Ekle</Text>
                <Text style={styles.priceFeatureItem}>🏦 IBAN Panosu & Sosyal Linkler</Text>
                <Text style={styles.priceFeatureItem}>🎨 12+ Lüks Tema Seçeneği</Text>
                <Text style={styles.priceFeatureItem}>🔄 Sınırsız Bilgi Güncelleme</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push({ pathname: '/panel/tarifeler', params: { tab: 'vcard' } } as any)}
              >
                <Text style={styles.priceBtnText}>Dijital Başla</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Paket (Öne Çıkan) */}
            <View style={[styles.priceCard, styles.priceCardFeatured]}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
              </View>
              <Text style={styles.pricePlanName}>Mat Siyah Akıllı NFC Kart</Text>
              <Text style={[styles.priceVal, { color: ACCENT }]}>499 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>💳 İsminize Özel Mat Siyah NFC Kart</Text>
                <Text style={styles.priceFeatureItem}>⚡ Temassız Dokundurma (NTAG216 Çip)</Text>
                <Text style={styles.priceFeatureItem}>📲 vCard 3.0 & IBAN Panosu Dahil</Text>
                <Text style={styles.priceFeatureItem}>📁 Portfolyo & PDF Broşür Modülü</Text>
                <Text style={styles.priceFeatureItem}>🛡️ Ömür Boyu Dijital Profil Garantisi</Text>
              </View>
              <TouchableOpacity
                style={[styles.priceBtn, styles.priceBtnFeatured]}
                onPress={() => router.push({ pathname: '/panel/tarifeler', params: { tab: 'vcard' } } as any)}
              >
                <Text style={[styles.priceBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                  NFC Kart Satın Al
                </Text>
              </TouchableOpacity>
            </View>

            {/* Metal Lüks VIP Paketi */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Lüks Paslanmaz Çelik Metal NFC</Text>
              <Text style={styles.priceVal}>990 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>💎 Gerçek Paslanmaz Çelik Metal Gövde</Text>
                <Text style={styles.priceFeatureItem}>⚡ Lazer Kazımalı Kişiye Özel Tasarım</Text>
                <Text style={styles.priceFeatureItem}>💼 Lüks Sunum Kutusu ile Teslimat</Text>
                <Text style={styles.priceFeatureItem}>👑 VIP Öncelikli Tasarım Desteği</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push({ pathname: '/panel/tarifeler', params: { tab: 'vcard' } } as any)}
              >
                <Text style={styles.priceBtnText}>Metal Kartı Seç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SIKÇA SORULAN SORULAR */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>MERAK EDİLENLER</Text>
          <Text style={styles.sectionHeading}>Sıkça Sorulan Sorular</Text>

          <View style={styles.faqList}>
            {[
              {
                q: 'NFC kart tüm telefonlarda çalışır mı?',
                a: 'Evet! Son 6-7 yılda üretilen hemen hemen tüm iPhone (iPhone XS ve üzeri doğrudan kilit ekranından okur) ve Android telefonlarda NFC aktarımı saniyeler içinde çalışır. NFC olmayan telefonlar için kartın arkasında HD QR kod da bulunur.',
              },
              {
                q: 'Karşı tarafın herhangi bir uygulama indirmesi gerekir mi?',
                a: 'Hayır! Telefonu karta dokundurduklarında telefonlarının tarayıcısında profiliniz anında açılır ve tek dokunuşla rehberlerine kaydedebilirler.',
              },
              {
                q: 'Şirketim veya numaram değiştiğinde yeni kart almam gerekir mi?',
                a: 'Asla! Kartınızın üzerindeki çip dinamiktir. QR-la panelinize girip yeni numaranızı, unvanınızı veya şirket logonuzu güncellediğinizde kartınız otomatik olarak yeni bilgileri sunar.',
              },
              {
                q: 'Şirketimdeki tüm çalışanlar için toplu sipariş verebilir miyim?',
                a: 'Evet, kurumsal paketlerimizde şirketinizin logosu ve kurumsal şablonuyla tüm ekibiniz için toplu NFC kart üretimi ve merkezi yönetim paneli sağlıyoruz.',
              },
            ].map((faq, i) => (
              <View key={i} style={styles.faqItem}>
                <View style={styles.faqQRow}>
                  <Ionicons name="help-circle" size={20} color={ACCENT} />
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* DÖNÜŞÜM ÇAĞRISI BANNERI */}
        <View style={styles.ctaBannerSection}>
          <View style={styles.ctaBanner}>
            <Text style={styles.ctaBannerTitle}>İletişiminizi Bir Sonraki Seviyeye Taşıyın</Text>
            <Text style={styles.ctaBannerSub}>
              2 dakikada dijital kartvizitinizi tasarlayın, vCard profilinizi oluşturun ve kağıt israfına son verin.
            </Text>
            <TouchableOpacity
              style={styles.ctaBannerBtn}
              onPress={() => router.push('/panel/kartvizit' as any)}
              activeOpacity={0.88}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBannerBtnText}>Ücretsiz Dijital Kartınızı Oluşturun</Text>
            </TouchableOpacity>
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </View>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors, accent: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      paddingBottom: 0,
    },
    heroSection: {
      paddingVertical: 50,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    },
    heroInner: {
      maxWidth: 1100,
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
      textAlign: 'center' as any,
      gap: 20,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      borderWidth: 1,
      borderColor: accent,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    heroBadgeText: {
      color: accent,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    heroTitle: {
      color: colors.text,
      fontSize: 44,
      fontWeight: '800',
      textAlign: 'center',
      lineHeight: 52,
      letterSpacing: -0.5,
    },
    heroTitleMobile: {
      fontSize: 30,
      lineHeight: 38,
    },
    heroTitleAccent: {
      color: accent,
    },
    heroSub: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      maxWidth: 780,
    },
    heroCtaRow: {
      flexDirection: 'row',
      gap: 14,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 10,
    },
    primaryCtaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: accent,
      paddingHorizontal: 24,
      paddingVertical: 15,
      borderRadius: 14,
      shadowColor: accent,
      shadowOpacity: 0.25,
      shadowRadius: 15,
    },
    primaryCtaText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryCtaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? '#1E293B' : '#FAF7F2',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 14,
    },
    secondaryCtaText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
      backgroundColor: isDark ? '#131D31' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 28,
      paddingVertical: 16,
      borderRadius: 20,
      marginTop: 16,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      color: accent,
      fontSize: 22,
      fontWeight: '800',
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
    },
    mockupContainer: {
      width: '100%',
      maxWidth: 960,
      height: 380,
      borderRadius: 24,
      overflow: 'hidden',
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 20,
    },
    mockupImage: {
      width: '100%',
      height: '100%',
    },
    mockupFloatingBadge: {
      position: 'absolute',
      top: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
      borderWidth: 1,
      borderColor: 'rgba(139, 92, 246, 0.4)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: accent,
    },
    mockupFloatingText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    sectionWrap: {
      paddingVertical: 60,
      paddingHorizontal: 20,
      maxWidth: 1100,
      width: '100%',
      alignSelf: 'center',
      gap: 16,
    },
    sectionOverline: {
      color: accent,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 2,
      textAlign: 'center',
    },
    sectionHeading: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 20,
    },
    compareGrid: {
      flexDirection: 'row',
      gap: 20,
    },
    compareGridMobile: {
      flexDirection: 'column',
    },
    compareCardBad: {
      flex: 1,
      backgroundColor: isDark ? '#13131A' : '#FFF5F5',
      borderWidth: 1,
      borderColor: isDark ? '#2D1B1B' : '#FED7D7',
      borderRadius: 20,
      padding: 24,
      gap: 16,
    },
    compareCardGood: {
      flex: 1,
      backgroundColor: isDark ? '#0F1A1B' : '#F5F3FF',
      borderWidth: 1,
      borderColor: isDark ? '#4C1D95' : '#DDD6FE',
      borderRadius: 20,
      padding: 24,
      gap: 16,
    },
    compareHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    compareTitleBad: {
      color: isDark ? '#FCA5A5' : '#DC2626',
      fontSize: 18,
      fontWeight: '700',
    },
    compareTitleGood: {
      color: isDark ? '#DDD6FE' : '#6D28D9',
      fontSize: 18,
      fontWeight: '700',
    },
    compareList: {
      gap: 12,
    },
    compareTextBad: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    compareTextGood: {
      color: isDark ? '#E2E8F0' : '#334155',
      fontSize: 13,
      lineHeight: 19,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 18,
    },
    featuresGridDesktop: {
      gap: 24,
    },
    featureCard: {
      flex: 1,
      minWidth: 300,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      gap: 12,
    },
    featureIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureCardTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    featureCardDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
    },
    phygitalSection: {
      paddingHorizontal: 20,
      paddingVertical: 30,
      maxWidth: 1100,
      width: '100%',
      alignSelf: 'center',
    },
    phygitalCard: {
      backgroundColor: isDark ? '#131D31' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    phygitalTextCol: {
      flex: 1,
      minWidth: 320,
      padding: 36,
      gap: 16,
      justifyContent: 'center',
    },
    phygitalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    phygitalBadgeText: {
      color: accent,
      fontSize: 11,
      fontWeight: '700',
    },
    phygitalTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
    },
    phygitalDesc: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    },
    phygitalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: accent,
      paddingHorizontal: 20,
      paddingVertical: 13,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    phygitalBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    phygitalImage: {
      flex: 1,
      minWidth: 320,
      height: 320,
    },
    pricingRow: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    pricingRowMobile: {
      flexDirection: 'column',
    },
    priceCard: {
      flex: 1,
      minWidth: 280,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      gap: 14,
      justifyContent: 'space-between',
    },
    priceCardFeatured: {
      borderColor: accent,
      backgroundColor: isDark ? '#131D31' : '#F5F3FF',
      shadowColor: accent,
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    featuredBadge: {
      backgroundColor: accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    featuredBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    pricePlanName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    priceVal: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '800',
    },
    pricePeriod: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: -8,
    },
    priceFeatures: {
      gap: 10,
      marginVertical: 10,
    },
    priceFeatureItem: {
      color: isDark ? '#CBD5E1' : '#4B5563',
      fontSize: 13,
    },
    priceBtn: {
      backgroundColor: isDark ? '#1E293B' : '#FAF7F2',
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.border,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
    },
    priceBtnFeatured: {
      backgroundColor: accent,
      borderWidth: 0,
    },
    priceBtnText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    faqList: {
      gap: 14,
    },
    faqItem: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 20,
      gap: 10,
    },
    faqQRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    faqQuestion: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    faqAnswer: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      paddingLeft: 30,
    },
    ctaBannerSection: {
      paddingHorizontal: 20,
      paddingVertical: 40,
      maxWidth: 1100,
      width: '100%',
      alignSelf: 'center',
    },
    ctaBanner: {
      backgroundColor: isDark ? '#131D31' : '#F5F3FF',
      borderWidth: 1,
      borderColor: accent,
      borderRadius: 24,
      padding: 40,
      alignItems: 'center',
      textAlign: 'center' as any,
      gap: 14,
    },
    ctaBannerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
    },
    ctaBannerSub: {
      color: colors.textSecondary,
      fontSize: 14,
      maxWidth: 600,
      textAlign: 'center',
      lineHeight: 21,
    },
    ctaBannerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: accent,
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: 14,
      marginTop: 6,
    },
    ctaBannerBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
