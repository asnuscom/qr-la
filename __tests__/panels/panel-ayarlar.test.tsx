import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '@/app/panel/ayarlar';

describe('SettingsScreen (/panel/ayarlar) Panel Test', () => {
  it('renders settings screen correctly', async () => {
    const screen = await render(<SettingsScreen />);
    expect(screen).toBeDefined();
  });
});
