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

export default function RestaurantMenuLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const { isDark, colors } = useTheme();

  const ACCENT = '#EA580C';
  const styles = getStyles(isDark, colors, ACCENT);

  return (
    <View style={styles.container}>
      <Head>
        <title>Restoran & Kafe Akıllı QR Menü & Masadan Garson Çağırma | QR-la</title>
        <meta
          name="description"
          content="Baskı maliyetine son! QR-la Akıllı Restoran QR Menü ile fiyatları anında güncelleyin. Masadan tek tıkla Garson & Hesap çağırma, tek tıkla Wi-Fi bağlanma, alerjen filtreleri ve lüks ahşap pleksi masa standları."
        />
        <meta
          name="keywords"
          content="restoran qr menü, kafe karekod menü, temassız dijital menü, masadan garson çağırma qr, masa qr kodu, hesap isteme qr, restoran menü yazılımı"
        />
        <meta property="og:title" content="Restoran & Kafe Akıllı QR Menü & Masadan Garson Çağırma | QR-la" />
        <meta
          property="og:description"
          content="Enflasyonda sürekli menü basma derdine son. Masadan tek tıkla garson çağırma ve Wi-Fi şifresi konforu."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
        />
        <link rel="canonical" href="https://qr-la.com/menu" />
      </Head>

      <MarketingNav activeModule="menu" accentColor={ACCENT} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <Ionicons name="restaurant" size={14} color={ACCENT} />
              <Text style={styles.heroBadgeText}>RESTORAN & KAFE MENÜ EKOSİSTEMİ</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Baskı Maliyetine Son,{'\n'}
              <Text style={styles.heroTitleAccent}>Akıllı QR Menü ile Masaları Canlandır</Text>
            </Text>

            <Text style={styles.heroSub}>
              Sürekli artan maliyetlerde kağıt menü bastırma devri geride kaldı.
              Cep telefonunuzdan saniyeler içinde fiyat güncelleyin, tükenen ürünleri gizleyin;
              misafirleriniz masadan tek tıkla 'Garson Çağır', 'Hesap İste' ve 'Wi-Fi’a Bağlan' konforunu yaşasın.
            </Text>

            {/* CTA Butonları */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => router.push('/panel/menu' as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.primaryCtaText}>Restoran Menünüzü Oluşturun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => router.push('/lucca-bistrot' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={18} color={isDark ? '#F8FAFC' : colors.text} />
                <Text style={styles.secondaryCtaText}>Örnek Menüyü Canlı Gör</Text>
              </TouchableOpacity>
            </View>

            {/* İstatistik Rozetleri */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>18.000+</Text>
                <Text style={styles.statLabel}>Masa Kurulumu</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>900+</Text>
                <Text style={styles.statLabel}>Restoran & Kafe</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%35</Text>
                <Text style={styles.statLabel}>Servis Hızı Artışı</Text>
              </View>
            </View>

            {/* Hero Mockup Görseli */}
            <View style={styles.mockupContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.mockupImage}
                resizeMode="cover"
              />
              <View style={styles.mockupFloatingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.mockupFloatingText}>Lucca Bistrot • Masadan Garson & Hesap Çağırma Açık</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ÖNCESİ VS SONRASI KARŞILAŞTIRMA */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>NEDEN QR-LA AKILLI MENÜ?</Text>
          <Text style={styles.sectionHeading}>Klasik Kağıt Menü vs. QR-la Deneyimi</Text>

          <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
            {/* Eski Yöntem */}
            <View style={styles.compareCardBad}>
              <View style={styles.compareHeader}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.compareTitleBad}>Geleneksel Kağıt Menü</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextBad}>❌ Her fiyat artışında binlerce liralık tekrarlayan baskı maliyeti</Text>
                <Text style={styles.compareTextBad}>❌ Masalarda yağlanan, kirlenen ve yıpranan hoş olmayan sayfalar</Text>
                <Text style={styles.compareTextBad}>❌ Biten ürünler misafire sipariş anında söylenir ve hayal kırıklığı yaratır</Text>
                <Text style={styles.compareTextBad}>❌ Müşteriler garsonu çağırmak için dakikalarca el sallamak zorunda kalır</Text>
                <Text style={styles.compareTextBad}>❌ Sürekli 'Wi-Fi şifreniz neydi?' soruları personeli meşgul eder</Text>
              </View>
            </View>

            {/* QR-la Yöntemi */}
            <View style={styles.compareCardGood}>
              <View style={styles.compareHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.compareTitleGood}>QR-la Akıllı Restoran Menüsü</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextGood}>✨ Cep telefonunuzdan fiyatları tek dokunuşla anında güncelleyin</Text>
                <Text style={styles.compareTextGood}>✨ Kalmayan ürünleri tek tuşla 'Tükendi' yapın, masada mahcup olmayın</Text>
                <Text style={styles.compareTextGood}>✨ Müşteri masadan tek tıkla Garson ve Hesap çağrısı yollar</Text>
                <Text style={styles.compareTextGood}>✨ 'Wi-Fi’a Bağlan' butonu ile misafir şifre yazmadan otomatik bağlanır</Text>
                <Text style={styles.compareTextGood}>✨ Yüksek kaliteli iştah açıcı fotoğraflar ve alerjen filtreleri</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEMEL ÖZELLİKLER IZGARASI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>TEKNOLOJİ & İŞLETME VERİMİ</Text>
          <Text style={styles.sectionHeading}>Restoranınızı Akıllı İşletmeye Dönüştürün</Text>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {[
              {
                icon: 'flash-outline' as const,
                title: 'Canlı Fiyat & Ürün Güncelleme',
                desc: 'Tedarik maliyetiniz değiştiğinde menüyü saniyeler içinde güncelleyin. Sıfır matbaa masrafı, sıfır bekleme süresi.',
              },
              {
                icon: 'notifications-outline' as const,
                title: 'Masadan Garson & Hesap Çağırma',
                desc: 'Müşteri ekrandaki butona dokunur; panelinize veya garson telefonuna "Masa 14 Hesap İstiyor" bildirimi anında düşer.',
              },
              {
                icon: 'wifi-outline' as const,
                title: 'Tek Tıkla Otomatik Wi-Fi',
                desc: 'Personelinizin sürekli şifre kodlamasına gerek kalmaz. Misafir butona dokunduğu an Wi-Fi ağına otomatik katılır.',
              },
              {
                icon: 'nutrition-outline' as const,
                title: 'Alerjen & Kalori Bilgileri',
                desc: 'Gluten, süt/laktoz, kabuklu deniz ürünleri, fıstık alerjisi olan misafirleriniz için güvenli ve yasalara uygun filtreler.',
              },
              {
                icon: 'star-outline' as const,
                title: 'Şefin Önerisi & Popüler Rozetleri',
                desc: 'En çok satan veya en karlı imza yemeklerinizi öne çıkararak ortalama masa sepet tutarını %25 artırın.',
              },
              {
                icon: 'globe-outline' as const,
                title: 'Çoklu Dil Desteği (Turist Dostu)',
                desc: 'Yabancı misafirler için Türkçe ve İngilizce dilleri arasında tek tıkla geçiş imkanı.',
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

        {/* FİZİKSEL MATBAA & MASA STANDLARI */}
        <View style={styles.phygitalSection}>
          <View style={styles.phygitalCard}>
            <View style={styles.phygitalTextCol}>
              <View style={styles.phygitalBadge}>
                <Ionicons name="cube" size={14} color="#EA580C" />
                <Text style={styles.phygitalBadgeText}>FİZİKSEL BASKI & MATBAA</Text>
              </View>
              <Text style={styles.phygitalTitle}>Ahşap Kaideli Pleksi Masa Standları</Text>
              <Text style={styles.phygitalDesc}>
                Restoranınızın masaları için fırınlanmış masif ahşap kaideli, çizilmeye dayanıklı şeffaf pleksi masa standları
                ve yıkanabilir vinil masa numarası etiketleri adresinize gelsin.
              </Text>
              <TouchableOpacity
                style={styles.phygitalBtn}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.phygitalBtnText}>Masa Standı Modellerini İncele</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.phygitalImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FİYATLANDIRMA ÖZETİ */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>ŞEFFAF PAKETLER</Text>
          <Text style={styles.sectionHeading}>İşletmeniz İçin En Uygun Menüyü Seçin</Text>

          <View style={[styles.pricingRow, isMobile && styles.pricingRowMobile]}>
            {/* Kafe Başlangıç */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Kafe & Butik İşletme</Text>
              <Text style={styles.priceVal}>490 ₺</Text>
              <Text style={styles.pricePeriod}>Yıllık Lisans</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📋 10 Masaya Kadar Destek</Text>
                <Text style={styles.priceFeatureItem}>🍕 Sınırsız Kategori ve Ürün Ekleme</Text>
                <Text style={styles.priceFeatureItem}>📶 Otomatik Wi-Fi Bağlanma Butonu</Text>
                <Text style={styles.priceFeatureItem}>🖨️ PDF Masa Kartı Çıktısı</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>Paketi Seç</Text>
              </TouchableOpacity>
            </View>

            {/* Restoran Popüler (Öne Çıkan) */}
            <View style={[styles.priceCard, styles.priceCardFeatured]}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
              </View>
              <Text style={styles.pricePlanName}>Profesyonel Restoran</Text>
              <Text style={[styles.priceVal, { color: ACCENT }]}>990 ₺</Text>
              <Text style={styles.pricePeriod}>Yıllık Lisans + Stand Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>🛎️ Masadan Garson & Hesap Çağırma</Text>
                <Text style={styles.priceFeatureItem}>📋 50 Masaya Kadar Destek</Text>
                <Text style={styles.priceFeatureItem}>🪵 10 Adet Ahşap Pleksi Stand Hediye</Text>
                <Text style={styles.priceFeatureItem}>🥜 Detaylı Alerjen & Kalori Filtreleri</Text>
                <Text style={styles.priceFeatureItem}>⚡ Sınırsız Canlı Fiyat Güncelleme</Text>
              </View>
              <TouchableOpacity
                style={[styles.priceBtn, styles.priceBtnFeatured]}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={[styles.priceBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                  Restoran Paketini Satın Al
                </Text>
              </TouchableOpacity>
            </View>

            {/* Zincir VIP */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Zincir & Şube VIP</Text>
              <Text style={styles.priceVal}>1.990 ₺</Text>
              <Text style={styles.pricePeriod}>Yıllık Lisans</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>👑 Sınırsız Masa & Çoklu Şube Yönetimi</Text>
                <Text style={styles.priceFeatureItem}>🌐 Türkçe & İngilizce Çift Dil Menü</Text>
                <Text style={styles.priceFeatureItem}>🪵 25 Adet Ahşap Pleksi Masa Standı</Text>
                <Text style={styles.priceFeatureItem}>📞 VIP 7/24 Öncelikli Teknik Destek</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>Zincir Paketi Seç</Text>
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
                q: 'Fiyatları cep telefonumdan anında değiştirebilir miyim?',
                a: 'Evet! QR-la yönetim panelinize telefonunuzdan girerek ürünün fiyatını veya durumunu saniyeler içinde değiştirebilirsiniz. Masalardaki menüler sayfayı yeniledikleri anda yeni fiyatları görür.',
              },
              {
                q: 'Müşterinin herhangi bir uygulama indirmesi gerekir mi?',
                a: 'Kesinlikle hayır! Masadaki QR koda telefon kamerasını tuttukları anda tarayıcıda uygulama hızında ultra hızlı menü açılır.',
              },
              {
                q: 'Garson çağırma bildirimlerini nasıl alıyoruz?',
                a: 'İster kasanın yanındaki ekrandan sesli bildirimle, ister garsonların kullandığı tablet veya telefon ekranından hangi masanın garson veya hesap çağırdığını anında takip edebilirsiniz.',
              },
              {
                q: 'Masa standları kırılmaya veya dökülmelere karşı dayanıklı mı?',
                a: 'Evet! Ahşap kaideli pleksi standlarımız ve vinil numaralarımız restorandaki çay, kahve veya su dökülmelerine karşı tamamen yıkanabilir ve silinebilir materyalden üretilmektedir.',
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
            <Text style={styles.ctaBannerTitle}>Menülerinizi Dijitale Taşıyın, Maliyetinizi Sıfırlayın</Text>
            <Text style={styles.ctaBannerSub}>
              2 dakikada restoran menünüzü oluşturun, kategorilerinizi ekleyin ve masalarınızı akıllı hale getirin.
            </Text>
            <TouchableOpacity
              style={styles.ctaBannerBtn}
              onPress={() => router.push('/panel/menu' as any)}
              activeOpacity={0.88}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBannerBtnText}>Ücretsiz Menünüzü Oluşturun</Text>
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
      backgroundColor: isDark ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.1)',
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
      borderColor: 'rgba(251, 146, 60, 0.4)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
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
      backgroundColor: isDark ? '#0F1A1B' : '#FFF7ED',
      borderWidth: 1,
      borderColor: isDark ? '#7C2D12' : '#FDBA74',
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
      color: isDark ? '#FED7AA' : '#C2410C',
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
      backgroundColor: isDark ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.1)',
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
      backgroundColor: isDark ? 'rgba(234, 88, 12, 0.15)' : 'rgba(234, 88, 12, 0.1)',
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
      backgroundColor: isDark ? '#131D31' : '#FFF7ED',
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
      backgroundColor: isDark ? '#131D31' : '#FFF7ED',
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
