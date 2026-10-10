import React, { createContext, useContext, useEffect, useState } from 'react';
import { appStorage } from '@/services/storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  card: string;
  cardMuted: string;
  cardHighlight: string;
  border: string;
  borderMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  gold: string;
  goldBg: string;
  goldBorder: string;
  navBg: string;
  footerBg: string;
  inputBg: string;
  surface: string;
  accent: string;
}

export const LIGHT_THEME: ThemeColors = {
  bg: '#FAF7F2',
  bgSecondary: '#F3EFE6',
  card: '#FFFFFF',
  cardMuted: '#FAF5EA',
  cardHighlight: '#FFFDF9',
  border: '#EFE7DA',
  borderMuted: '#F5EFE6',
  text: '#1A1817',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  gold: '#C5A059',
  goldBg: 'rgba(197, 160, 89, 0.12)',
  goldBorder: 'rgba(197, 160, 89, 0.35)',
  navBg: 'rgba(255, 255, 255, 0.95)',
  footerBg: '#F3EFE6',
  inputBg: '#FFFFFF',
  surface: '#FAF7F2',
  accent: '#C5A059',
};

export const DARK_THEME: ThemeColors = {
  bg: '#090D16',
  bgSecondary: '#0F172A',
  card: '#131D31',
  cardMuted: '#0F172A',
  cardHighlight: '#1E293B',
  border: '#1E293B',
  borderMuted: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  gold: '#D4AF37',
  goldBg: 'rgba(212, 175, 55, 0.15)',
  goldBorder: 'rgba(212, 175, 55, 0.4)',
  navBg: 'rgba(15, 23, 42, 0.95)',
  footerBg: '#090D16',
  inputBg: '#0F172A',
  surface: '#0F172A',
  accent: '#D4AF37',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY_THEME = 'qr_la_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  isDark: false,
  colors: LIGHT_THEME,
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    try {
      const saved = appStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') {
        setModeState(saved);
      }
    } catch {}
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      appStorage.setItem(STORAGE_KEY_THEME, newMode);
    } catch {}
  };

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const isDark = mode === 'dark';
  const colors = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
