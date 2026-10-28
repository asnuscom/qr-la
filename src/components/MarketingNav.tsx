import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export type MarketingModuleId = 'home' | 'dugun' | 'otomobil' | 'pati' | 'kartvizit' | 'menu';

interface MarketingNavProps {
  activeModule?: MarketingModuleId;
  accentColor?: string;
}

export const MODULE_NAV_LINKS = [
  { id: 'otomobil', label: 'Araç Tagı', icon: 'car-sport' as const, route: '/otomobil', color: '#0284C7' },
  { id: 'pati', label: 'Pati Künyesi', icon: 'paw' as const, route: '/pati', color: '#10B981' },
  { id: 'kartvizit', label: 'Kartvizit', icon: 'card' as const, route: '/kartvizit', color: '#6366F1' },
  { id: 'menu', label: 'QR Menü', icon: 'restaurant' as const, route: '/menu', color: '#F59E0B' },
  { id: 'dugun', label: 'Etkinlik', icon: 'images' as const, route: '/dugun', color: '#EC4899' },
];

const BRAND_PRIMARY = '#6366F1';

export default function MarketingNav({ activeModule = 'home', accentColor = BRAND_PRIMARY }: MarketingNavProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const isSmallPhone = width < 480;
  const currentUser = authService.getState().user;
  const { isDark, colors } = useTheme();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <>
      <View
        style={[
          styles.navContainer,
          {
            backgroundColor: isDark ? 'rgba(9, 13, 22, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.navInner}>
          {/* Sol: Logo */}
          <TouchableOpacity
            style={styles.logoBtn}
            onPress={() => router.push('/' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.logoIcon, { backgroundColor: BRAND_PRIMARY }]}>
              <Ionicons name="qr-code" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              QR<Text style={{ color: BRAND_PRIMARY }}>-LA</Text>
            </Text>
            <View style={styles.livePulseDot} />
          </TouchableOpacity>

          {/* Orta: Modül Linkleri (Masaüstü) */}
          {!isMobile && (
            <View style={styles.navLinksRow}>
              {MODULE_NAV_LINKS.map((mod) => {
                const isActive = activeModule === mod.id;
                return (
                  <TouchableOpacity
                    key={mod.id}
                    style={[
                      styles.navLinkItem,
                      isActive && {
                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
                      },
                    ]}
                    onPress={() => router.push(mod.route as any)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={mod.icon}
                      size={14}
                      color={isActive ? mod.color : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.navLinkText,
                        { color: isActive ? (isDark ? '#F8FAFC' : '#0F172A') : isDark ? '#94A3B8' : '#64748B' },
                        isActive && { fontWeight: '800', color: mod.color },
                      ]}
                    >
                      {mod.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Sağ: Aksiyon Butonları & Tema Butonu */}
          <View style={styles.navRightActions}>
            <ThemeToggleBtn size="sm" />

            {/* Canlı Demo Butonu */}
            <TouchableOpacity
              style={[
                styles.navDemoBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
              onPress={() => setIsDemoModalOpen(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={13} color={BRAND_PRIMARY} />
              <Text style={[styles.navDemoBtnText, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                {isSmallPhone ? 'Demo' : 'Canlı Demo'}
              </Text>
            </TouchableOpacity>

            {/* Panelim / Giriş Butonu */}
            {currentUser ? (
              <TouchableOpacity
                style={[styles.navPrimaryBtn, { backgroundColor: BRAND_PRIMARY }]}
                onPress={() => router.push('/panel' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.navPrimaryBtnText}>{isSmallPhone ? 'Panel' : 'Panelim'}</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navPrimaryBtn, { backgroundColor: BRAND_PRIMARY }]}
                onPress={() => router.push({ pathname: '/giris', params: { tab: 'login' } } as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.navPrimaryBtnText}>Giriş Yap</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mobil Modül Kaydırma Çubuğu */}
        {isMobile && (
          <View style={styles.mobileModuleScrollContainer}>
            {MODULE_NAV_LINKS.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <TouchableOpacity
                  key={mod.id}
                  style={[
                    styles.mobileModulePill,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isActive ? mod.color : isDark ? '#334155' : '#E2E8F0',
                    },
                    isActive && { backgroundColor: `${mod.color}15` },
                  ]}
                  onPress={() => router.push(mod.route as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={mod.icon}
                    size={12}
                    color={isActive ? mod.color : isDark ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.mobileModuleText,
                      { color: isActive ? (isDark ? '#F8FAFC' : '#0F172A') : isDark ? '#94A3B8' : '#64748B' },
                      isActive && { fontWeight: '800', color: mod.color },
                    ]}
                  >
                    {mod.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ========================================================================= */}
      {/* CANLI DEMO SEÇİM MODALI (TÜM SAYFALARDA ÇALIŞIR) */}
      {/* ========================================================================= */}
      <Modal
        visible={isDemoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDemoModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? '#1F2937' : '#E2E8F0' },
            ]}
          >
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
                style={[
                  styles.modalItemCard,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/34abc123' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Ionicons name="car-sport" size={22} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    🚗 34 ABC 123 (Araç Tagı Demosu)
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Gizli numara WhatsApp köprüsünü ve kan grubu acil durum ekranını görün
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#0284C7" />
              </TouchableOpacity>

              {/* Pati Demosu */}
              <TouchableOpacity
                style={[
                  styles.modalItemCard,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/p/duman' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="paw" size={22} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    🐾 Duman (Pati Künyesi Demosu)
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Petguru entegrasyonlu GPS konum paylaşımı ve aşı karnesini test edin
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#10B981" />
              </TouchableOpacity>

              {/* Kartvizit Demosu */}
              <TouchableOpacity
                style={[
                  styles.modalItemCard,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/samet-sunman' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                  <Ionicons name="briefcase" size={22} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    💼 Samet Sunman (Dijital Kartvizit)
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Tek tıkla rehbere (.vcf) indirme ve sosyal medya profilini inceleyin
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#6366F1" />
              </TouchableOpacity>

              {/* Menü Demosu */}
              <TouchableOpacity
                style={[
                  styles.modalItemCard,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/m/lucca-bistrot' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Ionicons name="restaurant" size={22} color="#F59E0B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    🍽️ Lucca Bistrot (Restoran QR Menü)
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Fotoğraflı menüyü gezin, garson çağırma butonunu test edin
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#F59E0B" />
              </TouchableOpacity>

              {/* Etkinlik Demosu */}
              <TouchableOpacity
                style={[
                  styles.modalItemCard,
                  { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/samet-ve-sule' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Ionicons name="images" size={22} color="#EC4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    📸 Samet &amp; Şule (Etkinlik Albümü)
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Misafir fotoğraf yükleme galerisini ve anı defterini görün
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#EC4899" />
              </TouchableOpacity>

              {/* Yönetim Paneli */}
              <TouchableOpacity
                style={[
                  styles.modalItemCard,
                  {
                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  },
                ]}
                onPress={() => {
                  setIsDemoModalOpen(false);
                  router.push('/panel' as any);
                }}
              >
                <View style={[styles.modalItemIconWrap, { backgroundColor: '#6366F1' }]}>
                  <Ionicons name="grid" size={22} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalItemTitle, { color: '#6366F1' }]}>
                    📊 Çoklu Varlık Yönetim Paneli
                  </Text>
                  <Text style={[styles.modalItemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    Tüm modüllerin tek bir merkezden yönetildiği demo panel
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    borderBottomWidth: 1,
    position: 'sticky' as any,
    top: 0,
    zIndex: 999,
  },
  navInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
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
    gap: 12,
  },
  navLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  navPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mobileModuleScrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  mobileModulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  mobileModuleText: {
    fontSize: 11,
    fontWeight: '600',
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
