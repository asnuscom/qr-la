import React from 'react';
import { render } from '@testing-library/react-native';
import QRStudioScreen from '@/app/panel/qr-studio';

describe('QRStudioScreen (/panel/qr-studio) Panel Test', () => {
  it('renders QR studio customizer screen', async () => {
    const screen = await render(<QRStudioScreen />);
    expect(screen).toBeDefined();
  });
});
