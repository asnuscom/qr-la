import { VCardThemeId } from '@/types';

export interface VCardThemeConfig {
  id: VCardThemeId;
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
  nfcCardBg: string;
  nfcText: string;
}

export const VCARD_THEMES: Record<VCardThemeId, VCardThemeConfig> = {
  executive_dark: {
    id: 'executive_dark',
    label: 'Karbon & Altın Varak',
    badge: 'Lüks Yönetici',
    primaryColor: '#C5A059',
    accentColor: '#E2C078',
    backgroundGradient: ['#0A0B0E', '#14171F'],
    cardBackground: 'rgba(20, 23, 31, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#9CA3AF',
    borderColor: 'rgba(197, 160, 89, 0.35)',
    pillBg: 'rgba(197, 160, 89, 0.12)',
    nfcCardBg: '#0F1117',
    nfcText: '#C5A059',
  },
  navy_prestige: {
    id: 'navy_prestige',
    label: 'Derin Lacivert & Safir',
    badge: 'Kurumsal Prestij',
    primaryColor: '#0284C7',
    accentColor: '#38BDF8',
    backgroundGradient: ['#051021', '#0B1E38'],
    cardBackground: 'rgba(11, 30, 56, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#93C5FD',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    pillBg: 'rgba(2, 132, 199, 0.15)',
    nfcCardBg: '#07162C',
    nfcText: '#38BDF8',
  },
  cyber_violet: {
    id: 'cyber_violet',
    label: 'Siber Mor & Neon',
    badge: 'Yaratıcı & Dijital',
    primaryColor: '#8B5CF6',
    accentColor: '#C084FC',
    backgroundGradient: ['#0D061A', '#1E0E3B'],
    cardBackground: 'rgba(30, 14, 59, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#D8B4FE',
    borderColor: 'rgba(192, 132, 252, 0.3)',
    pillBg: 'rgba(139, 92, 246, 0.15)',
    nfcCardBg: '#130924',
    nfcText: '#C084FC',
  },
  emerald_tech: {
    id: 'emerald_tech',
    label: 'Zümrüt Yeşili & Teknoloji',
    badge: 'Tech & Sürdürülebilir',
    primaryColor: '#10B981',
    accentColor: '#34D399',
    backgroundGradient: ['#03140C', '#072E1B'],
    cardBackground: 'rgba(7, 46, 27, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#A7F3D0',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    pillBg: 'rgba(16, 185, 129, 0.15)',
    nfcCardBg: '#051E13',
    nfcText: '#34D399',
  },
  rose_gold: {
    id: 'rose_gold',
    label: 'Gül Kurusu & Şampanya',
    badge: 'Zarafet & Moda',
    primaryColor: '#F43F5E',
    accentColor: '#FB7185',
    backgroundGradient: ['#17060B', '#310E1A'],
    cardBackground: 'rgba(49, 14, 26, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#FECDD3',
    borderColor: 'rgba(251, 113, 133, 0.3)',
    pillBg: 'rgba(244, 63, 94, 0.15)',
    nfcCardBg: '#1C0810',
    nfcText: '#FB7185',
  },
  polar_minimal: {
    id: 'polar_minimal',
    label: 'Polar Minimal & Slate',
    badge: 'Modern Minimal',
    primaryColor: '#64748B',
    accentColor: '#94A3B8',
    backgroundGradient: ['#0B0F17', '#1E293B'],
    cardBackground: 'rgba(30, 41, 59, 0.75)',
    textColor: '#FFFFFF',
    subtextColor: '#CBD5E1',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    pillBg: 'rgba(100, 116, 139, 0.15)',
    nfcCardBg: '#111827',
    nfcText: '#F1F5F9',
  },
};

export function getVCardTheme(id?: string): VCardThemeConfig {
  if (id && id in VCARD_THEMES) {
    return VCARD_THEMES[id as VCardThemeId];
  }
  return VCARD_THEMES.executive_dark;
}
