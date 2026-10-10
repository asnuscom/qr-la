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

export default function VehicleLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const { isDark, colors } = useTheme();

  const ACCENT = '#0284C7';
  const styles = getStyles(isDark, colors, ACCENT);

  return (
    <View style={styles.container}>
      <Head>
        <title>Akıllı Araç & Motosiklet Park Tagı QR | Numara Gizleme | QR-la</title>
        <meta
          name="description"
          content="Ön cama telefon numarası yazma devri bitti. QR-la Akıllı Araç Park Tagı ile numaranızı maskeleyin, yabancılar doğrudan görmeden WhatsApp'tan hazır şablonla ulaşsın. 20+ otomobil teması, acil kan grubu rozeti ve UV güneşe dayanıklı sticker."
        />
        <meta
          name="keywords"
          content="araç qr kod, akıllı park tagı, araç park kartı, araba numaratör, numara gizleme, motosiklet kask qr etiketi, park telefon numarası maskeleme"
        />
        <meta property="og:title" content="Akıllı Araç & Motosiklet Park Tagı QR | Numara Gizleme | QR-la" />
        <meta
          property="og:description"
          content="Cama numara yazıp spam ve taciz riskine girmeyin. Akıllı QR Park Tagı ile güvenli ve maskeli iletişim sağlayın."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
        />
        <link rel="canonical" href="https://qr-la.com/otomobil" />
      </Head>

      <MarketingNav activeModule="otomobil" accentColor={ACCENT} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <Ionicons name="car-sport" size={14} color={ACCENT} />
              <Text style={styles.heroBadgeText}>ARAÇ & MOTOSİKLET EKOSİSTEMİ</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Ön Cama Numara Yazma Devri Bitti,{'\n'}
              <Text style={styles.heroTitleAccent}>Numaranı Maskele, Güvenle Park Et</Text>
            </Text>

            <Text style={styles.heroSub}>
              Telefon numaranız sokaktan geçenlerin eline geçmesin; spam mesajlara, tacizlere ve veri sızıntılarına son verin.
              Aracınızın camındaki QR kod ile sürücüler tek tıkla 'Aracınızı çeker misiniz?', 'Farlarınız açık kaldı' gibi hazır mesajlarla size WhatsApp'tan güvenle ulaşsın.
            </Text>

            {/* CTA Butonları */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => router.push('/panel/arac' as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.primaryCtaText}>Araç Tagınızı Ücretsiz Oluşturun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => router.push('/34abc123' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={18} color={isDark ? '#F8FAFC' : '#1A1817'} />
                <Text style={styles.secondaryCtaText}>Örnek Araç Tagını Gör</Text>
              </TouchableOpacity>
            </View>

            {/* İstatistik Rozetleri */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>45.000+</Text>
                <Text style={styles.statLabel}>Aktif Araç & Motor</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%100</Text>
                <Text style={styles.statLabel}>Numara Gizliliği</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>20+</Text>
                <Text style={styles.statLabel}>Marka Tasarım Teması</Text>
              </View>
            </View>

            {/* Hero Mockup Görseli */}
            <View style={styles.mockupContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.mockupImage}
                resizeMode="cover"
              />
              <View style={styles.mockupFloatingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.mockupFloatingText}>Plaka: 34 ABC 123 • Gizlilik Modu Aktif</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ÖNCESİ VS SONRASI KARŞILAŞTIRMA */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>NEDEN QR-LA PARK TAGI?</Text>
          <Text style={styles.sectionHeading}>Klasik Kağıt Numaratör vs. Akıllı QR Tag</Text>

          <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
            {/* Eski Yöntem */}
            <View style={styles.compareCardBad}>
              <View style={styles.compareHeader}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.compareTitleBad}>Geleneksel Kağıt Numaratör</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextBad}>❌ Telefon numaranız sokaktan geçen binlerce yabancıya ifşa olur</Text>
                <Text style={styles.compareTextBad}>❌ Kadın sürücüler için ciddi güvenlik ve taciz riski oluşturur</Text>
                <Text style={styles.compareTextBad}>❌ Dolandırıcılar ve spam pazarlama botları numaranızı toplar</Text>
                <Text style={styles.compareTextBad}>❌ Güneşte sararır, mürekkebi uçar, cama yapışıp leke bırakır</Text>
                <Text style={styles.compareTextBad}>❌ Kaza veya acil durumlarda kan grubu ve yakın bilgisi bulunmaz</Text>
              </View>
            </View>

            {/* QR-la Yöntemi */}
            <View style={styles.compareCardGood}>
              <View style={styles.compareHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.compareTitleGood}>QR-la Akıllı Araç Tagı</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextGood}>✨ Numaranız maskelenir, doğrudan yabancılar tarafından kopyalanamaz</Text>
                <Text style={styles.compareTextGood}>✨ Karşı taraf tek tıkla 'Aracınızı çeker misiniz?' hazır mesajı yollar</Text>
                <Text style={styles.compareTextGood}>✨ Farlar açık, cam aralık, alarm çalıyor gibi 4 hızlı acil buton</Text>
                <Text style={styles.compareTextGood}>✨ Hayat kurtaran Acil Durum Kan Grubu ve Aile Yakını rozeti</Text>
                <Text style={styles.compareTextGood}>✨ BMW, Mercedes, Porsche, Honda gibi 20+ marka görsel teması</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEMEL ÖZELLİKLER IZGARASI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>TEKNOLOJİ & GÜVENLİK</Text>
          <Text style={styles.sectionHeading}>Aracınız İçin Eksiksiz Güvenlik Katmanı</Text>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {[
              {
                icon: 'shield-half-outline' as const,
                title: 'Tam Numara Gizliliği & Maskeleme',
                desc: 'Numaranız ekranda açıkça yazmaz. Tarayıcı üzerinden güvenli WhatsApp API köprüsü ve maskeli arama protokolü ile iletişim sağlanır.',
              },
              {
                icon: 'chatbubbles-outline' as const,
                title: '4 Hızlı Hazır Durum Mesajı',
                desc: 'Kullanıcı uzun uzun yazmakla uğraşmaz: "Aracınızı çeker misiniz?", "Farlarınız açık kaldı", "Camınız aralık", "Alarmınız çalıyor" şablonları.',
              },
              {
                icon: 'medkit-outline' as const,
                title: 'Acil Kan Grubu & Yakın Rozeti',
                desc: 'Olası bir kaza anında sağlık ekiplerinin ilk müdahalede kan grubunuzu ve arayabilecekleri ilk yakınınızı saniyeler içinde görmesini sağlar.',
              },
              {
                icon: 'speedometer-outline' as const,
                title: '20+ Otomobil & Motosiklet Teması',
                desc: 'BMW, Mercedes-AMG, Audi, Porsche, Volvo, Honda, Yamaha, Ducati dahil aracınızın ruhuna uygun modern tasarım modları.',
              },
              {
                icon: 'phone-portrait-outline' as const,
                title: 'Uygulama İndirme Zorunluluğu Yok',
                desc: 'Aracınızın başındaki kişinin herhangi bir uygulama indirmesine gerek yoktur; standart telefon kamerasıyla anında taranır.',
              },
              {
                icon: 'sunny-outline' as const,
                title: 'Güneşe & UV Işınlarına Dayanıklı',
                desc: 'Özel elektrostatik film teknolojisiyle ön camın içinden uygulanır. 70°C yaz sıcağında bile sararmaz, yapışkan izi bırakmaz.',
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

        {/* FİZİKSEL MATBAA & UV STICKER */}
        <View style={styles.phygitalSection}>
          <View style={styles.phygitalCard}>
            <View style={styles.phygitalTextCol}>
              <View style={styles.phygitalBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
                <Text style={styles.phygitalBadgeText}>FİZİKSEL ÜRÜN & UV BASKI</Text>
              </View>
              <Text style={styles.phygitalTitle}>Elektrostatik Ön Cam Stickerı</Text>
              <Text style={styles.phygitalDesc}>
                Ön camınızın iç tarafına yapıştırıcısız tutunan, istediğinizde söküp yerini değiştirebileceğiniz,
                güneşte solmayan mat siyah karbon dokulu QR sticker adresinize teslim edilsin.
              </Text>
              <TouchableOpacity
                style={styles.phygitalBtn}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.phygitalBtnText}>Fiziksel Sticker Modellerini İncele</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.phygitalImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FİYATLANDIRMA ÖZETİ */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>ŞEFFAF PAKETLER</Text>
          <Text style={styles.sectionHeading}>Aracınız İçin Doğru Paketi Seçin</Text>

          <View style={[styles.pricingRow, isMobile && styles.pricingRowMobile]}>
            {/* Standart Dijital Paket */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Dijital Araç Tagı</Text>
              <Text style={styles.priceVal}>199 ₺</Text>
              <Text style={styles.pricePeriod}>Ömür Boyu Tek Seferlik</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>🛡️ Numara Maskeleme & Gizlilik Modu</Text>
                <Text style={styles.priceFeatureItem}>💬 4 Adet Hızlı WhatsApp Butonu</Text>
                <Text style={styles.priceFeatureItem}>🚑 Acil Kan Grubu & Yakın Bilgisi</Text>
                <Text style={styles.priceFeatureItem}>🖨️ PDF Yazdırılabilir Karekod Çıktısı</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>Dijital Başla</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Paket (Öne Çıkan) */}
            <View style={[styles.priceCard, styles.priceCardFeatured]}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>EN ÇOK TERCİH EDİLEN</Text>
              </View>
              <Text style={styles.pricePlanName}>Araç Tagı + 2 Adet UV Sticker</Text>
              <Text style={[styles.priceVal, { color: ACCENT }]}>299 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>✨ 2 Adet Elektrostatik Ön Cam Stickerı</Text>
                <Text style={styles.priceFeatureItem}>☀️ Güneşte Solmayan 70°C Isı Koruması</Text>
                <Text style={styles.priceFeatureItem}>🏎️ 20+ Özel Marka Teması (BMW, Mercedes vb.)</Text>
                <Text style={styles.priceFeatureItem}>🛡️ Ömür Boyu Numara Maskeleme Garantisi</Text>
                <Text style={styles.priceFeatureItem}>⚡ Sınırsız Profil Güncelleme Hakkı</Text>
              </View>
              <TouchableOpacity
                style={[styles.priceBtn, styles.priceBtnFeatured]}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={[styles.priceBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                  Sticker Seti Satın Al
                </Text>
              </TouchableOpacity>
            </View>

            {/* Motosiklet & Kask VIP Paketi */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Motorcu Rider VIP Seti</Text>
              <Text style={styles.priceVal}>349 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>🏍️ 3 Adet Mini Kask & Depo Stickerı</Text>
                <Text style={styles.priceFeatureItem}>🌧️ Yağmur ve Basınçlı Yıkamaya Dayanıklı</Text>
                <Text style={styles.priceFeatureItem}>🚑 Kaza Anı Acil Medikal Kurtarma Kartı</Text>
                <Text style={styles.priceFeatureItem}>🏍️ Yamaha, Honda, Kawasaki Temaları</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>Rider Seti Seç</Text>
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
                q: 'Telefon numaram gerçekten yabancılar tarafından görülmüyor mu?',
                a: 'Evet! Gizlilik modunu açtığınızda telefon numaranız ekranda maskelenir (örneğin: 0541 *** ** 66). Karşı taraf numarayı göremez, yalnızca sistem üzerinden WhatsApp mesajı veya güvenli arama başlatabilir.',
              },
              {
                q: 'Sticker camda yapışkan izi bırakır mı veya güneşte solar mı?',
                a: 'Hayır. Gönderdiğimiz fiziksel stickerlar elektrostatik vakum teknolojisine sahiptir ve UV korumalıdır. Cama yapıştırıcı olmadan tutunur, yazın 70 derece sıcaklıkta bile sararma yapmaz.',
              },
              {
                q: 'Arabamı veya telefon numaramı değiştirirsem ne olur?',
                a: 'Karekodunuz asla çöp olmaz! QR-la yönetim panelinize girip plakanızı, telefonunuzu veya acil durum bilgilerinizi saniyeler içinde güncelleyebilirsiniz.',
              },
              {
                q: 'Motosiklet veya scooter için de kullanabilir miyim?',
                a: 'Kesinlikle! Motosiklet kaskına veya gidonuna yapıştırılabilen suya ve basınca dayanıklı mini stickerlarımız ile sürücüler kaza veya park anında size anında ulaşabilir.',
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
            <Text style={styles.ctaBannerTitle}>Aracınızı Park Ederken İçiniz Rahat Olsun</Text>
            <Text style={styles.ctaBannerSub}>
              Cama numara yazıp spam riski yaşamayın. 2 dakikada dijital araç tagınızı oluşturun ve huzurla park edin.
            </Text>
            <TouchableOpacity
              style={styles.ctaBannerBtn}
              onPress={() => router.push('/panel/arac' as any)}
              activeOpacity={0.88}
            >
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBannerBtnText}>Ücretsiz Araç Tagı Oluşturun</Text>
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
      backgroundColor: 'rgba(2, 132, 199, 0.12)',
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
      borderColor: 'rgba(2, 132, 199, 0.4)',
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
      backgroundColor: isDark ? '#0F1A1B' : '#F0FDF4',
      borderWidth: 1,
      borderColor: isDark ? '#0284C7' : '#BAE6FD',
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
      color: isDark ? '#7DD3FC' : '#0284C7',
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
      color: isDark ? '#E2E8F0' : '#0369A1',
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
      backgroundColor: 'rgba(2, 132, 199, 0.12)',
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
      backgroundColor: isDark ? '#131D31' : '#F0F9FF',
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
      backgroundColor: 'rgba(2, 132, 199, 0.15)',
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 24,
      gap: 14,
      justifyContent: 'space-between',
    },
    priceCardFeatured: {
      borderColor: accent,
      backgroundColor: isDark ? '#131D31' : '#F0F9FF',
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
      backgroundColor: accent,
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
      backgroundColor: isDark ? '#131D31' : '#F0F9FF',
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
