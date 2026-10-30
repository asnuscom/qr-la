import React from 'react';
import { render } from '@testing-library/react-native';
import MenuLandingPage from '@/app/menu';

describe('MenuLandingPage (/menu) Page Test', () => {
  it('renders correctly with restaurant menu ecosystem features and CTAs', async () => {
    const screen = await render(<MenuLandingPage />);
    expect(screen.getByText('RESTORAN & KAFE MENÜ EKOSİSTEMİ')).toBeTruthy();
    expect(screen.getByText('Akıllı QR Menü ile Masaları Canlandır')).toBeTruthy();
    expect(screen.getByText('Restoran Menünüzü Oluşturun')).toBeTruthy();
  });
});
