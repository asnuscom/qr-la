import React from 'react';
import { render } from '@testing-library/react-native';
import QRCardScreen from '@/app/panel/qr-kart';

describe('QRCardScreen (/panel/qr-kart) Panel Test', () => {
  it('renders printable QR card screen', async () => {
    const screen = await render(<QRCardScreen />);
    expect(screen).toBeDefined();
  }, 20000);
});
