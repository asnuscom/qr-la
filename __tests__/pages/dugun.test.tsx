import React from 'react';
import { render } from '@testing-library/react-native';
import WeddingLandingPage from '@/app/dugun';

describe('WeddingLandingPage (/dugun) Page Test', () => {
  it('renders correctly with wedding event features and CTAs', async () => {
    const screen = await render(<WeddingLandingPage />);
    expect(screen.getByText('DÜĞÜN & ETKİNLİK EKOSİSTEMİ')).toBeTruthy();
    expect(screen.getByText('Anıları Salonda Canlı Topla')).toBeTruthy();
    expect(screen.getByText('Düğün QR’ınızı Ücretsiz Oluşturun')).toBeTruthy();
  });
});
