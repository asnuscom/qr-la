import React from 'react';
import { render } from '@testing-library/react-native';
import QROlusturScreen from '@/app/qr-olustur';

describe('QROlusturScreen (/qr-olustur) Page Test', () => {
  it('renders QR studio correctly', async () => {
    const screen = await render(<QROlusturScreen />);
    expect(screen).toBeDefined();
  });
});
