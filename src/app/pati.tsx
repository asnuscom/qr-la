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

export default function PetLandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;
  const { isDark, colors } = useTheme();

  const ACCENT = '#10B981';
  const styles = getStyles(isDark, colors, ACCENT);

  return (
    <View style={styles.container}>
      <Head>
        <title>Petguru x QR-la Akıllı Pati Künyesi | Kayıp Evcil Hayvan Takibi & GPS</title>
        <meta
          name="description"
          content="Dostunuz asla kaybolmasın. Petguru x QR-la Akıllı Pati Künyesi taranınca sahibine anında WhatsApp üzerinden GPS konumu iletilir. 🚨 Tek tıkla Kayıp Alarmı & Ödül İlanı, dijital aşı karnesi, alerji kartı ve 30mm paslanmaz çelik lazer künye."
        />
        <meta
          name="keywords"
          content="kedi köpek künye, akıllı pati künyesi, kayıp evcil hayvan takibi, gps pati tagı, petguru qr künye, lazer tasma künyesi, hayvan aşı kartı qr"
        />
        <meta property="og:title" content="Petguru x QR-la Akıllı Pati Künyesi | Kayıp Evcil Hayvan Takibi & GPS" />
        <meta
          property="og:description"
          content="Şarj derdi olmayan ömür boyu koruma! Künye okutulduğu an harita konumu cebinize gelsin, dostunuz güvende kalsın."
        />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80"
        />
        <link rel="canonical" href="https://qr-la.com/pati" />
      </Head>

      <MarketingNav activeModule="pati" accentColor={ACCENT} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroInner}>
            <View style={styles.heroBadge}>
              <Ionicons name="paw" size={14} color={ACCENT} />
              <Text style={styles.heroBadgeText}>PETGURU x QR-LA EVCİL HAYVAN EKOSİSTEMİ</Text>
            </View>

            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Dostunuz Asla Kaybolmasın,{'\n'}
              <Text style={styles.heroTitleAccent}>Akıllı Künye ile Saniyeler İçinde Bulunsun</Text>
            </Text>

            <Text style={styles.heroSub}>
              Geleneksel künyeler aşınır, silinir ve taşındığınızda çöp olur.
              Petguru x QR-la Akıllı Pati Künyesi taranınca bulan kişinin onaylı canlı GPS konumu tek tıkla WhatsApp'tan size ulaşır.
              Dostunuz kaybolursa tek bir dokunuşla '🚨 Kayıp Alarmı' ve ödül sirenini yayına alın.
            </Text>

            {/* CTA Butonları */}
            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryCtaBtn}
                onPress={() => router.push('/panel/pati' as any)}
                activeOpacity={0.88}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.primaryCtaText}>Pati Künyenizi Ücretsiz Oluşturun</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => router.push('/duman' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={18} color={isDark ? '#F8FAFC' : '#1A1817'} />
                <Text style={styles.secondaryCtaText}>Örnek Pati Profilini Gör</Text>
              </TouchableOpacity>
            </View>

            {/* İstatistik Rozetleri */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>28.000+</Text>
                <Text style={styles.statLabel}>Güvende Pati</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>3.400+</Text>
                <Text style={styles.statLabel}>Kayıp İhbarında Bulunan</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%100</Text>
                <Text style={styles.statLabel}>Şarjsız & Pilsiz Ömür Boyu</Text>
              </View>
            </View>

            {/* Hero Mockup Görseli */}
            <View style={styles.mockupContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.mockupImage}
                resizeMode="cover"
              />
              <View style={styles.mockupFloatingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.mockupFloatingText}>Duman • Golden Retriever • Aşılar Güncel • Güvende</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ÖNCESİ VS SONRASI KARŞILAŞTIRMA */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>NEDEN QR-LA PATİ KÜNYESİ?</Text>
          <Text style={styles.sectionHeading}>Klasik Metal Künye vs. Akıllı Pati Künyesi</Text>

          <View style={[styles.compareGrid, isMobile && styles.compareGridMobile]}>
            {/* Eski Yöntem */}
            <View style={styles.compareCardBad}>
              <View style={styles.compareHeader}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={styles.compareTitleBad}>Geleneksel Metal Plaka</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextBad}>❌ Üzerindeki telefon numarası sürtünmeyle birkaç ayda silinir</Text>
                <Text style={styles.compareTextBad}>❌ Telefonunuz veya adresiniz değiştiğinde künye tamamen çöp olur</Text>
                <Text style={styles.compareTextBad}>❌ Bulan kişi nerede olduğunu tarif edemez, GPS haritası yoktur</Text>
                <Text style={styles.compareTextBad}>❌ Hayvanın alerjisi, kronik hastalığı veya acil ilacı yazılamaz</Text>
                <Text style={styles.compareTextBad}>❌ Bulan kişinin çipi okutması için veteriner veteriner gezmesi gerekir</Text>
              </View>
            </View>

            {/* QR-la Yöntemi */}
            <View style={styles.compareCardGood}>
              <View style={styles.compareHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.compareTitleGood}>Petguru x QR-la Akıllı Künye</Text>
              </View>
              <View style={styles.compareList}>
                <Text style={styles.compareTextGood}>✨ Kamera tutulduğu an tek tıkla canlı GPS harita konumu sahibe iletilir</Text>
                <Text style={styles.compareTextGood}>✨ 🚨 Kayıp anında panelden tek dokunuşla Acil Siren ve Ödül İlanı açılır</Text>
                <Text style={styles.compareTextGood}>✨ Aşı karnesi, mama alerjileri ve veteriner kliniği bilgisi ekranda</Text>
                <Text style={styles.compareTextGood}>✨ Taşınsanız da panelden bilgileri saniyeler içinde güncelleyebilirsiniz</Text>
                <Text style={styles.compareTextGood}>✨ 30mm paslanmaz çelik, kararmaz, su geçirmez lazer işlemeli künye</Text>
              </View>
            </View>
          </View>
        </View>

        {/* TEMEL ÖZELLİKLER IZGARASI */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>TEKNOLOJİ & CAN DOSTU GÜVENLİĞİ</Text>
          <Text style={styles.sectionHeading}>Dostunuz İçin Hayat Kurtaran Özellikler</Text>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            {[
              {
                icon: 'navigate-circle-outline' as const,
                title: 'Canlı GPS Konum Paylaşımı',
                desc: 'Künye tarandığında tarayıcı kullanıcıdan konum izni ister ve Google Haritalar pinini saniyeler içinde sahibin WhatsApp hattına gönderir.',
              },
              {
                icon: 'alert-circle-outline' as const,
                title: '🚨 Kırmızı Kayıp Alarmı & Ödül Modu',
                desc: 'Dostunuz kaybolduğunda yönetim panelinden butona basın; profil sayfası kırmızı yanıp söner, siren sesi çalar ve ödül miktarı görünür.',
              },
              {
                icon: 'medkit-outline' as const,
                title: 'Dijital Aşı Karnesi & Alerjiler',
                desc: 'Karma, kuduz, parazit aşılarının geçerlilik tarihleri ve tavuk, polen gibi acil gıda alerjileri tek bakışta görünür.',
              },
              {
                icon: 'business-outline' as const,
                title: 'Kayıtlı Veteriner & Çip No',
                desc: 'Kayıtlı veteriner polikliniği tek tuşla aranabilir. 15 haneli uluslararası mikroçip numarası dijital olarak saklanır.',
              },
              {
                icon: 'battery-charging-outline' as const,
                title: 'Şarj Derdi Yok (Pilsiz Ömür)',
                desc: 'GPS tasmaları gibi her 2 günde bir şarj etmeye gerek yoktur. Suya, çamura ve darbelere karşı ömür boyu kesintisiz çalışır.',
              },
              {
                icon: 'hardware-chip-outline' as const,
                title: 'Petguru Çelik Lazer Kalitesi',
                desc: '30mm 316L cerrahi paslanmaz çelikten üretilmiştir. Havuzda, denizde veya yağmurda kararmaz, silinmez, çizilmez.',
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

        {/* FİZİKSEL MATBAA & ÇELİK KÜNYE */}
        <View style={styles.phygitalSection}>
          <View style={styles.phygitalCard}>
            <View style={styles.phygitalTextCol}>
              <View style={styles.phygitalBadge}>
                <Ionicons name="paw" size={14} color="#10B981" />
                <Text style={styles.phygitalBadgeText}>PETGURU ÖZEL KOLEKSİYONU</Text>
              </View>
              <Text style={styles.phygitalTitle}>30mm Paslanmaz Çelik Lazer Künye</Text>
              <Text style={styles.phygitalDesc}>
                Ön yüzünde dostunuzun ismi ve sevimli pati ikonu, arka yüzünde ise ömür boyu silinmeyen
                lazer kazımalı QR kod bulunan şık çelik künye kapınıza kadar gelsin.
              </Text>
              <TouchableOpacity
                style={styles.phygitalBtn}
                onPress={() => router.push('/panel/magaza' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.phygitalBtnText}>Fiziksel Çelik Künyeleri İncele</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.phygitalImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FİYATLANDIRMA ÖZETİ */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionOverline}>ŞEFFAF PAKETLER</Text>
          <Text style={styles.sectionHeading}>Dostunuz İçin Doğru Paketi Seçin</Text>

          <View style={[styles.pricingRow, isMobile && styles.pricingRowMobile]}>
            {/* Standart Dijital Paket */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>Dijital Pati Profili</Text>
              <Text style={styles.priceVal}>149 ₺</Text>
              <Text style={styles.pricePeriod}>Ömür Boyu Tek Seferlik</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>📍 GPS Konum Gönderme Butonu</Text>
                <Text style={styles.priceFeatureItem}>🚨 Tek Tıkla Kırmızı Kayıp Alarmı</Text>
                <Text style={styles.priceFeatureItem}>💉 Dijital Aşı Karnesi & Alerjiler</Text>
                <Text style={styles.priceFeatureItem}>🖨️ Kendi Yazıcınızdan Çıktı Alma</Text>
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
              <Text style={styles.pricePlanName}>Petguru Lazer Çelik Künye</Text>
              <Text style={[styles.priceVal, { color: ACCENT }]}>249 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>✨ 30mm 316L Cerrahi Paslanmaz Çelik</Text>
                <Text style={styles.priceFeatureItem}>⚡ Kararmaz ve Silinmez Lazer Kazıma</Text>
                <Text style={styles.priceFeatureItem}>🔔 Paslanmaz Çelik Tasma Halkası Dahil</Text>
                <Text style={styles.priceFeatureItem}>📍 Canlı GPS Harita İletimi & WhatsApp</Text>
                <Text style={styles.priceFeatureItem}>🚨 Sınırsız Kayıp Alarmı & Ödül Modu</Text>
              </View>
              <TouchableOpacity
                style={[styles.priceBtn, styles.priceBtnFeatured]}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={[styles.priceBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                  Lazer Künye Satın Al
                </Text>
              </TouchableOpacity>
            </View>

            {/* İkili Süper Set */}
            <View style={styles.priceCard}>
              <Text style={styles.pricePlanName}>İkili Koruma Paketi</Text>
              <Text style={styles.priceVal}>399 ₺</Text>
              <Text style={styles.pricePeriod}>Ücretsiz Kargo Dahil</Text>
              <View style={styles.priceFeatures}>
                <Text style={styles.priceFeatureItem}>🐾 2 Adet Lazer Kazımalı Çelik Künye</Text>
                <Text style={styles.priceFeatureItem}>🎒 1 Adet Taşıma Çantası Akıllı Tagı</Text>
                <Text style={styles.priceFeatureItem}>💎 VIP Acil Durum WhatsApp Bildirim Hattı</Text>
                <Text style={styles.priceFeatureItem}>🩺 Veteriner Randevu Hatırlatma Bildirimleri</Text>
              </View>
              <TouchableOpacity
                style={styles.priceBtn}
                onPress={() => router.push('/panel/tarifeler' as any)}
              >
                <Text style={styles.priceBtnText}>İkili Paketi Seç</Text>
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
                q: 'Künyeyi şarj etmem veya SIM kart takmam gerekir mi?',
                a: 'Hayır! Petguru x QR-la künyeleri şarjsız, pilsiz ve SIM kartsızdır. Ömür boyu çalışır, denize veya çamura girse dahi asla bozulmaz.',
              },
              {
                q: 'Bulan kişi GPS konumumu nasıl gönderebilir?',
                a: 'Bulan kişi kamerasıyla künyeyi okuttuğunda ekranda "Sahibe Konumumu Gönder" butonu belirir. Dokunduğu anda tarayıcı hassas GPS koordinatlarını alır ve sahibin WhatsApp hattına Google Harita linki olarak gönderir.',
              },
              {
                q: '🚨 Kayıp Alarmı modu nasıl çalışır?',
                a: 'Dostunuz kaybolursa yönetim panelinizden tek bir tıkla "Kayıp Durumu"nu aktif edersiniz. Künye okutulduğunda sayfa kırmızı alarm moduna geçer, ödül ilanı görünür ve anında siren çalar.',
              },
              {
                q: 'Evimi taşısam veya telefonumu değiştirsem ne olur?',
                a: 'Tasmayı veya künyeyi değiştirmenize gerek yoktur. Yönetim panelinizden yeni telefonunuzu, adresinizi veya aşılarınızı istediğiniz an güncelleyebilirsiniz.',
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
            <Text style={styles.ctaBannerTitle}>Dostunuzun Güvenliğini Şansa Bırakmayın</Text>
            <Text style={styles.ctaBannerSub}>
              2 dakikada ücretsiz dijital pati profilinizi oluşturun, aşı karnesini kaydedin ve kayıp riskini sıfıra indirin.
            </Text>
            <TouchableOpacity
              style={styles.ctaBannerBtn}
              onPress={() => router.push('/panel/pati' as any)}
              activeOpacity={0.88}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.ctaBannerBtnText}>Hemen Ücretsiz Başlayın</Text>
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
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
      borderColor: 'rgba(16, 185, 129, 0.4)',
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
      borderColor: isDark ? '#064E3B' : '#A7F3D0',
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
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
      backgroundColor: isDark ? '#131D31' : '#ECFDF5',
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
      backgroundColor: isDark ? '#131D31' : '#ECFDF5',
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
      backgroundColor: isDark ? '#131D31' : '#ECFDF5',
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
