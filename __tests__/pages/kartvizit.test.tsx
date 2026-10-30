import React from 'react';
import { render } from '@testing-library/react-native';
import VCardLandingPage from '@/app/kartvizit';

describe('VCardLandingPage (/kartvizit) Page Test', () => {
  it('renders correctly with NFC card ecosystem details and CTAs', async () => {
    const screen = await render(<VCardLandingPage />);
    expect(screen.getByText('DİJİTAL KARTVİZİT & NFC EKOSİSTEMİ')).toBeTruthy();
    expect(screen.getByText('QR-la Rehbere Tek Tıkla Eklenir')).toBeTruthy();
    expect(screen.getByText('Dijital Kartvizitinizi Oluşturun')).toBeTruthy();
  });
});
