import React from 'react';
import { render } from '@testing-library/react-native';
import PetLandingPage from '@/app/pati';

describe('PetLandingPage (/pati) Page Test', () => {
  it('renders correctly with Petguru collaboration badges and CTAs', async () => {
    const screen = await render(<PetLandingPage />);
    expect(screen.getByText('PETGURU x QR-LA EVCİL HAYVAN EKOSİSTEMİ')).toBeTruthy();
    expect(screen.getByText('Akıllı Künye ile Saniyeler İçinde Bulunsun')).toBeTruthy();
    expect(screen.getByText('Pati Künyenizi Ücretsiz Oluşturun')).toBeTruthy();
  });
});
