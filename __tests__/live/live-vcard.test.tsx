import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import VCardRouteScreen from '@/app/k/[slug]';
import { vcardService } from '@/services/vcardService';

describe('Live Customer Screen: VCardRouteScreen (/k/[slug])', () => {
  it('renders vCard details when slug exists', async () => {
    jest.spyOn(vcardService, 'getCardBySlug').mockResolvedValueOnce({
      id: 'test-vcard-1',
      slug: 'test-slug',
      userId: 'user-1',
      fullName: 'Ahmet Yılmaz',
      jobTitle: 'Yazılım Mimarı',
      company: 'Tech A.Ş.',
      phone: '+90 532 000 00 00',
      email: 'ahmet@example.com',
      avatarUrl: '',
      theme: 'executive_dark',
      socials: {},
      bankAccounts: [],
      portfolioLinks: [],
      viewCount: 1,
      vcfDownloads: 0,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    });

    const screen = await render(<VCardRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeTruthy();
      expect(screen.getByText(/Yazılım Mimarı/i)).toBeTruthy();
    });
  });

  it('renders not found state when slug does not exist', async () => {
    jest.spyOn(vcardService, 'getCardBySlug').mockResolvedValueOnce(null);

    const screen = await render(<VCardRouteScreen />);

    await waitFor(() => {
      expect(screen.getByText('Kartvizit Bulunamadı')).toBeTruthy();
    });
  });
});
