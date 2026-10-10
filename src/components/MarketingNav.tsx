import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggleBtn from '@/components/ThemeToggleBtn';

export type MarketingModuleId = 'dugun' | 'otomobil' | 'pati' | 'kartvizit' | 'menu';

interface MarketingNavProps {
  activeModule: MarketingModuleId;
  accentColor?: string;
}

export const MODULE_NAV_LINKS = [
  { id: 'dugun', label: 'Düğün & Etkinlik', icon: 'heart' as const, route: '/dugun', color: '#C5A059' },
  { id: 'otomobil', label: 'Araç & Park Tagı', icon: 'car-sport' as const, route: '/otomobil', color: '#0284C7' },
  { id: 'pati', label: 'Pati Künyesi', icon: 'paw' as const, route: '/pati', color: '#10B981' },
  { id: 'kartvizit', label: 'Dijital Kartvizit', icon: 'card' as const, route: '/kartvizit', color: '#8B5CF6' },
  { id: 'menu', label: 'Restoran Menü', icon: 'restaurant' as const, route: '/menu', color: '#EA580C' },
];

export default function MarketingNav({ activeModule, accentColor = '#D4AF37' }: MarketingNavProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const isSmallPhone = width < 480;
  const currentUser = authService.getState().user;
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: colors.navBg,
          borderBottomColor: colors.border,
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
          <View style={[styles.logoIcon, { backgroundColor: `${accentColor}20` }]}>
            <Ionicons name="qr-code" size={18} color={accentColor} />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>
            QR<Text style={{ color: accentColor }}>-la</Text>
          </Text>
        </TouchableOpacity>

        {/* Orta: Modül Sekmeleri (Masaüstü) */}
        {!isMobile && (
          <View
            style={[
              styles.moduleLinksRow,
              {
                backgroundColor: isDark ? '#090D16' : '#FAF7F2',
                borderColor: colors.border,
              },
            ]}
          >
            {MODULE_NAV_LINKS.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <TouchableOpacity
                  key={mod.id}
                  style={[
                    styles.moduleLinkPill,
                    isActive && {
                      backgroundColor: `${mod.color}20`,
                      borderColor: mod.color,
                    },
                  ]}
                  onPress={() => router.push(mod.route as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={mod.icon}
                    size={14}
                    color={isActive ? mod.color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.moduleLinkText,
                      { color: isActive ? colors.text : colors.textSecondary },
                      isActive && { fontWeight: '800' },
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

          {currentUser ? (
            <TouchableOpacity
              style={[styles.panelBtn, { backgroundColor: accentColor }]}
              onPress={() => router.push('/panel' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="apps-outline" size={15} color="#FFFFFF" />
              <Text style={styles.panelBtnText}>{isSmallPhone ? 'Panel' : 'Yönetim Paneli'}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push({ pathname: '/giris', params: { tab: 'login' } } as any)}
                activeOpacity={0.8}
              >
                <Text style={[styles.loginBtnText, { color: colors.textSecondary }]}>Giriş</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: accentColor }]}
                onPress={() => router.push({ pathname: '/giris', params: { tab: 'register' } } as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.startBtnText}>{isSmallPhone ? 'Başla' : 'Ücretsiz Başla'}</Text>
              </TouchableOpacity>
            </>
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
                    borderColor: isActive ? mod.color : colors.border,
                  },
                  isActive && { backgroundColor: `${mod.color}20` },
                ]}
                onPress={() => router.push(mod.route as any)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={mod.icon}
                  size={13}
                  color={isActive ? mod.color : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.mobileModuleText,
                    { color: isActive ? colors.text : colors.textSecondary },
                    isActive && { fontWeight: '800' },
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
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  moduleLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  moduleLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moduleLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  navRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  startBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  panelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  panelBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mobileModuleScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    overflow: 'scroll' as any,
  },
  mobileModulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  mobileModuleText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
