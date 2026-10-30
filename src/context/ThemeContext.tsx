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
  bg: '#F8FAFC',
  bgSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardMuted: '#F8FAFC',
  cardHighlight: '#FFFFFF',
  border: '#E2E8F0',
  borderMuted: '#CBD5E1',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  gold: '#6366F1',
  goldBg: 'rgba(99, 102, 241, 0.12)',
  goldBorder: 'rgba(99, 102, 241, 0.3)',
  navBg: 'rgba(255, 255, 255, 0.95)',
  footerBg: '#F1F5F9',
  inputBg: '#FFFFFF',
  surface: '#FFFFFF',
  accent: '#6366F1',
};

export const DARK_THEME: ThemeColors = {
  bg: '#090D16',
  bgSecondary: '#0F172A',
  card: '#111827',
  cardMuted: '#0F172A',
  cardHighlight: '#1E293B',
  border: '#1E293B',
  borderMuted: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  gold: '#6366F1',
  goldBg: 'rgba(99, 102, 241, 0.15)',
  goldBorder: 'rgba(99, 102, 241, 0.35)',
  navBg: 'rgba(9, 13, 22, 0.92)',
  footerBg: '#090D16',
  inputBg: '#0F172A',
  surface: '#0F172A',
  accent: '#6366F1',
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
