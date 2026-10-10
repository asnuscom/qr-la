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

export default function WeddingLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const { isDark, colors } = useTheme();

  const styles = getStyles(isDark, colors);

  return (
    <View style={styles.container}>
      <Head>
        <title>Düğün & Etkinlik Canlı Fotoğraf Toplama QR Kodu | QR-la</title>
        <meta
          name="description"
          content="Düğün, nişan ve kına gecelerinde masalardaki QR kodu okutan misafirlerin çektiği fotoğrafları dev ekranda canlı yayınlayın. Tek tıkla orijinal kalitede ZIP olarak indirin."
        />
        <meta
          name="keywords"
          content="düğün qr kod, düğün fotoğraf toplama, canlı projeksiyon düğün, masa qr kodu, dijital anı defteri, nikah karekod"
        />
        <meta property="og:title" content="Düğün & Etkinlik Canlı Fotoğraf Toplama QR Kodu | QR-la" />
        <meta
          property="og:description"
          content="Uygulama indirmeden masadaki karekodla yüzlerce misafir fotoğrafı anında dev ekranda toplansın!"
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
        />
        <link rel="canonical" href="https://qr-la.com/dugun" />
      </Head>

      <MarketingNav activeModule="dugun" accentColor="#D4AF37" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <Ionicons name="heart" size={14} color="#D4AF37" />
              <Text style={styles.heroBadgeText}>DÜĞÜN & ETKİNLİK EKOSİSTEMİ</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Masalardaki Kodu QR’la,{'\n'}
              <Text style={styles.heroTitleGold}>Anıları Salonda Canlı Topla</Text>
            </Text>

            <Text style={styles.heroSub}>
              Uygulama indirtmeden, hiçbir üyelik istemeden; misafirlerinizin çektiği en samimi kareler
              WhatsApp gruplarında kaybolmasın. Salondaki projeksiyonda dev ekrana yansısın, gece sonunda tek tıkla orijinal kalitede ZIP olarak arşivleyin.
            </Text>

            {/* CTA Butonları */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => router.push('/panel' as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="sparkles" size={18} color="#0F172A" />
                <Text style={styles.primaryCtaText}>Düğün QR’ınızı Ücretsiz Oluşturun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => router.push('/samet-ve-sule' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={18} color={isDark ? '#F8FAFC' : '#1A1817'} />
                <Text style={styles.secondaryCtaText}>Örnek Düğünü Canlı Gör</Text>
              </TouchableOpacity>
            </View>

            {/* İstatistik Rozetleri */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>350.000+</Text>
                <Text style={styles.statLabel}>Toplanan Fotoğraf</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.200+</Text>
                <Text style={styles.statLabel}>Mutlu Çift</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%100</Text>
                <Text style={styles.statLabel}>Uygulamasız Web Kolaylığı</Text>
              </View>
            </View>

            {/* Hero Mockup Görseli */}
            <View style={styles.mockupContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.mockupImage}
                resizeMode="cover"
              />
              <View style={styles.mockupFloatingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.mockupFloatingText}>Canlı Projeksiyon & Slayt Modu Açık</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ÖNCESİ VS SONRASI KARŞILAŞTIRMA */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>NEDEN QR-LA DÜĞÜN?</Text>
          <Text style={styles.sectionHeading}>Geleneksel Yöntemler vs. QR-la Farkı</Text>

          <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
            {/* Eski Yöntem */}
            <View style={styles.compareCardBad}>
              <View style={styles.compareHeader}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.compareTitleBad}>Geleneksel Düğünler</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextBad}>❌ Misafirlerin çektiği yüzlerce eşsiz anı kaybolur</Text>
                <Text style={styles.compareTextBad}>❌ WhatsApp gruplarında fotoğraflar sıkışır ve kalitesi düşer</Text>
                <Text style={styles.compareTextBad}>❌ Fotoğraf istemek için haftalarca akrabaları aramak gerekir</Text>
                <Text style={styles.compareTextBad}>❌ Salonda misafirleri eğlendirecek interaktif bir akış yoktur</Text>
                <Text style={styles.compareTextBad}>❌ Uygulama indirme zorunluluğu olan araçları kimse yüklemez</Text>
              </View>
            </View>

            {/* QR-la Yöntemi */}
            <View style={styles.compareCardGood}>
              <View style={styles.compareHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.compareTitleGood}>QR-la ile Masalsı Düğün</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextGood}>✨ Masa kartındaki karekoda kamera tutulur tutulmaz yükleme açılır</Text>
                <Text style={styles.compareTextGood}>✨ Yüklenen kareler anında salondaki projeksiyon ekranına yansır</Text>
                <Text style={styles.compareTextGood}>✨ Ziyaretçiler sesli ve yazılı dijital anı defteri tebriği bırakır</Text>
                <Text style={styles.compareTextGood}>✨ Düğün sabahı tek tıkla orijinal kalitede tüm fotoğraflar ZIP iner</Text>
                <Text style={styles.compareTextGood}>✨ İsteğe bağlı 4 haneli PIN kodu koruması ve anlık moderasyon</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEMEL ÖZELLİKLER IZGARASI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>TEKNOLOJİ & ÖZELLİKLER</Text>
          <Text style={styles.sectionHeading}>Düğün Günü İhtiyacınız Olan Her Şey</Text>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {[
              {
                icon: 'tv-outline' as const,
                title: 'Canlı Projeksiyon & Slayt Ekranı',
                desc: 'Salondaki dev LED ekrana veya projeksiyona tam ekran bağlayın. Misafirler masadan fotoğraf yükledikçe ekranda şık animasyonlarla belirsin.',
              },
              {
                icon: 'book-outline' as const,
                title: 'Dijital Anı Defteri & Tebrikler',
                desc: 'Klasik kağıt defterlerin yerini alan interaktif tebrik alanı. Misafirleriniz duygusal mesajlarını ve masalarından fotoğraflarını kalıcı olarak paylaşsın.',
              },
              {
                icon: 'download-outline' as const,
                title: 'Tek Tıkla ZIP Arşiv İndirme',
                desc: 'Düğün gecesi sona erdiğinde tek bir tıkla tüm albümü tam çözünürlüklü ZIP arşivi olarak bilgisayarınıza veya telefonunuza indirin.',
              },
              {
                icon: 'lock-closed-outline' as const,
                title: 'PIN Kodu Koruması & Gizlilik',
                desc: 'Albümlerinizi yalnızca davetlilerinize açık tutun. İsteğe bağlı 4 haneli PIN şifresiyle yabancıların fotoğrafları görmesini engelleyin.',
              },
              {
                icon: 'color-palette-outline' as const,
                title: 'Özel Masa Standı Baskı Şablonu',
                desc: 'İsimlerinize ve düğün tarihinize özel altın yaldızlı masa kartı şablonunu anında yazdırın ya da matbaamıza sipariş verin.',
              },
              {
                icon: 'flash-outline' as const,
                title: 'Akıllı Sıkıştırma (10x Hız)',
                desc: 'Misafirlerinizin 20 MB’lık fotoğrafları bile saniyeler içinde yüklenir; kotanız tasarruflu kullanılır, misafir internetini tüketmez.',
              },
            ].map((feat, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconBadge}>
                  <Ionicons name={feat.icon} size={22} color="#D4AF37" />
                </View>
                <Text style={styles.featureCardTitle}>{feat.title}</Text>
                <Text style={styles.featureCardDesc}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FİZİKSEL MATBAA & MASA KARTLARI */}
        <View style={styles.phygitalSection}>
          <View style={styles.phygitalCard}>
            <View style={styles.phygitalTextCol}>
              <View style={styles.phygitalBadge}>
                <Ionicons name="cube" size={14} color="#10B981" />
                <Text style={styles.phygitalBadgeText}>FİZİKSEL BASKI & MATBAA</Text>
              </View>
              <Text style={styles.phygitalTitle}>Altın Yaldızlı Pleksi Masa Standları</Text>
              <Text style={styles.phygitalDesc}>
                Yalnızca dijital ekranla yetinmeyin! Masalarınız için 300g lüks kabartma altın yaldızlı
                kartlar ve ahşap şövaleli pleksi masa standları adresinize teslim edilsin.
              </Text>
              <TouchableOpacity
                style={styles.phygitalBtn}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={18} color="#0F172A" />
                <Text style={styles.phygitalBtnText}>Masa Standı Modellerini İncele</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.phygitalImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FİYATLANDIRMA ÖZETİ */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>ŞEFFAF PAKETLER</Text>
          <Text style={styles.sectionHeading}>Düğününüze Uygun Paketi Seçin</Text>

          <View style={[styles.pricingRow, isMobile && styles.pricingRowMobile]}>
            {/* Standart Paket */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Standart Kutlama</Text>
              <Text style={styles.priceVal}>1.490 ₺</Text>
              <Text style={styles.pricePeriod}>Tek Seferlik Ödeme</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📦 2 GB Bulut Alanı (~2.500 Fotoğraf)</Text>
                <Text style={styles.priceFeatureItem}>⏳ 90 Gün Saklama Süresi</Text>
                <Text style={styles.priceFeatureItem}>💌 Dijital Anı Defteri</Text>
                <Text style={styles.priceFeatureItem}>📦 ZIP Arşiv İndirme</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>Paketi Seç</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Paket (Öne Çıkan) */}
            <View style={[styles.priceCard, styles.priceCardFeatured]}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
              </View>
              <Text style={styles.pricePlanName}>Premium Düğün</Text>
              <Text style={[styles.priceVal, { color: '#D4AF37' }]}>3.990 ₺</Text>
              <Text style={styles.pricePeriod}>Tek Seferlik Ödeme</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📦 5 GB Bulut Alanı (~6.000 Fotoğraf)</Text>
                <Text style={styles.priceFeatureItem}>📺 Canlı Projeksiyon & Slayt Modu</Text>
                <Text style={styles.priceFeatureItem}>⏳ 180 Gün (6 Ay) Arşivleme</Text>
                <Text style={styles.priceFeatureItem}>💌 Dijital Anı Defteri & PIN Kodu</Text>
                <Text style={styles.priceFeatureItem}>✨ Özel Masa Kartı Grafik Tasarımı</Text>
              </View>
              <TouchableOpacity
                style={[styles.priceBtn, styles.priceBtnFeatured]}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={[styles.priceBtnText, { color: '#0F172A', fontWeight: '800' }]}>
                  Hemen Satın Al & Başla
                </Text>
              </TouchableOpacity>
            </View>

            {/* VIP Paket */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>VIP Masalsı Düğün</Text>
              <Text style={styles.priceVal}>5.990 ₺</Text>
              <Text style={styles.pricePeriod}>Tek Seferlik Ödeme</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📦 15 GB Devasa Depolama (~18.000 Fotoğraf)</Text>
                <Text style={styles.priceFeatureItem}>⏳ 1 Tam Yıl Kesintisiz Bulut Arşivi</Text>
                <Text style={styles.priceFeatureItem}>📺 Canlı Projeksiyon + Canlı Tebrik Pop-up</Text>
                <Text style={styles.priceFeatureItem}>💎 VIP Öncelikli WhatsApp Destek Hattı</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>VIP Başla</Text>
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
                q: 'Misafirlerin herhangi bir uygulama indirmesi gerekir mi?',
                a: 'Kesinlikle hayır! Telefonlarının kamerasını masadaki QR koda tuttukları anda tarayıcılarında yükleme ekranı açılır. İsimlerini yazıp saniyeler içinde fotoğraf yükleyebilirler.',
              },
              {
                q: 'Canlı projeksiyon modunu salonda nasıl bağlayabilirim?',
                a: 'Salonun bilgisayarından veya dizüstü bilgisayarınızdan qr-la.com/[etkinlik-adınız]/canli adresini açıp klavyeden F11 (tam ekran) yapmanız yeterlidir. Yüklenen fotoğraflar internet bağlantısıyla canlı akar.',
              },
              {
                q: 'Düğün bittikten sonra fotoğrafları nasıl teslim alırım?',
                a: 'Yönetim panelinizden tek bir tıkla tüm fotoğrafları orijinal kalitede sıkıştırılmış ZIP arşivi olarak indirebilirsiniz.',
              },
              {
                q: 'İstemediğim uygunsuz fotoğrafları silebilir miyim?',
                a: 'Evet, yönetim panelinden dilediğiniz fotoğrafı tek dokunuşla canlı ekrandan kaldırabilir veya silebilirsiniz.',
              },
            ].map((faq, i) => (
              <View key={i} style={styles.faqItem}>
                <View style={styles.faqQRow}>
                  <Ionicons name="help-circle" size={20} color="#D4AF37" />
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
            <Text style={styles.ctaBannerTitle}>Düğün Gününüzün Hiçbir Anı Kaybolmasın</Text>
            <Text style={styles.ctaBannerSub}>
              Ücretsiz etkinlik QR kodunuzu oluşturun, masa kartınızı indirin ve anıları canlı toplayın.
            </Text>
            <TouchableOpacity
              style={styles.ctaBannerBtn}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.88}
            >
              <Ionicons name="sparkles" size={18} color="#0F172A" />
              <Text style={styles.ctaBannerBtnText}>Hemen Ücretsiz Başlayın</Text>
            </TouchableOpacity>
          </View>
        </View>

        <MarketingFooter />
      </ScrollView>
    </View>
  );
}

function getStyles(isDark: boolean, colors: ThemeColors) {
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
      backgroundColor: colors.goldBg,
      borderWidth: 1,
      borderColor: '#D4AF37',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    heroBadgeText: {
      color: '#D4AF37',
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
    heroTitleGold: {
      color: '#D4AF37',
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
      backgroundColor: '#D4AF37',
      paddingHorizontal: 24,
      paddingVertical: 15,
      borderRadius: 14,
      shadowColor: '#D4AF37',
      shadowOpacity: 0.25,
      shadowRadius: 15,
    },
    primaryCtaText: {
      color: '#0F172A',
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
      color: '#D4AF37',
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
      shadowOpacity: 0.15,
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
      borderColor: 'rgba(212, 175, 55, 0.4)',
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
      color: '#D4AF37',
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
      backgroundColor: isDark ? '#0F1A1B' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? '#064E3B' : '#BBF7D0',
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
      color: isDark ? '#A7F3D0' : '#16A34A',
      fontSize: 18,
      fontWeight: '700',
    },
    compareList: {
      gap: 12,
    },
    compareTextBad: {
      color: isDark ? '#94A3B8' : '#7F1D1D',
      fontSize: 13,
      lineHeight: 19,
    },
    compareTextGood: {
      color: isDark ? '#E2E8F0' : '#14532D',
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
      backgroundColor: colors.card,
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
      backgroundColor: colors.goldBg,
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
      backgroundColor: isDark ? '#131D31' : '#FAF5EA',
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
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    phygitalBadgeText: {
      color: '#10B981',
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
      backgroundColor: '#10B981',
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      gap: 14,
      justifyContent: 'space-between',
    },
    priceCardFeatured: {
      borderColor: '#D4AF37',
      backgroundColor: isDark ? '#131D31' : '#FAF5EA',
      shadowColor: '#D4AF37',
      shadowOpacity: 0.15,
      shadowRadius: 20,
    },
    featuredBadge: {
      backgroundColor: '#D4AF37',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    featuredBadgeText: {
      color: '#0F172A',
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
      color: colors.textSecondary,
      fontSize: 13,
    },
    priceBtn: {
      backgroundColor: isDark ? '#1E293B' : '#1A1817',
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: 'center',
    },
    priceBtnFeatured: {
      backgroundColor: '#D4AF37',
    },
    priceBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    faqList: {
      gap: 14,
    },
    faqItem: {
      backgroundColor: colors.card,
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
      backgroundColor: isDark ? '#131D31' : '#FAF5EA',
      borderWidth: 1,
      borderColor: '#D4AF37',
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
      backgroundColor: '#D4AF37',
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: 14,
      marginTop: 6,
    },
    ctaBannerBtnText: {
      color: '#0F172A',
      fontSize: 15,
      fontWeight: '800',
    },
  });
}
