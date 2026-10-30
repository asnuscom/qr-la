import React from 'react';
import { render } from '@testing-library/react-native';
import VehicleLandingPage from '@/app/otomobil';

describe('VehicleLandingPage (/otomobil) Page Test', () => {
  it('renders correctly with hero badge and action buttons', async () => {
    const screen = await render(<VehicleLandingPage />);
    expect(screen.getByText('ARAÇ & MOTOSİKLET EKOSİSTEMİ')).toBeTruthy();
    expect(screen.getByText('Numaranı Maskele, Güvenle Park Et')).toBeTruthy();
    expect(screen.getByText('Araç Tagınızı Ücretsiz Oluşturun')).toBeTruthy();
  });
});
