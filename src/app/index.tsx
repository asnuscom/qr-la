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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PLAN_TIERS } from '@/services/mockData';

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="qr-code" size={20} color="#C5A059" />
            </View>
            <Text style={styles.logoText}>
              QR<Text style={{ color: '#C5A059' }}>-la</Text>
            </Text>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navLinkBtn}
              onPress={() => router.push('/giris' as any)}
            >
              <Text style={styles.navLinkText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoHeaderBtn}
              onPress={() => router.push('/panel' as any)}
            >
              <Text style={styles.demoHeaderBtnText}>Ev Sahibi Paneli</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color="#C5A059" />
            <Text style={styles.heroBadgeText}>DÜĞÜN, NİŞAN VE ÖZEL GÜNLER İÇİN YENİ NESİL PAYLAŞIM</Text>
          </View>

          <Text style={styles.heroTitle}>
            Masadaki Kodu <Text style={styles.highlightText}>QR'la</Text>,{'\n'}
            En Mutlu Anları Paylaş & Kutla
          </Text>

          <Text style={styles.heroSubtitle}>
            Misafirlerinizin çektiği yüzlerce eşsiz fotoğraf WhatsApp gruplarında kaybolmasın.
            Uygulama indirmeden, tek bir QR kodla tüm fotoğrafları toplayın ve salondaki dev ekrana anında yansıtın!
          </Text>

          {/* Action CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/panel/duzenle' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.primaryCtaText}>Kendi Etkinliğini Başlat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/yavuz-ve-merve' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="play-circle" size={20} color="#1A1817" />
              <Text style={styles.secondaryCtaText}>Canlı Düğün Demosunu Gör</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/yavuz-ve-merve/canli' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="tv-outline" size={20} color="#1A1817" />
              <Text style={styles.secondaryCtaText}>Projeksiyon Modu</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={styles.trustBadgesRow}>
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.trustBadgeText}>Uygulama İndirmek Yok</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="flash" size={16} color="#EAB308" />
              <Text style={styles.trustBadgeText}>10x Akıllı Sıkıştırma</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="cloud-download" size={16} color="#3B82F6" />
              <Text style={styles.trustBadgeText}>Tek Tıkla ZIP İndir</Text>
            </View>
          </View>

          {/* Mockup Preview Card */}
          <View style={styles.mockupContainer}>
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
              <Text style={styles.mockupCaption}>
                "Merve & Yavuz'un Boğaz manzaralı masalsı gecesinden 42 anı paylaşıldı!"
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionOverline}>NASIL ÇALIŞIR?</Text>
          <Text style={styles.sectionHeading}>3 Adımda Zahmetsiz Anı Koleksiyonu</Text>

          <View style={[styles.stepsGrid, isDesktop && styles.stepsGridDesktop]}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="print" size={28} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>QR Masa Kartını Bastır</Text>
              <Text style={styles.stepDesc}>
                Panelimizden çiftinize özel hazırlanan altın detaylı şık masa kartı şablonunu indirin ve masalara koyun.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="camera" size={28} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Misafirler QR'lasın</Text>
              <Text style={styles.stepDesc}>
                Telefon kamerası tutulduğunda sayfa anında açılır. Otomatik sıkıştırma ile 10-20 fotoğraf saniyeler içinde yüklenir.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepIconWrap}>
                <Ionicons name="tv" size={28} color="#C5A059" />
              </View>
              <Text style={styles.stepTitle}>Dev Ekranda Canlı Görün</Text>
              <Text style={styles.stepDesc}>
                Projeksiyonda yeni yüklenen tüm kareler müzik eşliğinde dönsün. Gece bitiminde tüm arşivi tek tıkla ZIP olarak indirin.
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing Packages Section */}
        <View style={styles.section}>
          <Text style={styles.sectionOverline}>KOTA & TARİFELER</Text>
          <Text style={styles.sectionHeading}>Her Etkinliğe Uygun Paketler</Text>
          <Text style={styles.sectionSub}>
            Tüm paketlerde ücretsiz 500 MB ile başlayabilir, dilediğiniz zaman tek tıkla kotanızı yükseltebilirsiniz.
          </Text>

          <View style={[styles.plansGrid, isDesktop && styles.plansGridDesktop]}>
            {PLAN_TIERS.map((tier) => (
              <View
                key={tier.tier}
                style={[styles.planCard, tier.isPopular && styles.planCardPopular]}
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
                  onPress={() => router.push('/panel' as any)}
                >
                  <Text style={[styles.planBtnText, tier.isPopular && styles.planBtnTextPopular]}>
                    {tier.priceTL === 0 ? 'Hemen Başla' : 'Paketi Seç'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE6',
    backgroundColor: '#FFF',
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
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLinkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  demoHeaderBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  demoHeaderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    marginBottom: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D3B',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1A1817',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -1,
    maxWidth: 720,
    marginBottom: 16,
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
    marginBottom: 32,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 32,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#C5A059',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  secondaryCtaText: {
    color: '#1A1817',
    fontSize: 15,
    fontWeight: '700',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 13,
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
    padding: 20,
  },
  mockupLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mockupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  mockupLiveText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  mockupCaption: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  sectionOverline: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C5A059',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 580,
    marginBottom: 36,
  },
  stepsGrid: {
    width: '100%',
    maxWidth: 1000,
    gap: 20,
  },
  stepsGridDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3EFE6',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  stepNumberBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A6D3B',
  },
  stepIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
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
    maxWidth: 1100,
    gap: 20,
  },
  plansGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  planCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    position: 'relative',
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
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3EFE6',
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  footerCopy: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
