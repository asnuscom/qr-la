import { MenuThemeId } from '@/types';

export interface MenuThemeConfig {
  id: MenuThemeId;
  label: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  backgroundGradient: [string, string];
  cardBackground: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
  pillBg: string;
  priceColor: string;
}

export const MENU_THEMES: Record<MenuThemeId, MenuThemeConfig> = {
  bistro_dark: {
    id: 'bistro_dark',
    label: 'Kömür & Sıcak Bakır',
    badge: 'Modern Bistro & Bar',
    primaryColor: '#D97706',
    accentColor: '#F59E0B',
    backgroundGradient: ['#0A0B0E', '#14161F'],
    cardBackground: 'rgba(20, 22, 31, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#9CA3AF',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    pillBg: 'rgba(217, 119, 6, 0.12)',
    priceColor: '#FBBF24',
  },
  warm_amber: {
    id: 'warm_amber',
    label: 'Sıcak Ahşap & Kehribar',
    badge: 'Kafe, Fırın & Kahvaltı',
    primaryColor: '#EA580C',
    accentColor: '#FB923C',
    backgroundGradient: ['#120904', '#21130A'],
    cardBackground: 'rgba(33, 19, 10, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#FED7AA',
    borderColor: 'rgba(251, 146, 60, 0.25)',
    pillBg: 'rgba(234, 88, 12, 0.15)',
    priceColor: '#FDBA74',
  },
  emerald_oasis: {
    id: 'emerald_oasis',
    label: 'Zeytin Yeşili & Taş',
    badge: 'Akdeniz & Vegan',
    primaryColor: '#059669',
    accentColor: '#34D399',
    backgroundGradient: ['#04120B', '#092115'],
    cardBackground: 'rgba(9, 33, 21, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#A7F3D0',
    borderColor: 'rgba(52, 211, 153, 0.25)',
    pillBg: 'rgba(5, 150, 105, 0.15)',
    priceColor: '#6EE7B7',
  },
  crimson_grill: {
    id: 'crimson_grill',
    label: 'Koyu Bordo & Alev',
    badge: 'Steakhouse & Ocakbaşı',
    primaryColor: '#DC2626',
    accentColor: '#F87171',
    backgroundGradient: ['#140507', '#260B0E'],
    cardBackground: 'rgba(38, 11, 14, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#FECACA',
    borderColor: 'rgba(248, 113, 113, 0.25)',
    pillBg: 'rgba(220, 38, 38, 0.15)',
    priceColor: '#FCA5A5',
  },
  ocean_blue: {
    id: 'ocean_blue',
    label: 'Derin Ege & İnci',
    badge: 'Balık & Ege Mutfağı',
    primaryColor: '#0284C7',
    accentColor: '#38BDF8',
    backgroundGradient: ['#040E1A', '#091A30'],
    cardBackground: 'rgba(9, 26, 48, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#BAE6FD',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    pillBg: 'rgba(2, 132, 199, 0.15)',
    priceColor: '#7DD3FC',
  },
};

export function getMenuTheme(id?: string): MenuThemeConfig {
  if (id && id in MENU_THEMES) {
    return MENU_THEMES[id as MenuThemeId];
  }
  return MENU_THEMES.bistro_dark;
}
