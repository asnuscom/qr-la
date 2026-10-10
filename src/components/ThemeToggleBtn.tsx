import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleBtnProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ThemeToggleBtn({ showLabel = false, size = 'md' }: ThemeToggleBtnProps) {
  const { isDark, toggleTheme, colors } = useTheme();

  const isSmall = size === 'sm';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSmall && styles.buttonSmall,
        {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          borderColor: colors.border,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.75}
      accessibilityLabel={isDark ? 'Aydınlık Temaya Geç' : 'Karanlık Temaya Geç'}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={isSmall ? 15 : 17}
        color={isDark ? '#F59E0B' : '#64748B'}
      />
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isDark ? 'Aydınlık' : 'Karanlık'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
